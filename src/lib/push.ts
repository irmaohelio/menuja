import webpush from 'web-push'
import { prisma } from './prisma'

let configured = false
let enabled = false

function ensureConfigured() {
  if (configured) return enabled
  configured = true
  const publicKey = process.env.VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  const subject = process.env.VAPID_SUBJECT || 'mailto:suporte@menuja.app.br'
  if (!publicKey || !privateKey) {
    enabled = false
    return false
  }
  try {
    webpush.setVapidDetails(subject, publicKey, privateKey)
    enabled = true
  } catch (e) {
    console.error('[PUSH] VAPID inválido:', e)
    enabled = false
  }
  return enabled
}

export function pushEnabled() {
  return ensureConfigured()
}

// Envia notificação push para todos os aparelhos inscritos da loja
export async function sendStorePush(storeId: string, payload: { title: string; body: string; url?: string; tag?: string }) {
  if (!ensureConfigured()) return

  const subs = await prisma.pushSubscription.findMany({ where: { storeId } })
  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          JSON.stringify(payload),
        )
      } catch (e: any) {
        // Inscrição expirada/inválida: remove
        if (e?.statusCode === 404 || e?.statusCode === 410) {
          await prisma.pushSubscription.delete({ where: { id: s.id } }).catch(() => {})
        }
      }
    }),
  )
}
