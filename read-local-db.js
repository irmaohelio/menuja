const Database = require('better-sqlite3')
const db = new Database('./dev.db')

console.log('=== TABLES ===')
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all()
console.log(tables.map(t => t.name).join(', '))

console.log('\n=== CATEGORIES ===')
try {
  const cats = db.prepare('SELECT id, name FROM Category').all()
  cats.forEach(c => console.log('  ' + c.name + ' (' + c.id + ')'))
} catch(e) { console.log('  Error:', e.message) }

console.log('\n=== PRODUCTS ===')
try {
  const prods = db.prepare('SELECT id, name, price, categoryId, isPizza FROM Product').all()
  prods.forEach(p => console.log('  ' + p.name + ' R$' + p.price + ' pizza=' + p.isPizza + ' cat=' + p.categoryId))
} catch(e) { console.log('  Error:', e.message) }

console.log('\n=== OPTION GROUPS ===')
try {
  const groups = db.prepare('SELECT * FROM ProductOptionGroup').all()
  groups.forEach(g => console.log('  ' + g.name + ' product=' + g.productId))
} catch(e) { console.log('  Error:', e.message) }

console.log('\n=== OPTIONS ===')
try {
  const opts = db.prepare('SELECT * FROM ProductOption').all()
  opts.forEach(o => console.log('  ' + o.name + ' R$' + o.price + ' group=' + o.groupId))
} catch(e) { console.log('  Error:', e.message) }

console.log('\n=== PIZZA SIZES ===')
try {
  const sizes = db.prepare('SELECT * FROM PizzaSize').all()
  sizes.forEach(s => console.log('  ' + s.name + ' R$' + s.price + ' product=' + s.productId))
} catch(e) { console.log('  Error:', e.message) }

console.log('\n=== PIZZA CRUSTS ===')
try {
  const crusts = db.prepare('SELECT * FROM PizzaCrust').all()
  crusts.forEach(c => console.log('  ' + c.name + ' R$' + c.price))
} catch(e) { console.log('  Error:', e.message) }

db.close()
