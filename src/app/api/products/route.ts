import { NextRequest } from 'next/server'
export const dynamic = 'force-dynamic'
import { getCurrentStore } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { success, error, unauthorized } from '@/lib/api'

export async function GET() {
  const store = await getCurrentStore()
  if (!store) return unauthorized()

  const products = await prisma.product.findMany({
    where: { storeId: store.id },
    orderBy: { sortOrder: 'asc' },
    include: {
      category: { select: { name: true } },
      optionGroups: { include: { options: true } },
      pizzaSizes: { orderBy: { sortOrder: 'asc' }, include: { flavors: true } },
    },
  })

  return success({ products })
}

export async function POST(req: NextRequest) {
  const store = await getCurrentStore()
  if (!store) return unauthorized()

  const body = await req.json()
  if (!body.name || body.price === undefined) return error('Nome e preço são obrigatórios')

  const maxOrder = await prisma.product.findFirst({
    where: { storeId: store.id },
    orderBy: { sortOrder: 'desc' },
    select: { sortOrder: true },
  })

  const product = await prisma.product.create({
    data: {
      storeId: store.id,
      categoryId: body.categoryId || null,
      name: body.name,
      description: body.description,
      image: body.image,
      price: body.price,
      promoPrice: body.promoPrice,
      isFeatured: body.isFeatured || false,
      isPizza: body.isPizza || false,
      sortOrder: (maxOrder?.sortOrder ?? -1) + 1,
    },
  })

  // Criar grupos de opções se fornecidos
  if (body.optionGroups?.length) {
    for (const group of body.optionGroups) {
      const created = await prisma.productOptionGroup.create({
        data: {
          productId: product.id,
          storeId: store.id,
          name: group.name,
          required: group.required || false,
          minQty: group.minQty || 0,
          maxQty: group.maxQty || 1,
        },
      })
      if (group.options?.length) {
        await prisma.productOption.createMany({
          data: group.options.map((opt: any, i: number) => ({
            groupId: created.id,
            name: opt.name,
            price: opt.price || 0,
            isDefault: opt.isDefault || false,
            sortOrder: i,
          })),
        })
      }
    }
  }

  // Criar tamanhos de pizza se fornecidos
  if (body.pizzaSizes?.length) {
    for (const size of body.pizzaSizes) {
      await prisma.pizzaSize.create({
        data: {
          productId: product.id,
          name: size.name,
          price: size.price,
        },
      })
    }
  }

  // Criar bordas de pizza se fornecidas
  if (body.pizzaCrusts?.length) {
    for (const crust of body.pizzaCrusts) {
      await prisma.pizzaCrust.create({
        data: {
          storeId: store.id,
          name: crust.name,
          price: crust.price || 0,
        },
      })
    }
  }

  return success({ product })
}
