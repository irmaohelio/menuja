const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const store = await prisma.store.findFirst({ where: { slug: 'acaiteria-santos' } });
  if (!store) { console.log('LOJA NÃO ENCONTRADA'); return; }
  console.log('Loja:', store.name, '| ID:', store.id, '| Segment:', store.segment);
  
  const cats = await prisma.category.findMany({ where: { storeId: store.id }, orderBy: { sortOrder: 'asc' } });
  for (const cat of cats) {
    console.log('\n=== ' + cat.name + ' (type:' + cat.type + ', sortOrder:' + cat.sortOrder + ') ===');
    const prods = await prisma.product.findMany({ where: { categoryId: cat.id }, orderBy: { sortOrder: 'asc' } });
    for (const p of prods) {
      console.log('  - ' + p.name + ' | R$' + p.price + ' | isPizza:' + p.isPizza + ' | active:' + p.isActive);
      const sizes = await prisma.pizzaSize.findMany({ where: { productId: p.id } });
      if (sizes.length > 0) {
        for (const s of sizes) {
          console.log('    -> ' + s.name + ' R$' + s.price + ' slices:' + s.slices);
        }
      }
      const groups = await prisma.productOptionGroup.findMany({ where: { productId: p.id }, include: { options: true } });
      if (groups.length > 0) {
        for (const g of groups) {
          console.log('    [Group] ' + g.name + ' required:' + g.required + ' maxQty:' + g.maxQty);
          for (const o of g.options) {
            console.log('      - ' + o.name + ' R$' + o.price);
          }
        }
      }
    }
  }
}

main().then(() => prisma.$disconnect());
