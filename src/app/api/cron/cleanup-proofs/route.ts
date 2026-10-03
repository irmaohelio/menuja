import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { success, error } from '@/lib/api'
import { deleteBlobs } from '@/lib/blob'

export const dynamic = 'force-dynamic'

// Comprovantes de pagamento mais antigos que isso são removidos do Blob
const RETENTION_DAYS = 30

export async function GET(req: NextRequest) {
  // Protege o endpoint quando CRON_SECRET estiver configurado
  // (a Vercel envia automaticamente "Authorization: Bearer <CRON_SECRET>")
  const secret = process.env.CRON_SECRET
  if (secret) {
    const auth = req.headers.get('authorization')
    if (auth !== `Bearer ${secret}`) return error('Unauthorized', 401)
  }

  const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000)

  // Só limpa comprovantes de pedidos antigos cujo pagamento não está mais em análise
  const orders = await prisma.order.findMany({
    where: {
      paymentProofUrl: { not: null },
      createdAt: { lt: cutoff },
      paymentStatus: { not: 'proof_submitted' },
    },
    select: { id: true, paymentProofUrl: true },
  })

  const blobsRemoved = await deleteBlobs(orders.map((o) => o.paymentProofUrl))

  if (orders.length > 0) {
    await prisma.order.updateMany({
      where: { id: { in: orders.map((o) => o.id) } },
      data: { paymentProofUrl: null },
    })
  }

  return success({ retentionDays: RETENTION_DAYS, ordersCleared: orders.length, blobsRemoved })
}
