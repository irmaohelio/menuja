const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const store = await prisma.store.findFirst({ where: { slug: 'acaiteria-santos' } });
  if (!store) { console.log('LOJA NÃO ENCONTRADA'); return; }
  console.log('Loja:', store.name);

  // 1. Criar categoria Sorvete
  const cat = await prisma.category.create({
    data: {
      storeId: store.id,
      name: 'Sorvete',
      sortOrder: 2,
      isActive: true,
    }
  });
  console.log('Categoria criada:', cat.name);

  // 2. Sabores
  const sabores = ['Chocolate', 'Morango', 'Creme', 'Pistache', 'Napolitano'];

  // 3. Complementos (grátis)
  const complementos = ['Calda de Groselha', 'Calda de Morango', 'Calda de Chocolate'];

  // 4. Criar produtos: 1 Bola, 2 Bolas, 3 Bolas
  const bolas = [
    { nome: '1 Bola', price: 4, maxSabores: 1 },
    { nome: '2 Bolas', price: 8, maxSabores: 2 },
    { nome: '3 Bolas', price: 12, maxSabores: 3 },
  ];

  for (const bola of bolas) {
    const product = await prisma.product.create({
      data: {
        storeId: store.id,
        categoryId: cat.id,
        name: bola.nome,
        description: `${bola.nome} de sorvete - escolha até ${bola.maxSabores} sabor(es)`,
        price: bola.price,
        isActive: true,
        sortOrder: bolas.indexOf(bola),
      }
    });
    console.log(`Produto criado: ${product.name} R$${product.price}`);

    // Option group: Sabores
    const saboresGroup = await prisma.productOptionGroup.create({
      data: {
        productId: product.id,
        storeId: store.id,
        name: 'Sabores',
        required: true,
        minQty: bola.maxSabores,
        maxQty: bola.maxSabores,
        sortOrder: 0,
      }
    });

    for (let i = 0; i < sabores.length; i++) {
      await prisma.productOption.create({
        data: {
          groupId: saboresGroup.id,
          name: sabores[i],
          price: 0,
          sortOrder: i,
        }
      });
    }
    console.log(`  ${sabores.length} sabores adicionados`);

    // Option group: Complementos (grátis)
    const compGroup = await prisma.productOptionGroup.create({
      data: {
        productId: product.id,
        storeId: store.id,
        name: 'Complementos',
        required: false,
        minQty: 0,
        maxQty: 3,
        sortOrder: 1,
      }
    });

    for (let i = 0; i < complementos.length; i++) {
      await prisma.productOption.create({
        data: {
          groupId: compGroup.id,
          name: complementos[i],
          price: 0,
          sortOrder: i,
        }
      });
    }
    console.log(`  ${complementos.length} complementos adicionados`);
  }

  console.log('\n✅ Sorvete configurado com sucesso!');
}

main().then(() => prisma.$disconnect());
