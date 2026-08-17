import { NextRequest } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { v4 as uuid } from 'uuid'
import { getCurrentStore } from '@/lib/auth'
import { success, error, unauthorized } from '@/lib/api'

export async function POST(req: NextRequest) {
  const store = await getCurrentStore()
  if (!store) return unauthorized()

  const formData = await req.formData()
  const file = formData.get('file') as File

  if (!file) return error('Nenhum arquivo enviado')

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const ext = file.name.split('.').pop() || 'jpg'
  const filename = `${uuid()}.${ext}`

  const uploadDir = path.join(process.cwd(), 'public', 'uploads')
  await mkdir(uploadDir, { recursive: true })

  await writeFile(path.join(uploadDir, filename), buffer)

  return success({ url: `/uploads/${filename}` })
}
