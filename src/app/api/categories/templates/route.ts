import { NextRequest } from 'next/server'
export const dynamic = 'force-dynamic'
import { getCurrentStore } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { success, error, unauthorized } from '@/lib/api'

// GET - Buscar extras da categoria
export async function GET(req: NextRequest) {
  const store = await getCurrentStore()
  if (!store) return unauthorized()

  const categoryId = req.nextUrl.searchParams.get("categoryId")
  
  if (categoryId) {
    const category = await prisma.category.findFirst({ where: { id: categoryId, storeId: store.id } })
    if (!category) return error("Categoria não encontrada", 404)
    
    const extras = (category.extrasTemplate as any[]) || []
    return success({ extras })
  }

  // Buscar extras de todas as categorias
  const categories = await prisma.category.findMany({
    where: { storeId: store.id },
  })

  const templates: Record<string, any[]> = {}
  for (const cat of categories) {
    templates[cat.id] = (cat.extrasTemplate as any[]) || []
  }

  return success({ templates })
}

// PUT - Atualizar extras da categoria e sincronizar com todos os produtos
export async function PUT(req: NextRequest) {
  const store = await getCurrentStore()
  if (!store) return unauthorized()

  const body = await req.json()
  const { categoryId, extras } = body

  if (!categoryId || !extras) return error("Dados incompletos")

  const category = await prisma.category.findFirst({ where: { id: categoryId, storeId: store.id } })
  if (!category) return error("Categoria não encontrada", 404)

  // Save template directly on category
  await prisma.category.update({
    where: { id: categoryId },
    data: { extrasTemplate: extras },
  })

  // Buscar todos os produtos desta categoria
  const products = await prisma.product.findMany({
    where: { storeId: store.id, categoryId },
    include: { optionGroups: true },
  })

  // Atualizar cada produto
  for (const product of products) {
    // Deletar grupos existentes
    await prisma.productOptionGroup.deleteMany({ where: { productId: product.id } })

    // Criar novo grupo se houver extras
    if (extras.length > 0) {
      const group = await prisma.productOptionGroup.create({
        data: {
          productId: product.id,
          storeId: store.id,
          name: "Adicionais",
          required: false,
          minQty: 0,
          maxQty: 20,
        },
      })

      await prisma.productOption.createMany({
        data: extras.map((extra: any, i: number) => ({
          groupId: group.id,
          name: extra.name,
          price: parseFloat(extra.price) || 0,
          isDefault: false,
          sortOrder: i,
        })),
      })
    }
  }

  return success({ message: `Extras atualizados em ${products.length} produto(s)`, count: products.length })
}
