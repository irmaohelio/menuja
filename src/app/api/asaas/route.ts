import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentStore } from "@/lib/auth"

const ASAAS_API_URL = "https://api.asaas.com/v3"

function getApiKey() {
  return process.env.ASAAS_API_KEY || ""
}

const digits = (v?: string | null) => (v || "").replace(/\D/g, "")
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

const PLANS: Record<string, { name: string; value: number; cycle: string }> = {
  monthly: { name: "Plano Mensal", value: 34.9, cycle: "MONTHLY" },
  semiannual: { name: "Plano Semestral", value: 199.9, cycle: "SEMIANNUALLY" },
  annual: { name: "Plano Anual", value: 374.9, cycle: "YEARLY" },
}

type PaymentMethod = "pix" | "boleto"
const toBillingType = (m: PaymentMethod) => (m === "pix" ? "PIX" : "BOLETO")

async function asaas(path: string, init?: RequestInit) {
  return fetch(`${ASAAS_API_URL}${path}`, {
    ...init,
    headers: { access_token: getApiKey(), "Content-Type": "application/json", ...(init?.headers || {}) },
  })
}

// Create or get Asaas customer
async function getOrCreateCustomer(store: any) {
  if (store.asaasCustomerId) {
    try {
      const res = await asaas(`/customers/${store.asaasCustomerId}`)
      if (res.ok) return store.asaasCustomerId
    } catch {}
  }

  const cpfCnpj = digits(store.cpfCnpj)
  const phone = digits(store.phone)

  const res = await asaas(`/customers`, {
    method: "POST",
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
  await prisma.store.update({ where: { id: store.id }, data: { asaasCustomerId: customer.id } })
  return customer.id
}

// Busca a 1ª cobrança em aberto de uma assinatura (com pequenas tentativas)
async function getOpenPayment(subscriptionId: string) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await asaas(`/subscriptions/${subscriptionId}/payments`)
    if (res.ok) {
      const data = await res.json()
      const open = (data.data || []).find((p: any) => ["PENDING", "OVERDUE", "AWAITING_RISK_ANALYSIS"].includes(p.status))
      if (open) return open
    }
    await sleep(1200)
  }
  return null
}

async function buildPaymentInfo(payment: any, method: PaymentMethod) {
  if (method === "pix") {
    const pixRes = await asaas(`/payments/${payment.id}/pixQrCode`)
    const pix = pixRes.ok ? await pixRes.json() : {}
    return { ...pix, paymentId: payment.id }
  }
  return {
    bankSlipUrl: payment.bankSlipUrl,
    invoiceUrl: payment.invoiceUrl,
    dueDate: payment.dueDate,
    paymentId: payment.id,
  }
}

// Cancela uma assinatura e suas cobranças em aberto (evita boleto duplicado)
async function cancelSubscription(subscriptionId: string) {
  try {
    const res = await asaas(`/subscriptions/${subscriptionId}/payments`)
    if (res.ok) {
      const data = await res.json()
      for (const p of data.data || []) {
        if (["PENDING", "OVERDUE", "AWAITING_RISK_ANALYSIS"].includes(p.status)) {
          await asaas(`/payments/${p.id}`, { method: "DELETE" })
        }
      }
    }
  } catch {}
  try { await asaas(`/subscriptions/${subscriptionId}`, { method: "DELETE" }) } catch {}
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { storeId, planId, paymentMethod } = body as { storeId: string; planId: string; paymentMethod: PaymentMethod }

    if (!storeId || !planId || !paymentMethod) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Só o próprio lojista pode gerar cobrança para a sua loja
    const current = await getCurrentStore()
    if (!current || current.id !== storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const plan = PLANS[planId]
    if (!plan) return NextResponse.json({ error: "Invalid plan" }, { status: 400 })

    if (!getApiKey()) {
      return NextResponse.json({ error: "Pagamento indisponível no momento (chave Asaas não configurada)." }, { status: 500 })
    }

    const store = await prisma.store.findUnique({ where: { id: storeId } })
    if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 })

    const billingType = toBillingType(paymentMethod)

    // Se já tem plano ativo, não gera nada
    if (store.planStatus === "active") {
      return NextResponse.json({ error: "Você já possui uma assinatura ativa." }, { status: 409 })
    }

    // Reaproveita assinatura/cobrança em aberto do mesmo plano (evita duplicar)
    if (store.asaasSubscriptionId) {
      const subRes = await asaas(`/subscriptions/${store.asaasSubscriptionId}`)
      if (subRes.ok) {
        const existingSub = await subRes.json()
        const [refStore, refPlan] = (existingSub.externalReference || "").split("_")
        const samePlan = refStore === storeId && refPlan === planId

        if (samePlan) {
          const open = await getOpenPayment(store.asaasSubscriptionId)
          if (open && open.billingType === billingType) {
            // Mesma assinatura, mesma forma → devolve a cobrança em aberto
            const paymentInfo = await buildPaymentInfo(open, paymentMethod)
            return NextResponse.json({
              success: true,
              reused: true,
              subscription: { id: existingSub.id, status: existingSub.status, value: existingSub.value, nextDueDate: existingSub.nextDueDate },
              payment: { method: paymentMethod, ...paymentInfo },
            })
          }
        }
        // Assinatura inativa, de outro plano, ou sem cobrança em aberto → cancela e cria nova
        await cancelSubscription(store.asaasSubscriptionId)
      }
    }

    // Get or create Asaas customer
    const customerId = await getOrCreateCustomer(store)

    // nextDueDate é obrigatório na Asaas (primeira cobrança)
    const dueDays = paymentMethod === "boleto" ? 3 : 1
    const nextDueDate = new Date(Date.now() + dueDays * 864e5).toISOString().slice(0, 10)

    const res = await asaas(`/subscriptions`, {
      method: "POST",
      body: JSON.stringify({
        customer: customerId,
        billingType,
        value: plan.value,
        cycle: plan.cycle,
        nextDueDate,
        description: `MenuJá - ${plan.name}`,
        externalReference: `${storeId}_${planId}`,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error("Asaas subscription error:", err)
      return NextResponse.json({ error: "Failed to create subscription" }, { status: 500 })
    }

    const subscription = await res.json()
    const open = await getOpenPayment(subscription.id)
    const paymentInfo = open ? await buildPaymentInfo(open, paymentMethod) : {}

    await prisma.store.update({
      where: { id: storeId },
      data: { plan: planId, planStatus: "pending", asaasSubscriptionId: subscription.id },
    })

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        value: subscription.value,
        nextDueDate: subscription.nextDueDate,
      },
      payment: { method: paymentMethod, ...paymentInfo },
    })
  } catch (error: any) {
    console.error("Asaas error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
