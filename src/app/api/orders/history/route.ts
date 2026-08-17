import { NextRequest } from 'next/server'
export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { success, error } from '@/lib/api'

export async function GET(req: NextRequest) {
  const phone = req.nextUrl.searchParams.get("phone")
  const storeSlug = req.nextUrl.searchParams.get("store")

  if (!phone || !storeSlug) return error("Telefone e loja obrigatórios")

  const store = await prisma.store.findUnique({ where: { slug: storeSlug } })
  if (!store) return error("Loja não encontrada", 404)

  const orders = await prisma.order.findMany({
    where: { storeId: store.id, customerPhone: phone },
    orderBy: { createdAt: "desc" },
    include: { items: { include: { options: true } } },
    take: 50,
  })

  return success({ orders })
}
