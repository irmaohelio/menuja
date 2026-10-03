import { NextRequest } from 'next/server'
import { put } from '@vercel/blob'
import sharp from 'sharp'
import { getCurrentStore } from '@/lib/auth'
import { success, error, unauthorized } from '@/lib/api'

export const runtime = 'nodejs'

// Cada tipo tem uma "moldura" de proporção fixa. A imagem inteira é encaixada
// dentro dela (fit: contain) com fundo branco — nunca é esticada nem cortada.
function targetFor(type: string) {
  switch (type) {
    case 'logo':
      return { width: 200, height: 200, fit: 'contain' as const }
    case 'banner':
      return { width: 1560, height: 320, fit: 'cover' as const }
    case 'product':
    default:
      // 4:5 retrato, igual ao card do app
      return { width: 720, height: 900, fit: 'contain' as const }
  }
}

export async function POST(req: NextRequest) {
  const store = await getCurrentStore()
  if (!store) return unauthorized()

  const formData = await req.formData()
  const file = formData.get('file') as File
  const type = (formData.get('type') as string) || 'product'

  if (!file) return error('Nenhum arquivo enviado')

  const buffer = Buffer.from(await file.arrayBuffer())
  const { width, height, fit } = targetFor(type)

  try {
    const resized = await sharp(buffer)
      .rotate() // corrige a orientação de fotos tiradas pelo celular (EXIF)
      .resize(width, height, {
        fit,
        background: { r: 255, g: 255, b: 255, alpha: 1 }, // fundo branco nas sobras
      })
      .webp({ quality: 82 })
      .toBuffer()

    // Isola as imagens por loja
    const filename = `uploads/${store.slug}/${type}/${Date.now()}-${Math.random().toString(36).slice(2)}.webp`

    const blob = await put(filename, resized, {
      access: 'public',
      contentType: 'image/webp',
    })

    return success({ url: blob.url })
  } catch (e) {
    console.error('[UPLOAD] Falha ao processar imagem:', e)
    return error('Não foi possível processar a imagem. Use JPG, PNG ou WEBP.', 400)
  }
}
