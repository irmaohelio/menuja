import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const store = await prisma.store.findUnique({
    where: { slug },
    select: { name: true, slug: true, logo: true, primaryColor: true, isActive: true, isBlocked: true },
  })

  // Headers iguais aos de um manifest.json estático (foi o formato que o Chrome aceitou)
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'public, max-age=0, must-revalidate',
  }

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
      // Ícones gerados a partir do logo da loja, servidos no próprio domínio
      // (se a loja não tiver logo, o endpoint cai no ícone padrão do MenuJá).
      { src: `/api/store/${store.slug}/icon?size=192`, sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: `/api/store/${store.slug}/icon?size=512`, sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: `/api/store/${store.slug}/icon?size=512&maskable=1`, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }

  return new Response(JSON.stringify(manifest), { headers })
}
