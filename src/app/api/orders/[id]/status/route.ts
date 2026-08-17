import { NextRequest } from 'next/server'
export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { success, error } from '@/lib/api'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const order = await prisma.order.findUnique({
    where: { id },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      total: true,
      createdAt: true,
      items: { select: { productName: true, quantity: true } },
      statusLog: { select: { status: true, createdAt: true }, orderBy: { createdAt: 'asc' } },
    },
  })

  if (!order) return error('Pedido não encontrado', 404)

  return success({ order })
}
