import { NextRequest } from 'next/server'
import { put } from '@vercel/blob'
import sharp from 'sharp'
import { prisma } from '@/lib/prisma'
import { success, error } from '@/lib/api'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const orderId = formData.get('orderId') as string

    if (!file || !orderId) return error('Arquivo e ID do pedido são obrigatórios')

    const order = await prisma.order.findUnique({ where: { id: orderId } })
    if (!order) return error('Pedido não encontrado', 404)

    // Convert and resize
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const resized = await sharp(buffer)
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer()

    const filename = `payment-proofs/${orderId}-${Date.now()}.jpg`
    const blob = await put(filename, resized, {
      access: 'public',
      contentType: 'image/jpeg',
    })

    // Update order with proof
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentProofUrl: blob.url,
        paymentStatus: 'proof_submitted',
      },
    })

    // Notify store
    await prisma.notification.create({
      data: {
        storeId: order.storeId,
        type: 'payment_proof',
        title: 'Comprovante recebido!',
        message: `Pedido #${order.orderNumber} - ${order.customerName} enviou comprovante de pagamento`,
        orderId: order.id,
      },
    })

    return success({ url: blob.url })
  } catch (e: any) {
    return error(e.message || 'Erro ao enviar comprovante', 500)
  }
}
