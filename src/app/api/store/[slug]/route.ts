import { NextRequest } from 'next/server'
export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { success, error } from '@/lib/api'

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const store = await prisma.store.findUnique({
    where: { slug, isActive: true },
    include: {
      settings: true,
      businessHours: { orderBy: { dayOfWeek: 'asc' } },
      categories: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        include: {
          products: {
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
            include: {
              optionGroups: { include: { options: { orderBy: { sortOrder: 'asc' } } }, orderBy: { sortOrder: 'asc' } },
              pizzaSizes: { orderBy: { sortOrder: 'asc' }, include: { flavors: { orderBy: { sortOrder: 'asc' } } } },
            },
          },
        },
      },
      pizzaCrusts: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
    },
  })

  if (!store) return error('Loja não encontrada', 404)

  return success({ store })
}
