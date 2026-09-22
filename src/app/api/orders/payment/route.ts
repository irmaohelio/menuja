import { NextRequest } from 'next/server'
import { getCurrentStore } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { success, error, unauthorized } from '@/lib/api'

export async function POST(req: NextRequest) {
  const store = await getCurrentStore()
  if (!store) return unauthorized()

  const { orderId, action } = await req.json()
  if (!orderId || !action) return error('ID do pedido e ação são obrigatórios')

  const order = await prisma.order.findFirst({ where: { id: orderId, storeId: store.id } })
  if (!order) return error('Pedido não encontrado', 404)

  if (action === 'confirm') {
    await prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: 'confirmed' },
    })
    await prisma.notification.create({
      data: {
        storeId: store.id,
        type: 'payment_confirmed',
        title: 'Pagamento confirmado',
        message: `Pedido #${order.orderNumber} - pagamento confirmado`,
        orderId: order.id,
      },
    })
    return success({ message: 'Pagamento confirmado' })
  }

  if (action === 'reject') {
    await prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: 'rejected' },
    })
    return success({ message: 'Pagamento recusado' })
  }

  return error('Ação inválida')
}
