import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { success, error } from '@/lib/api'

export const dynamic = 'force-dynamic'

// Generate a unique referral code
function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// GET - Get current store's referral code and stats
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return error('Não autenticado', 401)

    const store = await prisma.store.findUnique({
      where: { userId: user.id },
      select: {
        id: true,
        referralCode: true,
        referralCredits: true,
        plan: true,
      },
    })

    if (!store) return error('Loja não encontrada', 404)

    // Generate referral code if not exists
    if (!store.referralCode) {
      let code = generateReferralCode()
      let exists = true
      
      while (exists) {
        const existing = await prisma.store.findUnique({
          where: { referralCode: code },
        })
        if (!existing) {
          exists = false
        } else {
          code = generateReferralCode()
        }
      }

      await prisma.store.update({
        where: { id: store.id },
        data: { referralCode: code },
      })

      store.referralCode = code
    }

    // Count how many stores were referred by this store
    const referredCount = await prisma.store.count({
      where: { referredBy: store.id },
    })

    return success({
      referralCode: store.referralCode,
      referralCredits: store.referralCredits,
      referredCount,
      referralLink: `https://menuja.app.br/cadastro?ref=${store.referralCode}`,
    })
  } catch (e: any) {
    return error(e.message || 'Erro ao buscar indicações', 500)
  }
}

// POST - Apply a referral code during registration
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { referralCode, storeId } = body

    if (!referralCode || !storeId) {
      return error('Código de indicação e ID da loja são obrigatórios', 400)
    }

    // Find the referrer store
    const referrerStore = await prisma.store.findUnique({
      where: { referralCode: referralCode.toUpperCase() },
    })

    if (!referrerStore) {
      return error('Código de indicação inválido', 400)
    }

    if (referrerStore.id === storeId) {
      return error('Você não pode indicar a si mesmo', 400)
    }

    // Check if this store was already referred
    const currentStore = await prisma.store.findUnique({
      where: { id: storeId },
    })

    if (!currentStore) return error('Loja não encontrada', 404)

    if (currentStore.referredBy) {
      return error('Esta loja já foi indicada por outro usuário', 400)
    }

    // Apply the referral
    await prisma.store.update({
      where: { id: storeId },
      data: { referredBy: referrerStore.id },
    })

    // Give credit to the referrer (1 month free = 1 credit)
    await prisma.store.update({
      where: { id: referrerStore.id },
      data: { referralCredits: { increment: 1 } },
    })

    return success({
      message: 'Código de indicação aplicado com sucesso!',
      creditsEarned: 1,
    })
  } catch (e: any) {
    return error(e.message || 'Erro ao aplicar indicação', 500)
  }
}
