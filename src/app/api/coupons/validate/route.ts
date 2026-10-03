import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { success, error } from '@/lib/api'
import { validateCoupon } from '@/lib/coupons'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const storeSlug = req.nextUrl.searchParams.get('store')
  const code = req.nextUrl.searchParams.get('code') || ''
  const subtotal = Number(req.nextUrl.searchParams.get('subtotal')) || 0

  if (!storeSlug) return error('Loja obrigatória')

  const store = await prisma.store.findUnique({ where: { slug: storeSlug }, select: { id: true } })
  if (!store) return error('Loja não encontrada', 404)

  const result = await validateCoupon(store.id, code, subtotal)
  if (!result.ok) return error(result.error)

  return success({ code: result.coupon.code, discount: result.discount })
}
