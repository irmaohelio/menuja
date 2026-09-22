import { NextRequest } from 'next/server'
export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { success, error } from '@/lib/api'

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const store = await prisma.store.findUnique({
    where: { slug, isActive: true },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      logo: true,
      banner: true,
      phone: true,
      whatsapp: true,
      address: true,
      city: true,
      state: true,
      zipCode: true,
      segment: true,
      isOpen: true,
      isTempClosed: true,
      tempClosedMsg: true,
      isBlocked: true,
      primaryColor: true,
      secondaryColor: true,
      buttonColor: true,
      headerTextColor: true,
      bannerTextColor: true,
      backgroundColor: true,
      sorveteConfig: true,
      settings: true,
      businessHours: { orderBy: { dayOfWeek: 'asc' } },
      categories: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        include: {
          products: {
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
            include: {
              optionGroups: { include: { options: { orderBy: { sortOrder: 'asc' } } }, orderBy: { sortOrder: 'asc' } },
              pizzaSizes: { orderBy: { sortOrder: 'asc' }, include: { flavors: { orderBy: { sortOrder: 'asc' } } } },
            },
          },
        },
      },
      pizzaCrusts: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
    },
  })

  if (!store) return error('Loja não encontrada', 404)

  if (store.isBlocked) {
    return success({ store: { name: store.name, slug: store.slug, logo: store.logo, isBlocked: true } })
  }

  // Filter categories by availableDays (current day of week)
  const today = new Date().getDay() // 0=Sun, 1=Mon, ..., 6=Sat
  const filteredStore = {
    ...store,
    categories: store.categories.filter((cat: any) => {
      if (!cat.availableDays || cat.availableDays.length === 0) return true
      return cat.availableDays.includes(today)
    }),
  }

  return success({ store: filteredStore })
}
