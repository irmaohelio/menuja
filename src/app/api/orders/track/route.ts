import { NextRequest } from 'next/server'
export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { success, error } from '@/lib/api'

export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get("id")
  const phone = req.nextUrl.searchParams.get("phone")

  if (!orderId) return error("ID do pedido obrigatório")

  const where: any = { id: orderId }
  if (phone) where.customerPhone = phone

  const order = await prisma.order.findFirst({
    where,
    include: {
      items: { include: { options: true } },
      statusLog: { orderBy: { createdAt: "asc" } },
      store: { select: { name: true, slug: true, whatsapp: true, phone: true } },
    },
  })

  if (!order) return error("Pedido não encontrado", 404)

  return success({ order })
}
