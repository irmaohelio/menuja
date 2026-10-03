// One-off: reprocessa todas as imagens de produto antigas para o padrão
// novo (contain 4:5 + WebP) e atualiza o banco.
// Uso: node --env-file=.env --env-file=.env.local scripts/reprocess-product-images.js [--apply]
const { PrismaClient } = require('@prisma/client')
const { put } = require('@vercel/blob')
const sharp = require('sharp')

const prisma = new PrismaClient()
const APPLY = process.argv.includes('--apply')

async function processImage(buffer) {
  return sharp(buffer)
    .rotate()
    .resize(720, 900, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .webp({ quality: 82 })
    .toBuffer()
}

async function main() {
  const products = await prisma.product.findMany({
    where: { image: { not: null } },
    select: { id: true, name: true, image: true, store: { select: { slug: true } } },
  })

  const toProcess = products.filter((p) => p.image && !p.image.endsWith('.webp'))
  console.log(`Produtos com imagem: ${products.length} | a reprocessar (não-webp): ${toProcess.length}\n`)

  let ok = 0
  let fail = 0
  for (const p of toProcess) {
    try {
      const res = await fetch(p.image)
      if (!res.ok) throw new Error(`fetch ${res.status}`)
      const buffer = Buffer.from(await res.arrayBuffer())
      const out = await processImage(buffer)

      if (APPLY) {
        const filename = `uploads/${p.store.slug}/product/${Date.now()}-${Math.random().toString(36).slice(2)}.webp`
        const blob = await put(filename, out, { access: 'public', contentType: 'image/webp' })
        await prisma.product.update({ where: { id: p.id }, data: { image: blob.url } })
      }
      ok++
      console.log(`${APPLY ? 'OK ' : 'DRY'} [${p.store.slug}] ${p.name}`)
    } catch (e) {
      fail++
      console.error(`FAIL [${p.store.slug}] ${p.name} -> ${e.message}`)
    }
  }

  console.log(`\n${APPLY ? 'Aplicado' : 'Simulação'}: ok=${ok} fail=${fail}`)
  if (!APPLY && ok) console.log('Rode com --apply para aplicar.')
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
