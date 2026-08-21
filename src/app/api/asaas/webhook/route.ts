import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// POST /api/asaas/webhook
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { event, payment } = body

    console.log("Asaas webhook:", event, payment?.id)

    switch (event) {
      case "PAYMENT_RECEIVED":
      case "PAYMENT_CONFIRMED":
        await handlePaymentConfirmed(payment)
        break

      case "PAYMENT_OVERDUE":
        await handlePaymentOverdue(payment)
        break

      case "PAYMENT_DELETED":
      case "PAYMENT_REFUNDED":
        await handlePaymentCancelled(payment)
        break

      default:
        console.log("Unhandled Asaas event:", event)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

async function handlePaymentConfirmed(payment: any) {
  const externalRef = payment.externalReference
  if (!externalRef) return

  const [storeId, planId] = externalRef.split("_")
  if (!storeId || !planId) return

  // Calculate expiration date
  const now = new Date()
  let expiresAt: Date
  
  switch (planId) {
    case "monthly":
      expiresAt = new Date(now.setMonth(now.getMonth() + 1))
      break
    case "semiannual":
      expiresAt = new Date(now.setMonth(now.getMonth() + 6))
      break
    case "annual":
      expiresAt = new Date(now.setFullYear(now.getFullYear() + 1))
      break
    default:
      expiresAt = new Date(now.setMonth(now.getMonth() + 1))
  }

  await prisma.store.update({
    where: { id: storeId },
    data: {
      plan: planId,
      planStatus: "active",
      planExpiresAt: expiresAt,
      isBlocked: false
    }
  })

  console.log(`Store ${storeId} activated with plan ${planId}`)
}

async function handlePaymentOverdue(payment: any) {
  const externalRef = payment.externalReference
  if (!externalRef) return

  const [storeId] = externalRef.split("_")
  if (!storeId) return

  await prisma.store.update({
    where: { id: storeId },
    data: { planStatus: "overdue" }
  })

  console.log(`Store ${storeId} payment overdue`)
}

async function handlePaymentCancelled(payment: any) {
  const externalRef = payment.externalReference
  if (!externalRef) return

  const [storeId] = externalRef.split("_")
  if (!storeId) return

  await prisma.store.update({
    where: { id: storeId },
    data: {
      planStatus: "cancelled",
      plan: "trial"
    }
  })

  console.log(`Store ${storeId} subscription cancelled`)
}
