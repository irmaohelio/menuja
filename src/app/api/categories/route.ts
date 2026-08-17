import { NextRequest } from 'next/server'
export const dynamic = 'force-dynamic'
import { getCurrentStore } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { success, error, unauthorized } from '@/lib/api'

export async function GET() {
  const store = await getCurrentStore()
  if (!store) return unauthorized()

  const categories = await prisma.category.findMany({
    where: { storeId: store.id },
    orderBy: { sortOrder: 'asc' },
    include: { _count: { select: { products: true } } },
  })

  return success({ categories })
}

export async function POST(req: NextRequest) {
  const store = await getCurrentStore()
  if (!store) return unauthorized()

  const body = await req.json()
  if (!body.name) return error('Nome é obrigatório')

  const maxOrder = await prisma.category.findFirst({
    where: { storeId: store.id },
    orderBy: { sortOrder: 'desc' },
    select: { sortOrder: true },
  })

  const category = await prisma.category.create({
    data: {
      storeId: store.id,
      name: body.name,
      description: body.description,
      image: body.image,
      type: body.type || 'standard',
      sortOrder: (maxOrder?.sortOrder ?? -1) + 1,
    },
  })

  return success({ category })
}
