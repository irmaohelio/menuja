import { NextRequest } from 'next/server'
import { getCurrentStore } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { success, error, unauthorized } from '@/lib/api'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const store = await getCurrentStore()
  if (!store) return unauthorized()

  const { id } = await params
  const body = await req.json()

  const cat = await prisma.category.findFirst({ where: { id, storeId: store.id } })
  if (!cat) return error('Categoria não encontrada', 404)

  const category = await prisma.category.update({ where: { id }, data: body })
  return success({ category })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const store = await getCurrentStore()
  if (!store) return unauthorized()

  const { id } = await params
  const cat = await prisma.category.findFirst({ where: { id, storeId: store.id } })
  if (!cat) return error('Categoria não encontrada', 404)

  await prisma.category.delete({ where: { id } })
  return success({ message: 'Categoria excluída' })
}
