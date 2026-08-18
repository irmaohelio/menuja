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

  if (!file) return error('Nenhum arquivo enviado')

  // Convert File to Buffer
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  // Resize image: max 800px wide, 600px tall, auto height
  // Logo: 200x200 square
  // Banner: 800x300
  // Product: 400x400 square
  const resized = await sharp(buffer)
    .resize(800, 800, { 
      fit: 'inside',
      withoutEnlargement: true 
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
