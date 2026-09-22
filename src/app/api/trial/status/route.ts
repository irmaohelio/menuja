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
        cpfCnpj: true,
        referralCode: true,
        referralCredits: true,
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
    } else if (isPaid) {
      // Paid plan — use planExpiresAt if available, otherwise assume active
      if (store.planExpiresAt && !isPlanExpired) {
        const diffMs = new Date(store.planExpiresAt).getTime() - now.getTime()
        daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
      } else if (!store.planExpiresAt) {
        // planExpiresAt not set yet (e.g. just subscribed) — assume30 days from trial start
        const estimatedEnd = new Date(store.trialStartsAt)
        estimatedEnd.setDate(estimatedEnd.getDate() + 30)
        const diffMs = estimatedEnd.getTime() - now.getTime()
        daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))
      }
    }

    // Apply referral credits automatically (1 credit = 30 days)
    if (store.referralCredits > 0) {
      const creditsToApply = store.referralCredits
      const daysToAdd = creditsToApply * 30
      
      // Extend trial or plan expiration
      if (!isPaid) {
        // Extend trial
        const newTrialEnd = new Date(trialEndsAt)
        newTrialEnd.setDate(newTrialEnd.getDate() + daysToAdd)
        await prisma.store.update({
          where: { id: store.id },
          data: { 
            trialEndsAt: newTrialEnd,
            referralCredits: 0 
          },
        })
        // Recalculate
        const diffMs = newTrialEnd.getTime() - now.getTime()
        daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
      } else if (store.planExpiresAt) {
        // Extend paid plan
        const newPlanEnd = new Date(store.planExpiresAt)
        newPlanEnd.setDate(newPlanEnd.getDate() + daysToAdd)
        await prisma.store.update({
          where: { id: store.id },
          data: { 
            planExpiresAt: newPlanEnd,
            referralCredits: 0 
          },
        })
        // Recalculate
        const diffMs = newPlanEnd.getTime() - now.getTime()
        daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
      }
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

    // Count how many stores were referred by this store
    const referredCount = await prisma.store.count({
      where: { referredBy: store.id },
    })

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
      hasCpf: !!store.cpfCnpj,
      referralCode: store.referralCode,
      referralCredits: store.referralCredits,
      referredCount,
    })
  } catch (e: any) {
    return error(e.message || 'Erro ao verificar status', 500)
  }
}
