import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const ASAAS_API_URL = "https://api.asaas.com/v3"

function getApiKey() {
  return process.env.ASAAS_API_KEY || ""
}

const digits = (v?: string | null) => (v || "").replace(/\D/g, "")

// Create or get Asaas customer
async function getOrCreateCustomer(store: any) {
  const apiKey = getApiKey()

  // Check if customer already exists in Asaas
  if (store.asaasCustomerId) {
    try {
      const res = await fetch(`${ASAAS_API_URL}/customers/${store.asaasCustomerId}`, {
        headers: { access_token: apiKey },
      })
      if (res.ok) return store.asaasCustomerId
    } catch {}
  }

  const cpfCnpj = digits(store.cpfCnpj)
  const phone = digits(store.phone)

  // Create new customer (omite campos vazios para não serem rejeitados pela Asaas)
  const res = await fetch(`${ASAAS_API_URL}/customers`, {
    method: "POST",
    headers: {
      access_token: apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: store.name,
      email: store.email || `${store.slug}@menuja.com.br`,
      ...(phone ? { phone } : {}),
      ...(cpfCnpj ? { cpfCnpj } : {}),
      externalReference: store.id,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Failed to create Asaas customer: ${err}`)
  }

  const customer = await res.json()

  // Save Asaas customer ID
  await prisma.store.update({
    where: { id: store.id },
    data: { asaasCustomerId: customer.id },
  })

  return customer.id
}

// POST /api/asaas  → cria a assinatura e retorna a 1ª cobrança (PIX ou Boleto)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { storeId, planId, paymentMethod } = body

    if (!storeId || !planId || !paymentMethod) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const store = await prisma.store.findUnique({ where: { id: storeId } })
    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 })
    }

    // Plan pricing
    const plans: Record<string, { name: string; value: number; cycle: string }> = {
      monthly: { name: "Plano Mensal", value: 34.9, cycle: "MONTHLY" },
      semiannual: { name: "Plano Semestral", value: 199.9, cycle: "SEMIANNUALLY" },
      annual: { name: "Plano Anual", value: 374.9, cycle: "YEARLY" },
    }

    const plan = plans[planId]
    if (!plan) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
    }

    if (!getApiKey()) {
      return NextResponse.json({ error: "Pagamento indisponível no momento (chave Asaas não configurada)." }, { status: 500 })
    }

    // Get or create Asaas customer
    const customerId = await getOrCreateCustomer(store)
    const apiKey = getApiKey()

    // nextDueDate é obrigatório na Asaas (primeira cobrança)
    const dueDays = paymentMethod === "boleto" ? 3 : 1
    const nextDueDate = new Date(Date.now() + dueDays * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

    // Create subscription
    const subscriptionData: any = {
      customer: customerId,
      billingType: paymentMethod === "pix" ? "PIX" : "BOLETO",
      value: plan.value,
      cycle: plan.cycle,
      nextDueDate,
      description: `MenuJá - ${plan.name}`,
      externalReference: `${storeId}_${planId}`,
    }

    const res = await fetch(`${ASAAS_API_URL}/subscriptions`, {
      method: "POST",
      headers: {
        access_token: apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(subscriptionData),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error("Asaas subscription error:", err)
      return NextResponse.json({ error: "Failed to create subscription" }, { status: 500 })
    }

    const subscription = await res.json()

    // Busca a 1ª cobrança (pode levar um instante para ser gerada)
    let payment: any = null
    for (let attempt = 0; attempt < 3 && !payment; attempt++) {
      const paymentsRes = await fetch(`${ASAAS_API_URL}/subscriptions/${subscription.id}/payments`, {
        headers: { access_token: apiKey },
      })
      if (paymentsRes.ok) {
        const paymentsData = await paymentsRes.json()
        payment = paymentsData.data?.[0] || null
      }
      if (!payment) await new Promise((r) => setTimeout(r, 1500))
    }

    let paymentInfo: any = {}

    if (payment) {
      if (paymentMethod === "pix") {
        const pixRes = await fetch(`${ASAAS_API_URL}/payments/${payment.id}/pixQrCode`, {
          headers: { access_token: apiKey },
        })
        if (pixRes.ok) paymentInfo = await pixRes.json()
      } else {
        paymentInfo = {
          bankSlipUrl: payment.bankSlipUrl,
          invoiceUrl: payment.invoiceUrl,
          dueDate: payment.dueDate,
        }
      }
      paymentInfo.paymentId = payment.id
    }

    // Update store with subscription info
    await prisma.store.update({
      where: { id: storeId },
      data: {
        plan: planId,
        planStatus: "pending",
        asaasSubscriptionId: subscription.id,
      },
    })

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        value: subscription.value,
        nextDueDate: subscription.nextDueDate,
      },
      payment: {
        method: paymentMethod,
        ...paymentInfo,
      },
    })
  } catch (error: any) {
    console.error("Asaas error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
