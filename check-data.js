const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const store = await prisma.store.findUnique({ where: { slug: 'pizzaria-santos' } })
  if (!store) { console.log('Store not found'); return }

  // Check existing option groups
  const groups = await prisma.productOptionGroup.findMany({
    where: { storeId: store.id },
    include: { options: true, product: true }
  })
  console.log('Existing option groups:', groups.length)
  for (const g of groups) {
    console.log('  [' + g.product.name + '] ' + g.name + ':', g.options.map(o => o.name + ' R$' + o.price).join(', '))
  }

  // Get all products
  const products = await prisma.product.findMany({ where: { storeId: store.id } })

  // Check what categories exist
  const categories = await prisma.category.findMany({ where: { storeId: store.id } })
  console.log('\nCategories:', categories.map(c => c.name).join(', '))

  // Check products per category
  for (const cat of categories) {
    const prods = products.filter(p => p.categoryId === cat.id)
    console.log('  ' + cat.name + ':', prods.map(p => p.name + ' R$' + p.price).join(', '))
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
