"use client"
import { useState, useEffect } from "react"
import Link from "next/link"

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [trial, setTrial] = useState<any>(null)

  useEffect(() => {
    fetch("/api/dashboard").then(r => r.json()).then(data => {
      if (data.success) setStats(data)
    })
    fetch("/api/trial/status").then(r => r.json()).then(data => {
      if (data.success) setTrial(data)
    })
  }, [])

  if (!stats) return <div className="animate-pulse space-y-4">{[1,2,3].map(i => <div key={i} className="h-24 bg-gray-200 rounded-xl" />)}</div>

  const cards = [
    { label: "Receita Hoje", value: `R$ ${stats.todayRevenue.toFixed(2)}`, icon: "💰", color: "bg-green-50 text-green-700" },
    { label: "Receita Semana", value: `R$ ${stats.weekRevenue.toFixed(2)}`, icon: "📈", color: "bg-blue-50 text-blue-700" },
    { label: "Receita Mês", value: `R$ ${stats.monthRevenue.toFixed(2)}`, icon: "📊", color: "bg-purple-50 text-purple-700" },
    { label: "Pedidos Hoje", value: stats.todayOrders, icon: "🔔", color: "bg-orange-50 text-orange-700" },
    { label: "Pedidos Pendentes", value: stats.pendingOrders, icon: "⏳", color: "bg-yellow-50 text-yellow-700" },
    { label: "Produtos", value: stats.totalProducts, icon: "📦", color: "bg-rose-50 text-rose-700" },
  ]

  return (
    <div>
      {/* Trial Banner */}
      {trial && (
        <div className={`mb-6 p-4 rounded-2xl ${
          trial.isBlocked 
            ? 'bg-red-50 border-2 border-red-200' 
            : trial.daysRemaining <= 2 
              ? 'bg-yellow-50 border-2 border-yellow-200' 
              : 'bg-blue-50 border-2 border-blue-200'
        }`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className={`font-bold ${
                trial.isBlocked ? 'text-red-700' : trial.daysRemaining <= 2 ? 'text-yellow-700' : 'text-blue-700'
              }`}>
                {trial.isBlocked 
                  ? '⛔ Período de teste expirado' 
                  : trial.isPaid 
                    ? `✅ Plano ${trial.plan === 'monthly' ? 'Mensal' : trial.plan === 'semiannual' ? 'Semestral' : 'Anual'} ativo`
                    : `🎁 Período de teste — ${trial.daysRemaining} dias restantes`}
              </h3>
              <p className={`text-sm mt-1 ${
                trial.isBlocked ? 'text-red-600' : trial.daysRemaining <= 2 ? 'text-yellow-600' : 'text-blue-600'
              }`}>
                {trial.isBlocked 
                  ? 'Para continuar usando o MenuJá, escolha um plano abaixo.'
                  : trial.isPaid 
                    ? trial.planExpiresAt
                      ? `Expira em ${new Date(trial.planExpiresAt).toLocaleDateString('pt-BR')} (${trial.daysRemaining} dias)`
                      : `Seu plano ${trial.plan} está ativo`
                    : `Seu teste gratuito expira em ${new Date(trial.trialEndsAt).toLocaleDateString('pt-BR')}`}
              </p>
            </div>
            {(trial.isBlocked || trial.daysRemaining <= 3) && (
              <Link
                href="/admin/planos"
                className={`px-5 py-2.5 rounded-xl font-bold text-white transition ${
                  trial.isBlocked ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {trial.isBlocked ? 'Escolher Plano' : 'Ver Planos'}
              </Link>
            )}
          </div>
        </div>
      )}

      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c, i) => (
          <div key={i} className={`${c.color} p-5 rounded-2xl`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{c.icon}</span>
            </div>
            <p className="text-2xl font-bold">{c.value}</p>
            <p className="text-sm opacity-70">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Referral Program */}
      <div className="mt-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white">
        <h2 className="text-xl font-bold mb-2">🎁 Indique e Ganhe</h2>
        <p className="text-purple-100 mb-4">Indique amigos e ganhe 1 mês grátis para cada indicação!</p>
        
        <div className="bg-white/20 rounded-xl p-4 mb-4">
          <p className="text-sm text-purple-100 mb-1">Seu link de indicação:</p>
          <div className="flex items-center gap-2">
            <input 
              type="text" 
              value={`https://menuja.app.br/cadastro?ref=${trial?.referralCode || '...'}`}
              readOnly
              className="flex-1 bg-white/10 px-3 py-2 rounded-lg text-white text-sm"
            />
            <button 
              onClick={() => {
                navigator.clipboard.writeText(`https://menuja.app.br/cadastro?ref=${trial?.referralCode || ''}`)
                alert('Link copiado!')
              }}
              className="px-4 py-2 bg-white text-purple-600 rounded-lg font-medium text-sm hover:bg-purple-50 transition"
            >
              Copiar
            </button>
          </div>
        </div>

        <div className="flex gap-4 text-center">
          <div className="flex-1 bg-white/10 rounded-xl p-3">
            <p className="text-2xl font-bold">{trial?.referredCount || 0}</p>
            <p className="text-xs text-purple-100">Indicações</p>
          </div>
          <div className="flex-1 bg-white/10 rounded-xl p-3">
            <p className="text-2xl font-bold">{trial?.referralCredits || 0}</p>
            <p className="text-xs text-purple-100">Meses Grátis</p>
          </div>
        </div>
      </div>
    </div>
  )
}
