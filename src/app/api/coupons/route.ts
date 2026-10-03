import { NextRequest } from 'next/server'
import { Prisma } from '@prisma/client'
import { getCurrentStore } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { success, error, unauthorized } from '@/lib/api'
import { normalizeCode } from '@/lib/coupons'

export const dynamic = 'force-dynamic'

function clean(body: any) {
  return {
    code: normalizeCode(body.code),
    discountType: body.discountType === 'fixed' ? 'fixed' : 'percent',
    value: Number(body.value) || 0,
    minOrder: Number(body.minOrder) || 0,
    maxUses: body.maxUses === '' || body.maxUses == null ? null : Math.max(0, parseInt(body.maxUses)),
    expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
    isActive: body.isActive ?? true,
  }
}

export async function GET() {
  const store = await getCurrentStore()
  if (!store) return unauthorized()
  const coupons = await prisma.coupon.findMany({ where: { storeId: store.id }, orderBy: { createdAt: 'desc' } })
  return success({ coupons })
}

export async function POST(req: NextRequest) {
  const store = await getCurrentStore()
  if (!store) return unauthorized()

  const data = clean(await req.json())
  if (!data.code) return error('Informe o código do cupom')
  if (data.value <= 0) return error('O valor do desconto deve ser maior que zero')

  try {
    const coupon = await prisma.coupon.create({ data: { storeId: store.id, ...data } })
    return success({ coupon })
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return error('Já existe um cupom com esse código')
    }
    throw e
  }
}

export async function PUT(req: NextRequest) {
  const store = await getCurrentStore()
  if (!store) return unauthorized()

  const body = await req.json()
  if (!body.id) return error('ID obrigatório')
  const data = clean(body)

  const existing = await prisma.coupon.findFirst({ where: { id: body.id, storeId: store.id } })
  if (!existing) return error('Cupom não encontrado', 404)

  const coupon = await prisma.coupon.update({ where: { id: body.id }, data })
  return success({ coupon })
}

export async function DELETE(req: NextRequest) {
  const store = await getCurrentStore()
  if (!store) return unauthorized()

  const id = req.nextUrl.searchParams.get('id')
  if (!id) return error('ID obrigatório')

  const existing = await prisma.coupon.findFirst({ where: { id, storeId: store.id } })
  if (!existing) return error('Cupom não encontrado', 404)

  await prisma.coupon.delete({ where: { id } })
  return success({ deleted: true })
}
