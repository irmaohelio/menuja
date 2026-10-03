// Rate limit simples em memória (best-effort; em serverless é por instância).
type Entry = { count: number; resetAt: number }
const buckets = new Map<string, Entry>()

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now()
  const entry = buckets.get(key)

  if (!entry || entry.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true, retryAfter: 0 }
  }
  if (entry.count >= limit) {
    return { ok: false, retryAfter: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)) }
  }
  entry.count++
  return { ok: true, retryAfter: 0 }
}

export function clientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()
  return req.headers.get('x-real-ip') || 'unknown'
}

// Limpeza periódica para não crescer indefinidamente
if (typeof setInterval !== 'undefined') {
  const timer = setInterval(() => {
    const now = Date.now()
    for (const [k, v] of buckets) if (v.resetAt <= now) buckets.delete(k)
  }, 60_000)
  ;(timer as any).unref?.()
}
