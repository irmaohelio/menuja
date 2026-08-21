import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const ASAAS_API_URL = "https://api.asaas.com/v3"

function getApiKey() {
  return process.env.ASAAS_API_KEY || ""
}

// Create or get Asaas customer
async function getOrCreateCustomer(store: any) {
  const apiKey = getApiKey()
  
  // Check if customer already exists in Asaas
  if (store.asaasCustomerId) {
    try {
      const res = await fetch(`${ASAAS_API_URL}/customers/${store.asaasCustomerId}`, {
        headers: { "access_token": apiKey }
      })
      if (res.ok) return store.asaasCustomerId
    } catch {}
  }

  // Create new customer
  const res = await fetch(`${ASAAS_API_URL}/customers`, {
    method: "POST",
    headers: {
      "access_token": apiKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: store.name,
      email: store.email || `${store.slug}@menuja.com.br`,
      phone: store.phone || "",
      cpfCnpj: store.cpfCnpj || "",
      externalReference: store.id
    })
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Failed to create Asaas customer: ${err}`)
  }

  const customer = await res.json()
  
  // Save Asaas customer ID
  await prisma.store.update({
    where: { id: store.id },
    data: { asaasCustomerId: customer.id }
  })

  return customer.id
}

// POST /api/asaas/subscribe
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
      monthly: { name: "Plano Mensal", value: 34.90, cycle: "MONTHLY" },
      semiannual: { name: "Plano Semestral", value: 199.90, cycle: "SEMIANNUALLY" },
      annual: { name: "Plano Anual", value: 399.90, cycle: "YEARLY" }
    }

    const plan = plans[planId]
    if (!plan) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
    }

    // Get or create Asaas customer
    const customerId = await getOrCreateCustomer(store)
    const apiKey = getApiKey()

    // Create subscription
    const subscriptionData: any = {
      customer: customerId,
      billingType: paymentMethod === "pix" ? "PIX" : "BOLETO",
      value: plan.value,
      cycle: plan.cycle,
      description: `MenuJá - ${plan.name}`,
      externalReference: `${storeId}_${planId}`
    }

    const res = await fetch(`${ASAAS_API_URL}/subscriptions`, {
      method: "POST",
      headers: {
        "access_token": apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(subscriptionData)
    })

    if (!res.ok) {
      const err = await res.text()
      console.error("Asaas subscription error:", err)
      return NextResponse.json({ error: "Failed to create subscription" }, { status: 500 })
    }

    const subscription = await res.json()

    // Get the first payment from the subscription
    let paymentInfo: any = {}
    
    const paymentsRes = await fetch(`${ASAAS_API_URL}/subscriptions/${subscription.id}/payments`, {
      headers: { "access_token": apiKey }
    })
    
    if (paymentsRes.ok) {
      const paymentsData = await paymentsRes.json()
      const payment = paymentsData.data?.[0]
      
      if (payment) {
        if (paymentMethod === "pix") {
          // Get PIX QR code from the payment
          const pixRes = await fetch(`${ASAAS_API_URL}/payments/${payment.id}/pixQrCode`, {
            headers: { "access_token": apiKey }
          })
          if (pixRes.ok) {
            paymentInfo = await pixRes.json()
          }
        } else {
          // Get boleto URL from the payment
          const boletoRes = await fetch(`${ASAAS_API_URL}/payments/${payment.id}/identificationField`, {
            headers: { "access_token": apiKey }
          })
          if (boletoRes.ok) {
            paymentInfo = await boletoRes.json()
          }
        }
        paymentInfo.paymentId = payment.id
      }
    }

    // Update store with subscription info
    await prisma.store.update({
      where: { id: storeId },
      data: {
        plan: planId,
        planStatus: "pending",
        asaasSubscriptionId: subscription.id
      }
    })

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        value: subscription.value,
        nextDueDate: subscription.nextDueDate
      },
      payment: {
        method: paymentMethod,
        ...paymentInfo
      }
    })

  } catch (error: any) {
    console.error("Asaas error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
