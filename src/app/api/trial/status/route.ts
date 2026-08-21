import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { success, error } from '@/lib/api'

export const dynamic = 'force-dynamic'

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
        trialStartsAt: true,
        trialEndsAt: true,
        planExpiresAt: true,
        isBlocked: true,
        isActive: true,
      },
    })

    if (!store) return error('Loja não encontrada', 404)

    const now = new Date()
    const trialEndsAt = new Date(store.trialEndsAt)
    const isTrialExpired = now > trialEndsAt
    const isPaid = store.plan !== 'trial'
    const isPlanExpired = store.planExpiresAt ? now > new Date(store.planExpiresAt) : false

    // Calculate days remaining
    let daysRemaining = 0
    if (!isTrialExpired && !isPaid) {
      const diffMs = trialEndsAt.getTime() - now.getTime()
      daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
    } else if (isPaid && store.planExpiresAt && !isPlanExpired) {
      const diffMs = new Date(store.planExpiresAt).getTime() - now.getTime()
      daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
    }

    // Determine if store should be blocked
    const shouldBeBlocked = store.isBlocked || 
      (!isPaid && isTrialExpired) || 
      (isPaid && isPlanExpired)

    // Update block status if needed
    if (shouldBeBlocked && !store.isBlocked) {
      await prisma.store.update({
        where: { id: store.id },
        data: { isBlocked: true },
      })
    }

    return success({
      storeId: store.id,
      plan: store.plan,
      trialStartsAt: store.trialStartsAt,
      trialEndsAt: store.trialEndsAt,
      planExpiresAt: store.planExpiresAt,
      isTrialExpired,
      isPaid,
      isPlanExpired,
      isBlocked: shouldBeBlocked,
      daysRemaining,
      storeName: store.name,
    })
  } catch (e: any) {
    return error(e.message || 'Erro ao verificar status', 500)
  }
}
