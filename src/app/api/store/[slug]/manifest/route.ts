import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const store = await prisma.store.findUnique({
    where: { slug },
    select: { name: true, slug: true, logo: true, primaryColor: true, isActive: true, isBlocked: true },
  })

  const headers = { 'Content-Type': 'application/manifest+json', 'Cache-Control': 'no-store' }

  if (!store || !store.isActive || store.isBlocked) {
    return new Response(JSON.stringify({ name: 'MenuJá', short_name: 'MenuJá', start_url: '/', display: 'standalone' }), { headers })
  }

  const name = store.name?.trim() || store.slug

  const manifest = {
    name,
    short_name: name.slice(0, 15),
    description: `${name} — cardápio e delivery`,
    start_url: `/loja/${store.slug}`,
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#ffffff',
    theme_color: store.primaryColor || '#e11d48',
    lang: 'pt-BR',
    icons: [
      // Ícones servidos do próprio domínio (o Chrome exige isso para considerar instalável)
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }

  return new Response(JSON.stringify(manifest), { headers })
}
