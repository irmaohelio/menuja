import { NextRequest } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { success, error } from '@/lib/api'
import { isWithinBusinessHours } from '@/lib/business-hours'
import { findStoreCustomer, attachCustomerIdentifiers, createStoreCustomer, normalizeEmail, normalizePhone } from '@/lib/customers'
import { rateLimit, clientIp } from '@/lib/rate-limit'
import { validateCoupon } from '@/lib/coupons'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      storeSlug, customerName, customerPhone, customerEmail, deliveryType, paymentMethod,
      changeFor, items, customerAddress, customerNumber, customerComplement,
      customerNeighborhood, customerCity, customerState, customerReference, notes, scheduledDate,
      couponCode
    } = body

    if (!storeSlug || !customerName || !items?.length) {
      return error('Dados incompletos')
    }

    // Anti-spam: limita a quantidade de pedidos por IP
    const rl = rateLimit(`order:ip:${clientIp(req)}`, 20, 10 * 60 * 1000)
    if (!rl.ok) {
      return error(`Muitos pedidos em sequência. Aguarde ${rl.retryAfter}s.`, 429)
    }

    const store = await prisma.store.findUnique({
      where: { slug: storeSlug },
      include: { settings: true, businessHours: true },
    })

    if (!store) return error('Loja não encontrada', 404)
    if (store.isTempClosed) return error(store.tempClosedMsg || 'Loja temporariamente fechada')
    // Open/closed is driven by the configured business hours, not the legacy manual toggle.
    // Stores without configured hours are considered open (matches the storefront behavior).
    if (store.businessHours.length > 0 && !isWithinBusinessHours(store.businessHours)) {
      return error('Loja fechada no momento')
    }

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

    // Cupom de desconto (validado no servidor)
    let discount = 0
    let appliedCoupon: { id: string; code: string } | null = null
    if (couponCode) {
      const result = await validateCoupon(store.id, couponCode, subtotal)
      if (!result.ok) return error(result.error)
      discount = result.discount
      appliedCoupon = { id: result.coupon.id, code: result.coupon.code }
    }

    const total = Math.max(0, subtotal - discount + deliveryFee)

    // Resolver cliente sempre restrito a esta loja (evita vínculo entre lojas).
    // Identidade unificada por e-mail OU telefone — nunca duplica a mesma pessoa.
    const cleanEmail = normalizeEmail(customerEmail)
    const cleanPhone = normalizePhone(customerPhone)

    let customer = null
    if (body.customerId) {
      customer = await prisma.customer.findFirst({
        where: { id: body.customerId, storeId: store.id },
      })
    }
    if (!customer) {
      customer = await findStoreCustomer(store.id, { email: cleanEmail, phone: cleanPhone })
    }
    if (customer) {
      // Anexa o identificador que ainda faltava (ex.: cliente entrou com Google e agora informou o telefone)
      customer = await attachCustomerIdentifiers(customer, { email: cleanEmail, phone: cleanPhone })
    } else {
      if (!cleanEmail && !cleanPhone) {
        return error('Informe um telefone ou entre com sua conta Google')
      }
      customer = await createStoreCustomer(store.id, {
        name: customerName,
        email: cleanEmail,
        phone: cleanPhone,
      })
    }

    // Cria o pedido com número sequencial; em caso de corrida (dois pedidos ao mesmo tempo),
    // a constraint única (storeId, orderNumber) garante que não repete número.
    let order: any = null
    for (let attempt = 0; attempt < 5 && !order; attempt++) {
      const lastOrder = await prisma.order.findFirst({
        where: { storeId: store.id },
        orderBy: { orderNumber: 'desc' },
        select: { orderNumber: true },
      })
      const orderNumber = (lastOrder?.orderNumber || 0) + 1
      try {
        order = await prisma.order.create({
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
            customerCity,
            customerState,
            customerReference,
            deliveryType: deliveryType || 'delivery',
            paymentMethod: paymentMethod || 'cash',
            changeFor,
            subtotal,
            deliveryFee,
            discount,
            couponCode: appliedCoupon?.code || null,
            total,
            notes,
            scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
            paymentStatus: scheduledDate ? 'awaiting_proof' : null,
            items: { create: itemsData },
            statusLog: { create: { status: 'received' } },
          },
          include: { items: { include: { options: true } } },
        })
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') continue
        throw e
      }
    }
    if (!order) return error('Não foi possível gerar o pedido. Tente novamente.', 500)

    // Registra o uso do cupom
    if (appliedCoupon) {
      await prisma.coupon.update({ where: { id: appliedCoupon.id }, data: { usedCount: { increment: 1 } } })
    }

    // Salvar endereço do cliente
    if (customer && customerAddress) {
      const existingAddress = await prisma.customerAddress.findFirst({
        where: {
          customerId: customer.id,
          address: customerAddress,
          number: customerNumber || null,
        },
      })

      if (!existingAddress) {
        await prisma.customerAddress.create({
          data: {
            customerId: customer.id,
            address: customerAddress,
            number: customerNumber,
            complement: customerComplement,
            neighborhood: customerNeighborhood,
            city: customerCity,
            state: customerState,
            reference: customerReference,
            isDefault: true,
          },
        })
      }
    }

    // Notificação
    await prisma.notification.create({
      data: {
        storeId: store.id,
        type: 'new_order',
        title: 'Novo pedido!',
        message: `Pedido #${order.orderNumber} - ${customerName} - R$ ${total.toFixed(2)}`,
        orderId: order.id,
      },
    })

    return success({ order })
  } catch (e: any) {
    return error(e.message || 'Erro ao criar pedido', 500)
  }
}
