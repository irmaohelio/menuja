import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isWithinBusinessHours } from '@/lib/business-hours'

export const dynamic = 'force-dynamic'

// Lightweight endpoint: returns isOpen + isTempClosed + withinHours
// Used by store page for fast polling (no heavy joins)
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const store = await prisma.store.findUnique({
    where: { slug, isActive: true },
    select: {
      isOpen: true,
      isTempClosed: true,
      tempClosedMsg: true,
      businessHours: true,
    },
  })

  if (!store) {
    return Response.json({ isOpen: false, isTempClosed: false, withinHours: false }, {
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' }
    })
  }

  const withinHours = isWithinBusinessHours(store.businessHours)

  return Response.json({
    isOpen: store.isOpen,
    isTempClosed: store.isTempClosed,
    tempClosedMsg: store.tempClosedMsg,
    withinHours,
  }, {
    headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' }
  })
}
