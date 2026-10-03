import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { success, error } from '@/lib/api'

export const dynamic = 'force-dynamic'

const DAY = 24 * 60 * 60 * 1000

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return error('Não autenticado', 401)

    const store = await prisma.store.findUnique({
      where: { userId: user.id },
      select: {
        id: true,
        name: true,
        plan: true,
        planStatus: true,
        trialStartsAt: true,
        trialEndsAt: true,
        planExpiresAt: true,
        isBlocked: true,
        isActive: true,
        cpfCnpj: true,
        referralCode: true,
        referralCredits: true,
      },
    })

    if (!store) return error('Loja não encontrada', 404)

    const now = new Date()
    const addDays = (d: Date, days: number) => new Date(d.getTime() + days * DAY)

    let trialEndsAt = new Date(store.trialEndsAt)
    let planExpiresAt = store.planExpiresAt ? new Date(store.planExpiresAt) : null
    const isPaidPlan = store.plan !== 'trial'

    // Aplica créditos de indicação (1 crédito = 30 dias)
    if (store.referralCredits > 0) {
      const days = store.referralCredits * 30
      if (isPaidPlan && planExpiresAt) {
        planExpiresAt = addDays(planExpiresAt, days)
        await prisma.store.update({ where: { id: store.id }, data: { planExpiresAt, referralCredits: 0 } })
      } else {
        trialEndsAt = addDays(trialEndsAt, days)
        await prisma.store.update({
          where: { id: store.id },
          data: { trialEndsAt, referralCredits: 0, ...(trialEndsAt > now ? { isBlocked: false } : {}) },
        })
      }
    }

    const isTrialExpired = now > trialEndsAt
    const isPlanExpired = !!planExpiresAt && now > planExpiresAt

    // Um plano só dá acesso quando está ATIVO (webhook de pagamento confirmado)
    // ou possui vencimento futuro. Assinatura "pending" (boleto não pago) NÃO libera.
    const hasActivePlan = isPaidPlan && !isPlanExpired && (store.planStatus === 'active' || !!planExpiresAt)

    const hasAccess = !isTrialExpired || hasActivePlan
    const shouldBeBlocked = !hasAccess || store.isBlocked

    if (shouldBeBlocked && !store.isBlocked) {
      await prisma.store.update({ where: { id: store.id }, data: { isBlocked: true } })
    }

    // Dias restantes (plano ativo tem prioridade; senão, teste)
    let daysRemaining = 0
    if (hasActivePlan) {
      daysRemaining = planExpiresAt ? Math.max(0, Math.ceil((planExpiresAt.getTime() - now.getTime()) / DAY)) : 30
    } else if (!isTrialExpired) {
      daysRemaining = Math.max(0, Math.ceil((trialEndsAt.getTime() - now.getTime()) / DAY))
    }

    const referredCount = await prisma.store.count({ where: { referredBy: store.id } })

    return success({
      storeId: store.id,
      plan: store.plan,
      planStatus: store.planStatus,
      trialStartsAt: store.trialStartsAt,
      trialEndsAt,
      planExpiresAt,
      isTrialExpired,
      isPaid: hasActivePlan,
      isPlanExpired,
      isBlocked: shouldBeBlocked,
      daysRemaining,
      storeName: store.name,
      hasCpf: !!store.cpfCnpj,
      referralCode: store.referralCode,
      referralCredits: store.referralCredits,
      referredCount,
    })
  } catch (e: any) {
    return error(e.message || 'Erro ao verificar status', 500)
  }
}
