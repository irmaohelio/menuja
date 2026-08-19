import { NextRequest } from 'next/server'
import { put } from '@vercel/blob'
import sharp from 'sharp'
import { getCurrentStore } from '@/lib/auth'
import { success, error, unauthorized } from '@/lib/api'

export async function POST(req: NextRequest) {
  const store = await getCurrentStore()
  if (!store) return unauthorized()

  const formData = await req.formData()
  const file = formData.get('file') as File
  const type = (formData.get('type') as string) || 'product'

  if (!file) return error('Nenhum arquivo enviado')

  // Convert File to Buffer
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  // Resize based on type
  let width: number, height: number
  
  switch (type) {
    case 'logo':
      width = 200
      height = 200
      break
    case 'banner':
      width = 780
      height = 280
      break
    case 'product':
    default:
      width = 250
      height = 250
      break
  }

  const resized = await sharp(buffer)
    .resize(width, height, { 
      fit: 'cover',
      withoutEnlargement: false
    })
    .jpeg({ quality: 80 })
    .toBuffer()

  const ext = 'jpg'
  const filename = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const blob = await put(filename, resized, {
    access: 'public',
    contentType: 'image/jpeg',
  })

  return success({ url: blob.url })
}
