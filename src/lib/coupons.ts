import { prisma } from './prisma'

export type CouponValidation =
  | { ok: true; coupon: { id: string; code: string; discountType: string; value: number }; discount: number }
  | { ok: false; error: string }

export function normalizeCode(code?: string | null) {
  return (code || '').trim().toUpperCase()
}

// Valida um cupom para uma loja e calcula o desconto sobre o subtotal
export async function validateCoupon(storeId: string, code: string, subtotal: number): Promise<CouponValidation> {
  const normalized = normalizeCode(code)
  if (!normalized) return { ok: false, error: 'Informe um cupom' }

  const coupon = await prisma.coupon.findFirst({ where: { storeId, code: normalized, isActive: true } })
  if (!coupon) return { ok: false, error: 'Cupom inválido' }
  if (coupon.expiresAt && coupon.expiresAt.getTime() < Date.now()) return { ok: false, error: 'Cupom expirado' }
  if (coupon.maxUses != null && coupon.usedCount >= coupon.maxUses) return { ok: false, error: 'Cupom esgotado' }
  if (subtotal < coupon.minOrder) {
    return { ok: false, error: `Pedido mínimo de R$ ${coupon.minOrder.toFixed(2)} para usar este cupom` }
  }

  const raw = coupon.discountType === 'percent' ? subtotal * (coupon.value / 100) : coupon.value
  const discount = Math.round(Math.min(raw, subtotal) * 100) / 100

  return {
    ok: true,
    coupon: { id: coupon.id, code: coupon.code, discountType: coupon.discountType, value: coupon.value },
    discount,
  }
}
