import { NextRequest } from 'next/server'
import { getCurrentStore } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { success, error, unauthorized } from '@/lib/api'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const store = await getCurrentStore()
  if (!store) return unauthorized()

  const { id } = await params
  const body = await req.json()

  const prod = await prisma.product.findFirst({ where: { id, storeId: store.id } })
  if (!prod) return error('Produto não encontrado', 404)

  const updateData: any = {
      name: body.name,
      description: body.description,
      image: body.image,
      price: body.price,
      promoPrice: body.promoPrice,
      categoryId: body.categoryId,
      isActive: body.isActive,
      isFeatured: body.isFeatured,
      isPizza: body.isPizza,
  }
  if (body.sizesBackup !== undefined) updateData.sizesBackup = body.sizesBackup

  const product = await prisma.product.update({
    where: { id },
    data: updateData,
  })

  // Atualizar grupos de opções
  if (body.optionGroups !== undefined) {
    await prisma.productOptionGroup.deleteMany({ where: { productId: id } })
    if (body.optionGroups?.length) {
      for (const group of body.optionGroups) {
        const created = await prisma.productOptionGroup.create({
          data: {
            productId: id,
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
  }

  // Atualizar tamanhos de pizza
  if (body.pizzaSizes !== undefined) {
    const existingIds = body.pizzaSizes.filter((s: any) => s.id).map((s: any) => s.id)
    // Deletar tamanhos que não estão mais na lista
    await prisma.pizzaSize.deleteMany({ where: { productId: id, NOT: { id: { in: [...existingIds] } } } })
    for (let i = 0; i < body.pizzaSizes.length; i++) {
      const size = body.pizzaSizes[i]
      if (size.id) {
        // Atualizar existente
        await prisma.pizzaSize.update({
          where: { id: size.id },
          data: { name: size.name, price: size.price, isActive: size.isActive !== false, sortOrder: i },
        })
      } else {
        // Criar novo
        await prisma.pizzaSize.create({
          data: { productId: id, name: size.name, price: size.price, isActive: true, sortOrder: i },
        })
      }
    }
  }

  // Atualizar bordas de pizza
  if (body.pizzaCrusts !== undefined) {
    await prisma.pizzaCrust.deleteMany({ where: { storeId: store.id } })
    if (body.pizzaCrusts?.length) {
      for (const crust of body.pizzaCrusts) {
        await prisma.pizzaCrust.create({
          data: { storeId: store.id, name: crust.name, price: crust.price || 0 },
        })
      }
    }
  }

  return success({ product })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const store = await getCurrentStore()
  if (!store) return unauthorized()

  const { id } = await params
  const prod = await prisma.product.findFirst({ where: { id, storeId: store.id } })
  if (!prod) return error('Produto não encontrado', 404)

  await prisma.product.delete({ where: { id } })
  return success({ message: 'Produto excluído' })
}
