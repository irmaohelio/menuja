import { getCurrentStore } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { success, unauthorized } from '@/lib/api'

export async function POST() {
  const store = await getCurrentStore()
  if (!store) return unauthorized()

  const updated = await prisma.store.update({
    where: { id: store.id },
    data: { isOpen: !store.isOpen },
  })

  return success({ isOpen: updated.isOpen })
}
