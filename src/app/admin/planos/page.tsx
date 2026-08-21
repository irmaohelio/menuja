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

  useEffect(() => {
    fetch("/api/trial/status").then(r => r.json()).then(data => {
      if (data.success) {
        setTrial(data)
        setSelectedPlan(data.plan !== "trial" ? data.plan : null)
      }
      setLoading(false)
    })
  }, [])

  const handleSelectPlan = async (planId: string) => {
    const plan = plans.find(p => p.id === planId)
    setSelectedPlan(planId)
    
    const confirmed = confirm(`Deseja assinar o plano ${plan?.name} por ${plan?.total}?\n\nEm produção, isso abriria o pagamento via Pix ou cartão.`)
    
    if (confirmed) {
      alert("Plano ativado com sucesso! (Simulação)\n\nEm produção, o plano seria ativado após confirmação do pagamento.")
      router.push("/admin")
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1,2,3].map(i => <div key={i} className="h-64 bg-gray-200 rounded-2xl" />)}
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
                disabled={selectedPlan === plan.id}
                className={`w-full py-3 rounded-xl font-bold transition ${
                  selectedPlan === plan.id
                    ? 'bg-green-100 text-green-700 cursor-default'
                    : plan.popular
                      ? 'bg-rose-600 text-white hover:bg-rose-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {selectedPlan === plan.id ? '✓ Plano Atual' : 'Selecionar Plano'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Info */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Pagamento seguro via Pix ou cartão de crédito</p>
        <p className="mt-1">Cancele a qualquer momento sem multa</p>
      </div>
    </div>
  )
}
