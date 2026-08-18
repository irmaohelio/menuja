
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient({ datasources: { db: { url: 'file:./prisma/dev.db' } } })

async function main() {
  const store = await prisma.store.findUnique({
    where: { slug: 'pizzaria-santos' },
    include: {
      categories: {
        include: { products: { orderBy: { sortOrder: 'asc' } } },
        orderBy: { sortOrder: 'asc' }
      }
    }
  })
  
  if (!store) { console.log('Store not found'); return }
  
  for (const cat of store.categories) {
    console.log(`\n📁 ${cat.name} (id: ${cat.id})`)
    for (const p of cat.products) {
      console.log(`  - ${p.name} (R$ ${p.price}) active:${p.isActive} pizza:${p.isPizza}`)
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
