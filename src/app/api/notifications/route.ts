import { getCurrentStore } from '@/lib/auth'
export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { success, unauthorized } from '@/lib/api'

export async function GET() {
  const store = await getCurrentStore()
  if (!store) return unauthorized()

  const notifications = await prisma.notification.findMany({
    where: { storeId: store.id },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })

  const unread = await prisma.notification.count({
    where: { storeId: store.id, isRead: false },
  })

  return success({ notifications, unread })
}

export async function PUT() {
  const store = await getCurrentStore()
  if (!store) return unauthorized()

  await prisma.notification.updateMany({
    where: { storeId: store.id, isRead: false },
    data: { isRead: true },
  })

  return success({ message: 'Notificações marcadas como lidas' })
}
