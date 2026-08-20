const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const store = await prisma.store.findFirst({ where: { slug: 'acaiteria-santos' } })
  if (!store) { console.log('LOJA NÃO ENCONTRADA'); return }

  // Find Sorvete category
  const sorveteCat = await prisma.category.findFirst({
    where: { storeId: store.id, name: 'Sorvete' }
  })

  if (!sorveteCat) { console.log('Categoria Sorvete não encontrada'); return }

  // Delete all products in Sorvete category (1 Bola, 2 Bolas, 3 Bolas)
  const products = await prisma.product.findMany({
    where: { categoryId: sorveteCat.id }
  })

  for (const p of products) {
    // Delete option groups and options first
    const groups = await prisma.productOptionGroup.findMany({
      where: { productId: p.id },
      include: { options: true }
    })
    for (const g of groups) {
      await prisma.productOption.deleteMany({ where: { groupId: g.id } })
    }
    await prisma.productOptionGroup.deleteMany({ where: { productId: p.id } })
    
    // Delete pizza sizes if any
    await prisma.pizzaSize.deleteMany({ where: { productId: p.id } })
    
    // Delete the product
    await prisma.product.delete({ where: { id: p.id } })
    console.log('Produto removido:', p.name)
  }

  console.log('\n✅ Categoria Sorvete limpa! Agora usa o SorveteBuilder.')
}

main().then(() => prisma.$disconnect())
