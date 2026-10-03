import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

const ASAAS_API_URL = "https://api.asaas.com/v3"
const PAID_STATUSES = ["RECEIVED", "CONFIRMED", "RECEIVED_IN_CASH"]
const CANCELLED_STATUSES = ["REFUNDED", "DELETED", "CHARGEBACK_REQUESTED", "REFUND_IN_PROGRESS", "PARTIALLY_REFUNDED"]

// Busca o pagamento na Asaas para confirmar que o evento é real (não dá para forjar)
async function getPaymentFromAsaas(paymentId?: string) {
  const apiKey = process.env.ASAAS_API_KEY
  if (!apiKey || !paymentId) return null
  try {
    const res = await fetch(`${ASAAS_API_URL}/payments/${paymentId}`, {
      headers: { access_token: apiKey },
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

// Descobre a loja/plano: pelo externalReference ("storeId_planId") ou pela assinatura
async function resolveStore(payment: any): Promise<{ storeId: string; planId: string } | null> {
  const [refStore, refPlan] = (payment.externalReference || "").split("_")
  if (refStore && refPlan) return { storeId: refStore, planId: refPlan }

  if (payment.subscription) {
    const store = await prisma.store.findFirst({
      where: { asaasSubscriptionId: payment.subscription },
      select: { id: true, plan: true },
    })
    if (store) return { storeId: store.id, planId: store.plan }
  }
  return null
}

async function handlePaymentConfirmed(payment: any) {
  const real = await getPaymentFromAsaas(payment?.id)
  if (!real || !PAID_STATUSES.includes(real.status)) {
    console.log("Webhook ignorado (pagamento não confirmado):", payment?.id, real?.status)
    return
  }

  const resolved = await resolveStore(real)
  if (!resolved) return
  const { storeId, planId } = resolved

  const expiresAt = new Date()
  switch (planId) {
    case "semiannual": expiresAt.setMonth(expiresAt.getMonth() + 6); break
    case "annual": expiresAt.setFullYear(expiresAt.getFullYear() + 1); break
    default: expiresAt.setMonth(expiresAt.getMonth() + 1)
  }

  await prisma.store.update({
    where: { id: storeId },
    data: { plan: planId, planStatus: "active", planExpiresAt: expiresAt, isBlocked: false },
  })
  console.log(`Loja ${storeId} ativada no plano ${planId} até ${expiresAt.toISOString()}`)
}

async function handlePaymentOverdue(payment: any) {
  const real = await getPaymentFromAsaas(payment?.id)
  if (!real || real.status !== "OVERDUE") return
  const resolved = await resolveStore(real)
  if (!resolved) return
  await prisma.store.update({ where: { id: resolved.storeId }, data: { planStatus: "overdue" } })
  console.log(`Loja ${resolved.storeId} com pagamento em atraso`)
}

async function handlePaymentCancelled(payment: any) {
  const real = await getPaymentFromAsaas(payment?.id)
  if (!real || !CANCELLED_STATUSES.includes(real.status)) return
  const resolved = await resolveStore(real)
  if (!resolved) return
  await prisma.store.update({ where: { id: resolved.storeId }, data: { planStatus: "cancelled" } })
  console.log(`Loja ${resolved.storeId} cancelada/estornada`)
}

export async function POST(req: NextRequest) {
  try {
    // Proteção extra: se ASAAS_WEBHOOK_TOKEN estiver configurado, exige o header
    const webhookToken = process.env.ASAAS_WEBHOOK_TOKEN
    if (webhookToken && req.headers.get("asaas-access-token") !== webhookToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

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
      case "PAYMENT_PARTIALLY_REFUNDED":
      case "PAYMENT_CHARGEBACK_REQUESTED":
        await handlePaymentCancelled(payment)
        break
      default:
        break
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
