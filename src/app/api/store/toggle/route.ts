import { getCurrentStore } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { success, unauthorized } from '@/lib/api'

export async function POST() {
  const store = await getCurrentStore()
  if (!store) return unauthorized()

  const newIsOpen = !store.isOpen

  const updated = await prisma.store.update({
    where: { id: store.id },
    data: {
      isOpen: newIsOpen,
      // When explicitly opening the store, also clear temp-closed state
      ...(newIsOpen ? { isTempClosed: false, tempClosedMsg: null } : {}),
    },
  })

  return success({ isOpen: updated.isOpen, isTempClosed: updated.isTempClosed })
}
