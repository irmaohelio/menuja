"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function MasterPage() {
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/master").then(r => r.json()).then(d => {
      if (!d.success) { router.push("/login"); return }
      setData(d)
      setLoading(false)
    }).catch(() => router.push("/login"))
  }, [router])

  const toggleStore = async (storeId: string, isActive: boolean) => {
    await fetch("/api/master", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storeId, isActive: !isActive }),
    })
    const res = await fetch("/api/master")
    const d = await res.json()
    if (d.success) setData(d)
  }

  const deleteStore = async (storeId: string, storeName: string) => {
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir a loja "${storeName}"?\n\nEssa ação não pode ser desfeita. Todos os pedidos, produtos e dados serão perdidos.`
    )
    if (!confirmed) return

    await fetch("/api/master", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storeId }),
    })
    const res = await fetch("/api/master")
    const d = await res.json()
    if (d.success) setData(d)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-rose-600 border-t-transparent rounded-full" />
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">👑 Painel Master</h1>
            <p className="text-gray-500">Gerenciamento da plataforma</p>
          </div>
          <button onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); router.push("/") }}
            className="text-sm text-gray-500 hover:text-red-600">Sair</button>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Lojas", value: data.totalStores, icon: "🏪" },
            { label: "Lojas Ativas", value: data.activeStores, icon: "✅" },
            { label: "Pedidos", value: data.totalOrders, icon: "📦" },
            { label: "Receita Mês", value: `R$ ${data.monthRevenue.toFixed(2)}`, icon: "💰" },
          ].map((s, i) => (
            <div key={i} className="bg-white p-5 rounded-2xl shadow-sm">
              <span className="text-2xl">{s.icon}</span>
              <p className="text-2xl font-bold mt-2">{s.value}</p>
              <p className="text-sm text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Stores */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="font-bold text-lg">Lojas cadastradas</h2>
          </div>
          <div className="divide-y">
            {data.stores.map((store: any) => (
              <div key={store.id} className="p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{store.name}</p>
                  <p className="text-sm text-gray-500">{store.user?.name} • {store.user?.email}</p>
                  <div className="flex gap-3 mt-1 text-xs text-gray-400">
                    <span>{store._count.orders} pedidos</span>
                    <span>{store._count.products} produtos</span>
                    <span>{store._count.customers} clientes</span>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${store.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {store.isActive ? "Ativa" : "Inativa"}
                </span>
                <a href={`/loja/${store.slug}`} target="_blank" className="text-sm text-blue-600">Ver loja</a>
                <button onClick={() => toggleStore(store.id, store.isActive)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                    store.isActive ? "bg-red-100 text-red-700 hover:bg-red-200" : "bg-green-100 text-green-700 hover:bg-green-200"
                  }`}>
                  {store.isActive ? "Bloquear" : "Ativar"}
                </button>
                <button onClick={() => deleteStore(store.id, store.name)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 hover:bg-red-100 hover:text-red-700">
                  Excluir
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
