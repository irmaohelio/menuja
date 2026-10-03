import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const store = await prisma.store.findUnique({
    where: { slug },
    select: { name: true, logo: true, primaryColor: true },
  })
  if (!store) return {}

  return {
    title: `${store.name} — Cardápio e Delivery`,
    description: `Peça online em ${store.name}. Cardápio digital e delivery rápido.`,
    manifest: `/api/store/${slug}/manifest`,
    icons: store.logo ? { icon: [{ url: store.logo }], apple: [{ url: store.logo }] } : undefined,
  }
}

export default function LojaLayout({ children }: { children: React.ReactNode }) {
  return children
}
