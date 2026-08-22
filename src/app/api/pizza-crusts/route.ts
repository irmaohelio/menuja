import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"

async function getStore() {
  const cookieStore = await cookies()
  const userId = cookieStore.get("userId")?.value
  if (!userId) return null
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { store: true } })
  return user?.store
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
