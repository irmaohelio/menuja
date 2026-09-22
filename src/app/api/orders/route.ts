import { NextRequest } from 'next/server'
export const dynamic = 'force-dynamic'
import { getCurrentStore } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { success, error, unauthorized } from '@/lib/api'

export async function GET(req: NextRequest) {
  const store = await getCurrentStore()
  if (!store) return unauthorized()

  const status = req.nextUrl.searchParams.get('status')

  const where: any = { storeId: store.id }
  if (status) where.status = status

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      items: { include: { options: true } },
    },
    take: 100,
  })

  return success({ orders })
}

export async function PUT(req: NextRequest) {
  const store = await getCurrentStore()
  if (!store) return unauthorized()

  const { orderId, status } = await req.json()

  if (!orderId || !status) return error('ID do pedido e status são obrigatórios')

  const order = await prisma.order.findFirst({ where: { id: orderId, storeId: store.id } })
  if (!order) return error('Pedido não encontrado', 404)

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { status },
  })

  await prisma.orderStatusLog.create({
    data: { orderId, status },
  })

  return success({ order: updated })
}

export async function DELETE(req: NextRequest) {
  const store = await getCurrentStore()
  if (!store) return unauthorized()

  const { orderIds } = await req.json()

  if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
    return error('IDs dos pedidos são obrigatórios')
  }

  // Verificar se os pedidos pertencem à loja
  const orders = await prisma.order.findMany({
    where: { id: { in: orderIds }, storeId: store.id },
  })

  if (orders.length !== orderIds.length) {
    return error('Alguns pedidos não foram encontrados')
  }

  // Excluir pedidos e seus itens
  await prisma.orderItem.deleteMany({
    where: { orderId: { in: orderIds } },
  })

  await prisma.orderStatusLog.deleteMany({
    where: { orderId: { in: orderIds } },
  })

  await prisma.order.deleteMany({
    where: { id: { in: orderIds } },
  })

  return success({ deleted: orderIds.length })
}
