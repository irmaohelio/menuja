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
    // Buscar extras de uma categoria específica
    const category = await prisma.category.findFirst({ where: { id: categoryId, storeId: store.id } })
    if (!category) return error("Categoria não encontrada", 404)
    
    // Buscar o primeiro produto com extras desta categoria para usar como template
    const templateProduct = await prisma.product.findFirst({
      where: { storeId: store.id, categoryId },
      include: { optionGroups: { include: { options: true } } },
      orderBy: { createdAt: 'asc' },
    })
    
    const extras = templateProduct?.optionGroups?.[0]?.options?.map(o => ({
      name: o.name,
      price: String(o.price),
    })) || []

    return success({ extras })
  }

  // Buscar extras de todas as categorias
  const categories = await prisma.category.findMany({
    where: { storeId: store.id },
    include: {
      products: {
        include: { optionGroups: { include: { options: true } } },
        orderBy: { createdAt: 'asc' },
        take: 1,
      },
    },
  })

  const templates: Record<string, any[]> = {}
  for (const cat of categories) {
    const templateProduct = cat.products[0]
    templates[cat.id] = templateProduct?.optionGroups?.[0]?.options?.map(o => ({
      name: o.name,
      price: String(o.price),
    })) || []
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
