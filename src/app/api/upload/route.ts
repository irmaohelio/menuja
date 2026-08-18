import { NextRequest } from 'next/server'
import { put } from '@vercel/blob'
import { getCurrentStore } from '@/lib/auth'
import { success, error, unauthorized } from '@/lib/api'

export async function POST(req: NextRequest) {
  const store = await getCurrentStore()
  if (!store) return unauthorized()

  const formData = await req.formData()
  const file = formData.get('file') as File

  if (!file) return error('Nenhum arquivo enviado')

  const ext = file.name.split('.').pop() || 'jpg'
  const filename = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const blob = await put(filename, file, {
    access: 'public',
  })

  return success({ url: blob.url })
}
