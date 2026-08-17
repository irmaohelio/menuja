import { getCurrentStore } from '@/lib/auth'
export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { success, unauthorized } from '@/lib/api'

export async function GET() {
  const store = await getCurrentStore()
  if (!store) return unauthorized()

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const weekAgo = new Date(today)
  weekAgo.setDate(weekAgo.getDate() - 7)

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)

  const [todayOrders, weekOrders, monthOrders, totalProducts, totalCategories] = await Promise.all([
    prisma.order.findMany({
      where: { storeId: store.id, createdAt: { gte: today }, status: { not: 'cancelled' } },
      select: { total: true },
    }),
    prisma.order.findMany({
      where: { storeId: store.id, createdAt: { gte: weekAgo }, status: { not: 'cancelled' } },
      select: { total: true },
    }),
    prisma.order.findMany({
      where: { storeId: store.id, createdAt: { gte: monthStart }, status: { not: 'cancelled' } },
      select: { total: true },
    }),
    prisma.product.count({ where: { storeId: store.id, isActive: true } }),
    prisma.category.count({ where: { storeId: store.id, isActive: true } }),
  ])

  const sum = (arr: { total: number }[]) => arr.reduce((s, o) => s + o.total, 0)

  const pendingOrders = await prisma.order.count({
    where: { storeId: store.id, status: { in: ['received', 'confirmed', 'preparing'] } },
  })

  return success({
    todayRevenue: sum(todayOrders),
    weekRevenue: sum(weekOrders),
    monthRevenue: sum(monthOrders),
    todayOrders: todayOrders.length,
    weekOrders: weekOrders.length,
    monthOrders: monthOrders.length,
    totalProducts,
    totalCategories,
    pendingOrders,
    isOpen: store.isOpen,
  })
}
