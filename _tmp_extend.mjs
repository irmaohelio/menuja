import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const newEnd = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000) // 6 meses

const updated = await prisma.store.update({
  where: { slug: 'acaiteria-santos' },
  data: { trialEndsAt: newEnd, isBlocked: false },
  select: { name: true, plan: true, trialEndsAt: true, isBlocked: true },
})

console.log('Atualizado:', JSON.stringify(updated, null, 2))
await prisma.$disconnect()
