import { NextRequest } from 'next/server'
import sharp from 'sharp'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Gera o ícone da loja (a partir do logo) no próprio domínio e no tamanho certo,
// para o Chrome aceitar como ícone do app instalável.
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const sizeParam = parseInt(req.nextUrl.searchParams.get('size') || '512')
  const size = Math.min(1024, Math.max(48, Number.isNaN(sizeParam) ? 512 : sizeParam))
  const maskable = req.nextUrl.searchParams.get('maskable') === '1'
  const fallback = new URL(`/icons/icon-${size >= 512 ? 512 : 192}.png`, req.url)

  const store = await prisma.store.findUnique({ where: { slug }, select: { logo: true } })
  if (!store?.logo) return NextResponse.redirect(fallback)

  try {
    const res = await fetch(store.logo)
    if (!res.ok) throw new Error('logo fetch failed')
    const buffer = Buffer.from(await res.arrayBuffer())

    const pad = maskable ? Math.round(size * 0.1) : 0
    const inner = size - pad * 2

    const png = await sharp(buffer)
      .resize(inner, inner, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .extend({ top: pad, bottom: pad, left: pad, right: pad, background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .png()
      .toBuffer()

    return new Response(png, {
      headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=86400, immutable' },
    })
  } catch {
    return NextResponse.redirect(fallback)
  }
}
