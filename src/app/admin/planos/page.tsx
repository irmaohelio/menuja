"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

const plans = [
  {
    id: "monthly",
    name: "Mensal",
    price: 34.90,
    period: "mês",
    total: "R$ 34.90/mês",
    icon: "📅",
    features: [
      "Produtos ilimitados",
      "Pedidos ilimitados",
      "Link da loja personalizado",
      "Suporte por WhatsApp",
      "Relatórios de vendas",
      "Sem marca d'água",
    ],
    popular: false,
    savings: null,
  },
  {
    id: "semiannual",
    name: "Semestral",
    price: 199.90,
    period: "6 meses",
    total: "R$ 199,90/semestre",
    icon: "⭐",
    features: [
      "Produtos ilimitados",
      "Pedidos ilimitados",
      "Link da loja personalizado",
      "Suporte prioritário",
      "Relatórios avançados",
      "Sem marca d'água",
    ],
    popular: true,
    savings: "Economia de R$ 9,50/mês",
  },
  {
    id: "annual",
    name: "Anual",
    price: 399.90,
    period: "ano",
    total: "R$ 399,90/ano",
    icon: "🏢",
    features: [
      "Produtos ilimitados",
      "Pedidos ilimitados",
      "Domínio próprio",
      "Suporte prioritário",
      "Relatórios avançados",
      "Sem marca d'água",
    ],
    popular: false,
    savings: "Economia de R$ 1,58/mês",
  },
]

export default function PlanosPage() {
  const router = useRouter()
  const [trial, setTrial] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [showPayment, setShowPayment] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "boleto">("pix")
  const [processing, setProcessing] = useState(false)
  const [paymentData, setPaymentData] = useState<any>(null)
  const [storeId, setStoreId] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/trial/status").then(r => r.json()).then(data => {
      if (data.success) {
        setTrial(data)
        setSelectedPlan(data.plan !== "trial" ? data.plan : null)
        setStoreId(data.storeId)
      }
      setLoading(false)
    })
  }, [])

  const handleSelectPlan = async (planId: string) => {
    setSelectedPlan(planId)
    setShowPayment(true)
    setPaymentData(null)
  }

  const handlePayment = async () => {
    if (!selectedPlan || !storeId) return
    
    setProcessing(true)
    try {
      const res = await fetch("/api/asaas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId,
          planId: selectedPlan,
          paymentMethod
        })
      })

      const data = await res.json()
      
      if (data.success) {
        setPaymentData(data)
      } else {
        alert("Erro ao processar pagamento: " + (data.error || "Tente novamente"))
      }
    } catch (err) {
      alert("Erro de conexão. Tente novamente.")
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1,2,3].map(i => <div key={i} className="h-64 bg-gray-200 rounded-2xl" />)}
      </div>
    )
  }

  // Show payment confirmation
  if (showPayment && selectedPlan) {
    const plan = plans.find(p => p.id === selectedPlan)
    
    return (
      <div className="max-w-lg mx-auto">
        <button 
          onClick={() => { setShowPayment(false); setPaymentData(null) }}
          className="mb-4 text-gray-500 hover:text-gray-700 flex items-center gap-1"
        >
          ← Voltar aos planos
        </button>

        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h2 className="text-xl font-bold mb-4">Confirmar Assinatura</h2>
          
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">{plan?.name}</p>
                <p className="text-sm text-gray-500">{plan?.total}</p>
              </div>
              <span className="text-2xl">{plan?.icon}</span>
            </div>
          </div>

          {!paymentData ? (
            <>
              <p className="text-sm text-gray-600 mb-4">Escolha a forma de pagamento:</p>
              
              <div className="space-y-3 mb-6">
                <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition ${
                  paymentMethod === "pix" ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-gray-300"
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="pix"
                    checked={paymentMethod === "pix"}
                    onChange={() => setPaymentMethod("pix")}
                    className="w-4 h-4 text-green-600"
                  />
                  <div>
                    <p className="font-medium">PIX</p>
                    <p className="text-sm text-gray-500">Pagamento instantâneo</p>
                  </div>
                </label>

                <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition ${
                  paymentMethod === "boleto" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="boleto"
                    checked={paymentMethod === "boleto"}
                    onChange={() => setPaymentMethod("boleto")}
                    className="w-4 h-4 text-blue-600"
                  />
                  <div>
                    <p className="font-medium">Boleto Bancário</p>
                    <p className="text-sm text-gray-500">Vencimento em 3 dias</p>
                  </div>
                </label>
              </div>

              <button
                onClick={handlePayment}
                disabled={processing}
                className="w-full py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition disabled:opacity-50"
              >
                {processing ? "Processando..." : `Pagar ${plan?.total}`}
              </button>
            </>
          ) : (
            <div className="text-center">
              {paymentMethod === "pix" ? (
                <>
                  <p className="text-sm text-gray-600 mb-4">Escaneie o QR Code para pagar:</p>
                  {paymentData.payment?.encodedImage ? (
                    <img 
                      src={`data:image/png;base64,${paymentData.payment.encodedImage}`}
                      alt="PIX QR Code"
                      className="mx-auto mb-4 w-48 h-48"
                    />
                  ) : (
                    <div className="bg-gray-100 p-4 rounded-xl mb-4">
                      <p className="text-sm font-mono break-all">{paymentData.payment?.payload}</p>
                    </div>
                  )}
                  <p className="text-xs text-gray-500">Ou copie o código PIX acima</p>
                </>
              ) : (
                <>
                  <p className="text-sm text-gray-600 mb-4">Boleto gerado com sucesso!</p>
                  {paymentData.payment?.bankSlipUrl && (
                    <a 
                      href={paymentData.payment.bankSlipUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition"
                    >
                      Visualizar Boleto
                    </a>
                  )}
                </>
              )}
              
              <div className="mt-6 p-4 bg-yellow-50 rounded-xl">
                <p className="text-sm text-yellow-800">
                  ⏳ Aguardando confirmação do pagamento. 
                  Seu plano será ativado automaticamente após a confirmação.
                </p>
              </div>

              <button
                onClick={() => router.push("/admin")}
                className="mt-4 text-sm text-gray-500 hover:text-gray-700"
              >
                Voltar ao painel
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Escolha seu plano</h1>
        <p className="text-gray-500">
          {trial?.isBlocked 
            ? "Seu período de teste expirou. Escolha um plano para continuar."
            : trial?.isPaid 
              ? `Seu plano atual: ${trial.plan.toUpperCase()}`
              : "Você está no período de teste gratuito de 7 dias."}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative bg-white rounded-2xl shadow-sm border-2 transition-all ${
              plan.popular 
                ? 'border-rose-500 scale-105' 
                : selectedPlan === plan.id 
                  ? 'border-blue-500' 
                  : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-rose-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                MAIS POPULAR
              </div>
            )}
            
            <div className="p-6">
              <div className="text-center mb-4">
                <span className="text-4xl">{plan.icon}</span>
                <h3 className="text-xl font-bold mt-2">{plan.name}</h3>
                <div className="mt-2">
                  <span className="text-3xl font-bold">R$ {plan.price.toFixed(2)}</span>
                  <span className="text-gray-500">/{plan.period}</span>
                </div>
                {plan.savings && (
                  <p className="text-xs text-green-600 font-medium mt-1">{plan.savings}</p>
                )}
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <span className="text-green-500">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSelectPlan(plan.id)}
                disabled={selectedPlan === plan.id && trial?.isPaid}
                className={`w-full py-3 rounded-xl font-bold transition ${
                  selectedPlan === plan.id && trial?.isPaid
                    ? 'bg-green-100 text-green-700 cursor-default'
                    : plan.popular
                      ? 'bg-rose-600 text-white hover:bg-rose-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {selectedPlan === plan.id && trial?.isPaid ? '✓ Plano Atual' : 'Selecionar Plano'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Info */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Pagamento seguro via Pix ou Boleto Bancário</p>
        <p className="mt-1">Cancele a qualquer momento sem multa</p>
      </div>
    </div>
  )
}
