// One-off: unify duplicate customers within each store.
// Identity = same normalized name with non-conflicting identifiers (email/phone).
// Usage: node --env-file=.env scripts/merge-customers.js [--apply]
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const APPLY = process.argv.includes('--apply')

const normName = (n) => (n || '').trim().toLowerCase().replace(/\s+/g, ' ')
const normEmail = (e) => (e ? e.trim().toLowerCase() : null)
const normPhone = (p) => (p ? p.replace(/\D/g, '') : null)

function score(c) {
  return (c.email ? 4 : 0) + (c.phone ? 2 : 0) + (c._count?.orders || 0)
}

async function main() {
  const stores = await prisma.store.findMany({ select: { id: true, slug: true } })
  let merged = 0

  for (const store of stores) {
    const customers = await prisma.customer.findMany({
      where: { storeId: store.id },
      include: { _count: { select: { orders: true, addresses: true } } },
    })

    const groups = {}
    for (const c of customers) {
      const key = normName(c.name)
      ;(groups[key] ??= []).push(c)
    }

    for (const [name, list] of Object.entries(groups)) {
      if (list.length < 2) continue
      list.sort((a, b) => score(b) - score(a))
      const primary = list[0]

      for (const other of list.slice(1)) {
        const conflictEmail = primary.email && other.email && normEmail(primary.email) !== normEmail(other.email)
        const conflictPhone = primary.phone && other.phone && normPhone(primary.phone) !== normPhone(other.phone)
        if (conflictEmail || conflictPhone) {
          console.log(`[skip] ${store.slug} "${name}": conflito de identificadores (${primary.id} x ${other.id})`)
          continue
        }

        const data = {}
        if (!primary.email && other.email) data.email = normEmail(other.email)
        if (!primary.phone && other.phone) data.phone = normPhone(other.phone)

        console.log(
          `[merge] ${store.slug} "${name}": ${other.id} -> ${primary.id} ` +
            `(orders=${other._count.orders}, addrs=${other._count.addresses})`,
        )

        if (APPLY) {
          await prisma.order.updateMany({ where: { customerId: other.id }, data: { customerId: primary.id } })
          await prisma.customerAddress.updateMany({ where: { customerId: other.id }, data: { customerId: primary.id } })
          if (Object.keys(data).length) {
            await prisma.customer.update({ where: { id: primary.id }, data })
          }
          await prisma.customer.delete({ where: { id: other.id } })
          Object.assign(primary, data)
        }
        merged++
      }
    }
  }

  console.log(`\n${APPLY ? 'Aplicado' : 'Simulação'}: ${merged} cadastro(s) unificado(s).`)
  if (!APPLY && merged) console.log('Rode com --apply para aplicar.')
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
