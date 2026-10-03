// Remove do Vercel Blob apenas arquivos que NÃO estão mais referenciados no banco.
// Preserva logos, banners, imagens de produto/categoria/sorvete e comprovantes.
// Uso: node --env-file=.env --env-file=.env.local scripts/cleanup-blob-orphans.js [--apply]
const { PrismaClient } = require('@prisma/client')
const { list, del } = require('@vercel/blob')

const prisma = new PrismaClient()
const APPLY = process.argv.includes('--apply')
const TOKEN = process.env.BLOB_READ_WRITE_TOKEN

function buildReferenced() {
  const refs = new Set()
  const add = (u) => {
    if (u && typeof u === 'string' && u.includes('blob.vercel-storage.com')) refs.add(u)
  }
  const deepScan = (obj) => {
    if (!obj) return
    if (typeof obj === 'string') return add(obj)
    if (Array.isArray(obj)) return obj.forEach(deepScan)
    if (typeof obj === 'object') return Object.values(obj).forEach(deepScan)
  }
  return { refs, add, deepScan }
}

async function main() {
  const { refs, add, deepScan } = buildReferenced()

  const stores = await prisma.store.findMany({ select: { logo: true, banner: true, sorveteConfig: true } })
  stores.forEach((s) => { add(s.logo); add(s.banner); deepScan(s.sorveteConfig) })

  const products = await prisma.product.findMany({ select: { image: true, sizesBackup: true } })
  products.forEach((p) => { add(p.image); deepScan(p.sizesBackup) })

  const categories = await prisma.category.findMany({ select: { image: true, extrasTemplate: true } })
  categories.forEach((c) => { add(c.image); deepScan(c.extrasTemplate) })

  const orders = await prisma.order.findMany({ select: { paymentProofUrl: true } })
  orders.forEach((o) => add(o.paymentProofUrl))

  console.log(`URLs referenciadas no banco: ${refs.size}`)

  // Lista todos os blobs (paginando)
  const blobs = []
  let cursor
  do {
    const res = await list({ token: TOKEN, cursor, limit: 1000 })
    blobs.push(...res.blobs)
    cursor = res.hasMore ? res.cursor : undefined
  } while (cursor)

  const orphans = blobs.filter((b) => !refs.has(b.url))
  const totalBytes = orphans.reduce((s, b) => s + (b.size || 0), 0)

  console.log(`Blobs no total: ${blobs.length}`)
  console.log(`Órfãos (não referenciados): ${orphans.length} — ${(totalBytes / 1024 / 1024).toFixed(2)} MB`)

  const byPrefix = {}
  for (const o of orphans) {
    const p = o.pathname.split('/').slice(0, 2).join('/')
    byPrefix[p] = (byPrefix[p] || 0) + 1
  }
  console.log('Por pasta:', byPrefix)

  if (!APPLY) {
    console.log('\nSimulação. Rode com --apply para remover.')
    if (orphans[0]) console.log('Exemplo:', orphans.slice(0, 5).map((o) => o.pathname))
    await prisma.$disconnect()
    return
  }

  let deleted = 0
  for (let i = 0; i < orphans.length; i += 20) {
    const chunk = orphans.slice(i, i + 20).map((o) => o.url)
    try {
      await del(chunk)
      deleted += chunk.length
    } catch (e) {
      console.error('Falha ao deletar lote:', e.message)
      for (const url of chunk) {
        try { await del(url); deleted++ } catch (err) { console.error('Falha:', url, err.message) }
      }
    }
    console.log(`Removidos ${deleted}/${orphans.length}...`)
  }

  console.log(`\nAplicado: ${deleted} arquivo(s) removido(s).`)
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
