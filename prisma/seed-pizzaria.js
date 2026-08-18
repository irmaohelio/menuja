const { PrismaClient } = require('@prisma/client');
const sqlite3 = require('better-sqlite3');
const path = require('path');

const prisma = new PrismaClient();
const STORE_ID = '49572173-5361-407f-98fd-b1bb8d0789ef';

// SQLite source
const sqlitePath = path.join('D:', 'Pizzaria2', 'app_cliente_novo', 'data', 'pizzaria.db');
const sqlite = new sqlite3(sqlitePath, { readonly: true });

async function main() {
  console.log('🗑️  Limpando dados antigos da Pizzaria Santos...');
  
  // Delete in correct order (respect foreign keys)
  await prisma.orderItemOption.deleteMany({ where: { orderItem: { order: { storeId: STORE_ID } } } });
  await prisma.orderItem.deleteMany({ where: { order: { storeId: STORE_ID } } });
  await prisma.orderStatusLog.deleteMany({ where: { order: { storeId: STORE_ID } } });
  await prisma.order.deleteMany({ where: { storeId: STORE_ID } });
  await prisma.storeHighlight.deleteMany({ where: { storeId: STORE_ID } });
  await prisma.notification.deleteMany({ where: { storeId: STORE_ID } });
  
  // Delete products (cascades to pizzaSizes, optionGroups, etc.)
  const products = await prisma.product.findMany({ where: { storeId: STORE_ID }, select: { id: true } });
  for (const p of products) {
    await prisma.pizzaFlavor.deleteMany({ where: { size: { productId: p.id } } });
    await prisma.pizzaSize.deleteMany({ where: { productId: p.id } });
    await prisma.productOption.deleteMany({ where: { group: { productId: p.id } } });
    await prisma.productOptionGroup.deleteMany({ where: { productId: p.id } });
  }
  await prisma.product.deleteMany({ where: { storeId: STORE_ID } });
  await prisma.category.deleteMany({ where: { storeId: STORE_ID } });
  await prisma.pizzaCrust.deleteMany({ where: { storeId: STORE_ID } });
  
  console.log('✅ Dados antigos limpos');

  // ========== READ SQLITE DATA ==========
  const sqliteCategories = sqlite.prepare('SELECT * FROM categories ORDER BY sort_order').all();
  const sqliteProducts = sqlite.prepare('SELECT * FROM products ORDER BY category_id, sort_order').all();
  const sqliteSizes = sqlite.prepare('SELECT * FROM product_sizes ORDER BY product_id, sort_order').all();
  const sqliteCrusts = sqlite.prepare('SELECT * FROM crusts ORDER BY sort_order').all();

  // Map SQLite category IDs to our category names
  const categoryMap = {
    1: 'Pizzas',
    2: 'Sucos Artificiais', 
    3: 'Sucos Naturais',
    4: 'Refrigerantes',
    8: 'Outras Bebidas',
    9: 'Salgados',
    10: 'Mini Salgados',
  };

  // ========== CREATE CATEGORIES ==========
  console.log('📁 Criando categorias...');
  const catIdMap = {}; // sqliteCatId -> prismaCatId
  
  const catOrder = [
    { sqliteId: 1, name: 'Pizzas', type: 'standard' },
    { sqliteId: 9, name: 'Salgados', type: 'standard' },
    { sqliteId: 10, name: 'Mini Salgados', type: 'standard' },
    { sqliteId: 4, name: 'Refrigerantes', type: 'standard' },
    { sqliteId: 2, name: 'Sucos Artificiais', type: 'standard' },
    { sqliteId: 3, name: 'Sucos Naturais', type: 'standard' },
    { sqliteId: 8, name: 'Outras Bebidas', type: 'standard' },
  ];

  for (let i = 0; i < catOrder.length; i++) {
    const c = catOrder[i];
    const cat = await prisma.category.create({
      data: {
        storeId: STORE_ID,
        name: c.name,
        type: c.type,
        sortOrder: i,
        isActive: true,
      }
    });
    catIdMap[c.sqliteId] = cat.id;
    console.log(`  ✅ ${c.name}`);
  }

  // ========== CREATE PIZZA CRUSTS (BORDAS) ==========
  console.log('🧀 Criando bordas...');
  for (const crust of sqliteCrusts) {
    if (crust.active) {
      await prisma.pizzaCrust.create({
        data: {
          storeId: STORE_ID,
          name: crust.name,
          price: crust.price,
          isActive: true,
          sortOrder: crust.sort_order,
        }
      });
      console.log(`  ✅ ${crust.name} - R$${crust.price.toFixed(2)}`);
    }
  }

  // ========== CREATE PRODUCTS ==========
  console.log('🍕 Criando produtos...');
  
  // Group products by SQLite category
  const productsByCategory = {};
  for (const p of sqliteProducts) {
    if (!productsByCategory[p.category_id]) productsByCategory[p.category_id] = [];
    productsByCategory[p.category_id].push(p);
  }

  // Group sizes by product
  const sizesByProduct = {};
  for (const s of sqliteSizes) {
    if (!sizesByProduct[s.product_id]) sizesByProduct[s.product_id] = [];
    sizesByProduct[s.product_id].push(s);
  }

  let totalProducts = 0;

  // Process each category
  for (const [sqliteCatIdStr, prismaCatId] of Object.entries(catIdMap)) {
    const sqliteCatId = parseInt(sqliteCatIdStr);
    const prods = productsByCategory[sqliteCatId] || [];
    
    for (let i = 0; i < prods.length; i++) {
      const p = prods[i];
      if (!p.active) continue;

      const isPizza = sqliteCatId === 1;
      const productSizes = sizesByProduct[p.id] || [];
      
      // For products with sizes (pizza, refrigerantes), use the smallest size price as base
      const basePrice = productSizes.length > 0 
        ? Math.min(...productSizes.map(s => s.price))
        : p.price;

      const product = await prisma.product.create({
        data: {
          storeId: STORE_ID,
          categoryId: prismaCatId,
          name: p.name,
          description: p.description || null,
          image: p.image || null,
          price: basePrice,
          promoPrice: p.is_promo && p.promo_price ? p.promo_price : null,
          isActive: true,
          isFeatured: p.featured === 1,
          isPizza: isPizza,
          sortOrder: i,
        }
      });

      // Create sizes (PizzaSize works for ANY product, not just pizza)
      if (productSizes.length > 0) {
        for (let si = 0; si < productSizes.length; si++) {
          const s = productSizes[si];
          await prisma.pizzaSize.create({
            data: {
              productId: product.id,
              name: s.name,
              price: s.price,
              slices: s.slices || null,
              sortOrder: si,
              isActive: true,
            }
          });
        }
        console.log(`  ✅ ${p.name} (${productSizes.length} tamanhos) - a partir de R$${basePrice.toFixed(2)}`);
      } else {
        console.log(`  ✅ ${p.name} - R$${p.price.toFixed(2)}`);
      }

      totalProducts++;
    }
  }

  console.log(`\n🎉 Seed completo! ${totalProducts} produtos criados.`);
}

main()
  .catch(e => {
    console.error('❌ Erro:', e);
    process.exit(1);
  })
  .finally(async () => {
    sqlite.close();
    await prisma.$disconnect();
  });
