import { getCurrentUser } from '@/lib/auth'
export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { success, unauthorized, error } from '@/lib/api'
import { NextRequest } from 'next/server'

async function requireMaster() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'master') return null
  return user
}

export async function GET() {
  const user = await requireMaster()
  if (!user) return unauthorized()

  const [totalStores, activeStores, totalOrders, totalUsers] = await Promise.all([
    prisma.store.count(),
    prisma.store.count({ where: { isActive: true } }),
    prisma.order.count(),
    prisma.user.count(),
  ])

  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  const monthOrders = await prisma.order.findMany({
    where: { createdAt: { gte: monthStart }, status: { not: 'cancelled' } },
    select: { total: true },
  })
  const monthRevenue = monthOrders.reduce((s, o) => s + o.total, 0)

  const stores = await prisma.store.findMany({
    include: {
      user: { select: { name: true, email: true } },
      _count: { select: { orders: true, products: true, customers: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return success({ totalStores, activeStores, totalOrders, totalUsers, monthRevenue, stores })
}

export async function PUT(req: NextRequest) {
  const user = await requireMaster()
  if (!user) return unauthorized()

  const { storeId, isActive } = await req.json()

  await prisma.store.update({ where: { id: storeId }, data: { isActive } })

  return success({ message: 'Loja atualizada' })
}

export async function DELETE(req: NextRequest) {
  const user = await requireMaster()
  if (!user) return unauthorized()

  const { storeId } = await req.json()

  // Delete in order due to foreign keys
  await prisma.orderItem.deleteMany({ where: { order: { storeId } } })
  await prisma.order.deleteMany({ where: { storeId } })
  await prisma.product.deleteMany({ where: { storeId } })
  await prisma.category.deleteMany({ where: { storeId } })
  await prisma.customer.deleteMany({ where: { storeId } })
  await prisma.businessHour.deleteMany({ where: { storeId } })
  await prisma.storeHighlight.deleteMany({ where: { storeId } })
  await prisma.notification.deleteMany({ where: { storeId } })
  await prisma.pizzaCrust.deleteMany({ where: { storeId } })
  await prisma.storeSettings.deleteMany({ where: { storeId } })
  await prisma.store.delete({ where: { id: storeId } })

  return success({ message: 'Loja excluída' })
}
