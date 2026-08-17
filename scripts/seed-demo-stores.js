const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function createDemoStore({ name, slug, email, password, segment, primaryColor, categories }) {
  // Check if already exists
  const existing = await prisma.store.findUnique({ where: { slug } })
  if (existing) { console.log(`⚠️  ${name} já existe, pulando...`); return }

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: {
      name: `Dono ${name}`,
      email,
      password: hashedPassword,
      role: 'merchant',
      store: {
        create: {
          name,
          slug,
          segment,
          primaryColor,
          secondaryColor: '#f0abfc',
          buttonColor: primaryColor,
          isOpen: true,
          description: `${name} - Peça agora pelo nosso delivery!`,
          settings: {
            create: {
              deliveryEnabled: true,
              pickupEnabled: true,
              deliveryFee: 5,
              avgPrepTime: 30,
              cashEnabled: true,
              pixEnabled: true,
            }
          },
          businessHours: {
            create: Array.from({ length: 7 }, (_, i) => ({
              dayOfWeek: i,
              isOpen: i > 0 && i < 6, // seg-sex aberto
              openTime: '18:00',
              closeTime: '23:00',
            }))
          }
        }
      }
    },
    include: { store: true }
  })

  const store = user.store

  // Create categories and products
  for (const cat of categories) {
    const category = await prisma.category.create({
      data: {
        storeId: store.id,
        name: cat.name,
        sortOrder: cat.sortOrder || 0,
      }
    })

    for (const prod of cat.products) {
      const product = await prisma.product.create({
        data: {
          storeId: store.id,
          categoryId: category.id,
          name: prod.name,
          description: prod.description,
          price: prod.price,
          promoPrice: prod.promoPrice || null,
          isFeatured: prod.isFeatured || false,
          sortOrder: prod.sortOrder || 0,
        }
      })

      if (prod.extras && prod.extras.length > 0) {
        const group = await prisma.productOptionGroup.create({
          data: {
            productId: product.id,
            storeId: store.id,
            name: 'Extras',
            required: false,
            maxQty: prod.extras.length,
            sortOrder: 0,
          }
        })

        for (let i = 0; i < prod.extras.length; i++) {
          await prisma.productOption.create({
            data: {
              groupId: group.id,
              name: prod.extras[i].name,
              price: prod.extras[i].price,
              sortOrder: i,
            }
          })
        }
      }
    }
  }

  console.log(`✅ ${name} criada! Login: ${email} / ${password} | Slug: ${slug}`)
}

async function main() {
  console.log('🚀 Criando lojas de demonstração...\n')

  // ==================== HAMBURGUERIA ====================
  await createDemoStore({
    name: 'Burger House',
    slug: 'burger-house',
    email: 'burger@demo.com',
    password: '123456',
    segment: 'hamburgueria',
    primaryColor: '#d97706', // amber
    categories: [
      {
        name: 'Hambúrgueres',
        sortOrder: 0,
        products: [
          {
            name: 'Smash Burger',
            description: 'Pão brioche, hambúrguer 80g smash, queijo cheddar, alface, tomate e molho especial',
            price: 22.90,
            isFeatured: true,
            sortOrder: 0,
            extras: [
              { name: 'Bacon', price: 4 },
              { name: 'Ovo', price: 2 },
              { name: 'Cheddar extra', price: 3 },
              { name: 'Onion rings', price: 5 },
            ]
          },
          {
            name: 'Duplo Bacon',
            description: 'Pão brioche, 2 hambúrgueres 80g, queijo cheddar, bacon crocante e molho BBQ',
            price: 32.90,
            sortOrder: 1,
            extras: [
              { name: 'Bacon extra', price: 4 },
              { name: 'Cheddar extra', price: 3 },
              { name: 'Jalapeño', price: 3 },
            ]
          },
          {
            name: 'Chicken Burger',
            description: 'Pão brioche, frango empanado crocante, alface, tomate e molho garlic',
            price: 24.90,
            sortOrder: 2,
            extras: [
              { name: 'Bacon', price: 4 },
              { name: 'Queijo', price: 2 },
            ]
          },
          {
            name: 'Veggie Burger',
            description: 'Pão integral, hambúrguer de grão-de-bico, rúcula, tomate seco e molho de ervas',
            price: 26.90,
            sortOrder: 3,
          },
        ]
      },
      {
        name: 'Acompanhamentos',
        sortOrder: 1,
        products: [
          {
            name: 'Batata Frita',
            description: 'Porção generosa de batata frita crocante',
            price: 14.90,
            sortOrder: 0,
            extras: [
              { name: 'Cheddar e bacon', price: 6 },
              { name: 'Molho especial', price: 2 },
            ]
          },
          {
            name: 'Onion Rings',
            description: '6 anéis de cebola empanados e crocantes',
            price: 16.90,
            sortOrder: 1,
          },
          {
            name: 'Nuggets (10 un)',
            description: '10 nuggets de frango crocantes',
            price: 18.90,
            sortOrder: 2,
          },
        ]
      },
      {
        name: 'Bebidas',
        sortOrder: 2,
        products: [
          {
            name: 'Coca-Cola Lata',
            description: '350ml gelada',
            price: 5.90,
            sortOrder: 0,
          },
          {
            name: 'Suco Natural',
            description: 'Laranja, limão ou maracujá - 500ml',
            price: 8.90,
            sortOrder: 1,
          },
          {
            name: 'Milk Shake',
            description: 'Chocolate, morango ou baunilha - 400ml',
            price: 14.90,
            sortOrder: 2,
          },
        ]
      },
    ]
  })

  // ==================== PIZZARIA ====================
  await createDemoStore({
    name: 'Pizza Express',
    slug: 'pizza-express',
    email: 'pizza@demo.com',
    password: '123456',
    segment: 'pizzaria',
    primaryColor: '#dc2626', // red
    categories: [
      {
        name: 'Pizzas Tradicionais',
        sortOrder: 0,
        products: [
          {
            name: 'Margherita',
            description: 'Molho de tomate, mussarela fresca, manjericão e azeite',
            price: 39.90,
            isFeatured: true,
            sortOrder: 0,
            extras: [
              { name: 'Borda recheada', price: 8 },
              { name: 'Catupiry', price: 5 },
              { name: 'Cheddar', price: 5 },
            ]
          },
          {
            name: 'Calabresa',
            description: 'Molho de tomate, mussarela, calabresa fatiada e cebola',
            price: 37.90,
            sortOrder: 1,
            extras: [
              { name: 'Borda recheada', price: 8 },
              { name: 'Ovo', price: 2 },
            ]
          },
          {
            name: 'Frango com Catupiry',
            description: 'Molho de tomate, mussarela, frango desfiado e catupiry',
            price: 42.90,
            sortOrder: 2,
            extras: [
              { name: 'Borda recheada', price: 8 },
              { name: 'Milho', price: 3 },
              { name: 'Palmito', price: 4 },
            ]
          },
          {
            name: 'Portuguesa',
            description: 'Molho de tomate, mussarela, presunto, ovo, cebola, azeitona e ervilha',
            price: 41.90,
            sortOrder: 3,
            extras: [
              { name: 'Borda recheada', price: 8 },
            ]
          },
        ]
      },
      {
        name: 'Pizzas Especiais',
        sortOrder: 1,
        products: [
          {
            name: 'Quatro Queijos',
            description: 'Molho de tomate, mussarela, provolone, gorgonzola e parmesão',
            price: 46.90,
            isFeatured: true,
            sortOrder: 0,
            extras: [
              { name: 'Borda recheada', price: 8 },
            ]
          },
          {
            name: 'Bacon Supreme',
            description: 'Molho de tomate, mussarela, bacon crocante, cebola caramelizada e barbecue',
            price: 48.90,
            sortOrder: 1,
          },
          {
            name: 'Vegetariana',
            description: 'Molho de tomate, mussarela, brócolis, palmito, cogumelos e azeitona',
            price: 44.90,
            sortOrder: 2,
          },
        ]
      },
      {
        name: 'Bebidas',
        sortOrder: 2,
        products: [
          {
            name: 'Coca-Cola 2L',
            description: 'Refrigerante Coca-Cola 2 litros',
            price: 14.90,
            sortOrder: 0,
          },
          {
            name: 'Guaraná Lata',
            description: '350ml gelado',
            price: 5.90,
            sortOrder: 1,
          },
        ]
      },
    ]
  })

  // ==================== AÇAITERIA ====================
  await createDemoStore({
    name: 'Açaí Premium',
    slug: 'acai-premium',
    email: 'acai@demo.com',
    password: '123456',
    segment: 'acaiteria',
    primaryColor: '#7c3aed', // purple
    categories: [
      {
        name: 'Açaí Clássico',
        sortOrder: 0,
        products: [
          {
            name: 'Açaí 300ml',
            description: 'Açaí batido com banana e xarope de guaraná',
            price: 15.90,
            isFeatured: true,
            sortOrder: 0,
            extras: [
              { name: 'Granola', price: 2 },
              { name: 'Leite em pó', price: 2 },
              { name: 'Banana', price: 2 },
              { name: 'Mel', price: 2 },
              { name: 'Paçoca', price: 3 },
              { name: 'Leite condensado', price: 3 },
            ]
          },
          {
            name: 'Açaí 500ml',
            description: 'Açaí batido com banana e xarope de guaraná',
            price: 22.90,
            sortOrder: 1,
            extras: [
              { name: 'Granola', price: 2 },
              { name: 'Leite em pó', price: 2 },
              { name: 'Banana', price: 2 },
              { name: 'Morango', price: 4 },
              { name: 'Paçoca', price: 3 },
              { name: 'Leite condensado', price: 3 },
              { name: 'Nutella', price: 5 },
            ]
          },
          {
            name: 'Açaí 700ml',
            description: 'Açaí batido com banana e xarope de guaraná - tamanho família',
            price: 29.90,
            sortOrder: 2,
            extras: [
              { name: 'Granola', price: 2 },
              { name: 'Leite em pó', price: 2 },
              { name: 'Banana', price: 2 },
              { name: 'Morango', price: 4 },
              { name: 'Kiwi', price: 5 },
              { name: 'Nutella', price: 5 },
              { name: 'Ovomaltine', price: 4 },
            ]
          },
        ]
      },
      {
        name: 'Açaí Especial',
        sortOrder: 1,
        products: [
          {
            name: 'Açaí Power Protein',
            description: 'Açaí com whey protein, banana, aveia e mel',
            price: 24.90,
            isFeatured: true,
            sortOrder: 0,
            extras: [
              { name: 'Granola', price: 2 },
              { name: 'Pasta de amendoim', price: 4 },
              { name: 'Chia', price: 2 },
            ]
          },
          {
            name: 'Açaí Tropical',
            description: 'Açaí com manga, abacaxi e leite de coco',
            price: 26.90,
            sortOrder: 1,
          },
          {
            name: 'Açaí com Nutella',
            description: 'Açaí cremoso coberto com Nutella e morangos',
            price: 28.90,
            sortOrder: 2,
          },
        ]
      },
      {
        name: 'Combos',
        sortOrder: 2,
        products: [
          {
            name: 'Combo Casal',
            description: '2 açaís 500ml com até 3 acompanhamentos cada',
            price: 39.90,
            sortOrder: 0,
          },
          {
            name: 'Combo Família',
            description: '2 açaís 700ml + 1 açaí 300ml com até 4 acompanhamentos cada',
            price: 64.90,
            sortOrder: 1,
          },
        ]
      },
      {
        name: 'Bebidas',
        sortOrder: 3,
        products: [
          {
            name: 'Suco de Laranja',
            description: 'Natural, 500ml',
            price: 9.90,
            sortOrder: 0,
          },
          {
            name: 'Água de Coco',
            description: '500ml gelada',
            price: 7.90,
            sortOrder: 1,
          },
        ]
      },
    ]
  })

  console.log('\n🎉 Todas as lojas de demonstração criadas!')
  console.log('\n📋 Resumo:')
  console.log('  🍔 Burger House  → burger@demo.com / 123456 → /loja/burger-house')
  console.log('  🍕 Pizza Express  → pizza@demo.com / 123456 → /loja/pizza-express')
  console.log('  🍧 Açaí Premium   → acai@demo.com / 123456 → /loja/acai-premium')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
