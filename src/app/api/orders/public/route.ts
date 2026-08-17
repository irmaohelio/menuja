import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { success, error } from '@/lib/api'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      storeSlug, customerName, customerPhone, deliveryType, paymentMethod,
      changeFor, items, customerAddress, customerNumber, customerComplement,
      customerNeighborhood, customerReference, notes
    } = body

    if (!storeSlug || !customerName || !items?.length) {
      return error('Dados incompletos')
    }

    const store = await prisma.store.findUnique({
      where: { slug: storeSlug },
      include: { settings: true },
    })

    if (!store) return error('Loja não encontrada', 404)
    if (!store.isOpen) return error('Loja fechada no momento')
    if (store.isTempClosed) return error(store.tempClosedMsg || 'Loja temporariamente fechada')

    // Calcular totais
    let subtotal = 0
    const itemsData = items.map((item: any) => {
      const itemTotal = item.unitPrice * item.quantity
      const optionsTotal = (item.options || []).reduce((s: number, o: any) => s + (o.price * (o.quantity || 1)), 0) * item.quantity
      subtotal += itemTotal + optionsTotal

      return {
        productId: item.productId || null,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: itemTotal + optionsTotal,
        notes: item.notes,
        sizeName: item.sizeName,
        crustName: item.crustName,
        halfHalf: item.halfHalf || false,
        flavor1: item.flavor1,
        flavor2: item.flavor2,
        options: {
          create: (item.options || []).map((o: any) => ({
            name: o.name,
            price: o.price || 0,
            quantity: o.quantity || 1,
          })),
        },
      }
    })

    const deliveryFee = deliveryType === 'delivery' ? (store.settings?.deliveryFee || 0) : 0
    const total = subtotal + deliveryFee

    // Gerar número do pedido
    const lastOrder = await prisma.order.findFirst({
      where: { storeId: store.id },
      orderBy: { orderNumber: 'desc' },
      select: { orderNumber: true },
    })
    const orderNumber = (lastOrder?.orderNumber || 0) + 1

    // Buscar ou criar cliente
    let customer = null
    if (customerPhone) {
      customer = await prisma.customer.findFirst({
        where: { storeId: store.id, phone: customerPhone },
      })
      if (!customer) {
        customer = await prisma.customer.create({
          data: { storeId: store.id, name: customerName, phone: customerPhone },
        })
      }
    }

    const order = await prisma.order.create({
      data: {
        storeId: store.id,
        customerId: customer?.id,
        orderNumber,
        customerName,
        customerPhone,
        customerAddress,
        customerNumber,
        customerComplement,
        customerNeighborhood,
        customerReference,
        deliveryType: deliveryType || 'delivery',
        paymentMethod: paymentMethod || 'cash',
        changeFor,
        subtotal,
        deliveryFee,
        total,
        notes,
        items: { create: itemsData },
        statusLog: { create: { status: 'received' } },
      },
      include: { items: { include: { options: true } } },
    })

    // Notificação
    await prisma.notification.create({
      data: {
        storeId: store.id,
        type: 'new_order',
        title: 'Novo pedido!',
        message: `Pedido #${orderNumber} - ${customerName} - R$ ${total.toFixed(2)}`,
        orderId: order.id,
      },
    })

    return success({ order })
  } catch (e: any) {
    return error(e.message || 'Erro ao criar pedido', 500)
  }
}
