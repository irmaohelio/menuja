"use client"
import { useState, useEffect } from "react"

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    fetch("/api/dashboard").then(r => r.json()).then(data => {
      if (data.success) setStats(data)
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
    </div>
  )
}
