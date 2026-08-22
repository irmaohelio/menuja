import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

async function getStore() {
  const user = await getCurrentUser()
  if (!user) return null
  const store = await prisma.store.findFirst({ where: { userId: user.id as string } })
  return store
}

export async function PUT(req: NextRequest) {
  const store = await getStore()
  if (!store) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { crusts } = await req.json()

  // Delete existing crusts
  await prisma.pizzaCrust.deleteMany({ where: { storeId: store.id } })

  // Create new crusts
  if (crusts && crusts.length > 0) {
    await prisma.pizzaCrust.createMany({
      data: crusts.map((c: any, i: number) => ({
        storeId: store.id,
        name: c.name,
        price: c.price || 0,
        sortOrder: i,
      })),
    })
  }

  return NextResponse.json({ success: true })
}
