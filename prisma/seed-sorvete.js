const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const store = await prisma.store.findFirst({ where: { slug: 'acaiteria-santos' } });
  if (!store) { console.log('LOJA NÃO ENCONTRADA'); return; }

  // Deletar sorvete existente
  const existingCat = await prisma.category.findFirst({ where: { storeId: store.id, name: 'Sorvete' } });
  if (existingCat) {
    await prisma.productOption.deleteMany({ where: { group: { product: { categoryId: existingCat.id } } } });
    await prisma.productOptionGroup.deleteMany({ where: { product: { categoryId: existingCat.id } } });
    await prisma.product.deleteMany({ where: { categoryId: existingCat.id } });
    await prisma.category.delete({ where: { id: existingCat.id } });
    console.log('Sorvete antigo removido');
  }

  // Criar categoria Sorvete
  const category = await prisma.category.create({
    data: {
      storeId: store.id,
      name: 'Sorvete',
      sortOrder: 2,
      isActive: true,
    }
  });
  console.log('Categoria criada:', category.name);

  // Produtos: 1 Bola, 2 Bolas, 3 Bolas
  const sizes = [
    { name: '1 Bola', desc: '1 Bola de sorvete', price: 4, maxFlavors: 1 },
    { name: '2 Bolas', desc: '2 Bolas de sorvete', price: 8, maxFlavors: 2 },
    { name: '3 Bolas', desc: '3 Bolas de sorvete', price: 12, maxFlavors: 3 },
  ];

  const flavors = ['Chocolate', 'Morango', 'Creme', 'Pistache', 'Napolitano'];
  const complementos = [
    { name: 'Calda de Groselha', price: 0 },
    { name: 'Calda de Morango', price: 0 },
    { name: 'Calda de Chocolate', price: 0 },
  ];
  const extras = [
    { name: 'Granola', price: 3 },
    { name: 'Leite Condensado', price: 3 },
    { name: 'Chocolate Granulado', price: 4 },
    { name: 'Amendoim', price: 3 },
    { name: 'Banana', price: 2 },
  ];

  for (const size of sizes) {
    const product = await prisma.product.create({
      data: {
        storeId: store.id,
        categoryId: category.id,
        name: size.name,
        description: size.desc,
        price: size.price,
        isActive: true,
        sortOrder: sizes.indexOf(size),
      }
    });
    console.log(`Produto criado: ${product.name} R$${product.price}`);

    // Grupo Sabores (obrigatório, maxQty = número de bolas)
    const saboresGroup = await prisma.productOptionGroup.create({
      data: {
        productId: product.id,
        storeId: store.id,
        name: 'Sabores',
        required: true,
        maxQty: size.maxFlavors,
        sortOrder: 0,
      }
    });

    for (let i = 0; i < flavors.length; i++) {
      await prisma.productOption.create({
        data: {
          groupId: saboresGroup.id,
          name: flavors[i],
          price: 0,
          sortOrder: i,
        }
      });
    }
    console.log(`  ${flavors.length} sabores adicionados`);

    // Grupo Complementos (grátis, opcional)
    const compGroup = await prisma.productOptionGroup.create({
      data: {
        productId: product.id,
        storeId: store.id,
        name: 'Complementos',
        required: false,
        maxQty: 99,
        sortOrder: 1,
      }
    });

    for (let i = 0; i < complementos.length; i++) {
      await prisma.productOption.create({
        data: {
          groupId: compGroup.id,
          name: complementos[i].name,
          price: complementos[i].price,
          sortOrder: i,
        }
      });
    }
    console.log(`  ${complementos.length} complementos adicionados`);

    // Grupo Extras (pagos, opcional)
    const extrasGroup = await prisma.productOptionGroup.create({
      data: {
        productId: product.id,
        storeId: store.id,
        name: 'Extras',
        required: false,
        maxQty: 99,
        sortOrder: 2,
      }
    });

    for (let i = 0; i < extras.length; i++) {
      await prisma.productOption.create({
        data: {
          groupId: extrasGroup.id,
          name: extras[i].name,
          price: extras[i].price,
          sortOrder: i,
        }
      });
    }
    console.log(`  ${extras.length} extras adicionados`);
  }

  console.log('\n✅ Sorvete configurado com sucesso!');
}

main().then(() => prisma.$disconnect());
