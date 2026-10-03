import { NextRequest } from 'next/server'
import { getCurrentStore } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { success, error, unauthorized } from '@/lib/api'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const store = await getCurrentStore()
  if (!store) return unauthorized()

  const sub = await req.json().catch(() => null)
  const endpoint = sub?.endpoint
  const p256dh = sub?.keys?.p256dh
  const auth = sub?.keys?.auth

  if (!endpoint || !p256dh || !auth) return error('Inscrição inválida')

  await prisma.pushSubscription.upsert({
    where: { endpoint },
    update: { storeId: store.id, p256dh, auth },
    create: { storeId: store.id, endpoint, p256dh, auth },
  })

  return success({ subscribed: true })
}
