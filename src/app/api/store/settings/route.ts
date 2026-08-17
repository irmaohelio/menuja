import { NextRequest } from 'next/server'
import { getCurrentStore } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { success, error, unauthorized } from '@/lib/api'

export const dynamic = 'force-dynamic'

export async function GET() {
  const store = await getCurrentStore()
  if (!store) return unauthorized()

  const settings = await prisma.storeSettings.findUnique({ where: { storeId: store.id } })
  const hours = await prisma.businessHour.findMany({ where: { storeId: store.id }, orderBy: { dayOfWeek: 'asc' } })

  return success({ store, settings, businessHours: hours })
}

export async function PUT(req: NextRequest) {
  const store = await getCurrentStore()
  if (!store) return unauthorized()

  const body = await req.json()
  const { storeData, settingsData, businessHours } = body

  if (storeData) {
    // Only send scalar fields, strip nested objects (settings, categories, etc.)
    const { settings, categories, products, customers, orders, businessHours, highlights, notifications, pizzaCrusts, user, ...scalarData } = storeData
    await prisma.store.update({ where: { id: store.id }, data: scalarData })
  }

  if (settingsData) {
    // Strip system fields that Prisma doesn't accept in update
    const { id: _id, storeId: _sid, createdAt: _ct, updatedAt: _ut, ...cleanSettings } = settingsData
    await prisma.storeSettings.upsert({
      where: { storeId: store.id },
      update: cleanSettings,
      create: { storeId: store.id, ...cleanSettings },
    })
  }

  if (businessHours) {
    for (const hour of businessHours) {
      const { id: _hid, storeId: _hsid, createdAt: _hct, updatedAt: _hut, ...cleanHour } = hour
      await prisma.businessHour.upsert({
        where: { storeId_dayOfWeek: { storeId: store.id, dayOfWeek: hour.dayOfWeek } },
        update: cleanHour,
        create: { storeId: store.id, ...cleanHour },
      })
    }
  }

  return success({ message: 'Configurações salvas' })
}
