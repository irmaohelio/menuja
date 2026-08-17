"use client"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"

const statusLabels: Record<string, string> = {
  received: "📥 Recebido",
  confirmed: "✅ Confirmado",
  preparing: "👨‍🍳 Preparando",
  out_for_delivery: "🛵 Saiu para entrega",
  ready_for_pickup: "🏪 Pronto",
  completed: "✅ Concluído",
  cancelled: "❌ Cancelado",
}

export default function PedidosClientePage() {
  const params = useParams()
  const slug = params.slug as string
  const [orders, setOrders] = useState<any[]>([])
  const [phone, setPhone] = useState("")
  const [searched, setSearched] = useState(false)

  const search = () => {
    if (!phone) return
    fetch(`/api/orders/history?phone=${encodeURIComponent(phone)}&store=${slug}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) setOrders(data.orders)
        setSearched(true)
      })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Link href={`/loja/${slug}`} className="text-gray-500">←</Link>
          <h1 className="font-bold">Meus Pedidos</h1>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6">
        {!searched ? (
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <h2 className="font-bold mb-4">Consultar pedidos</h2>
            <p className="text-sm text-gray-500 mb-4">Digite seu telefone para ver seus pedidos</p>
            <input value={phone} onChange={e => setPhone(e.target.value)}
              className="w-full px-4 py-3 border rounded-xl mb-3" placeholder="Seu telefone"
              onKeyDown={e => e.key === "Enter" && search()} />
            <button onClick={search}
              className="w-full py-3 bg-rose-600 text-white rounded-xl font-bold">Buscar pedidos</button>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-5xl mb-3">📭</p>
            <p>Nenhum pedido encontrado</p>
            <button onClick={() => { setSearched(false); setPhone("") }} className="text-rose-600 text-sm mt-2">Tentar outro telefone</button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">{orders.length} pedido(s)</span>
              <button onClick={() => { setSearched(false); setPhone("") }} className="text-xs text-rose-600">Trocar telefone</button>
            </div>
            {orders.map(order => (
              <Link key={order.id} href={`/pedido/${order.id}`}
                className="block bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold">#{order.orderNumber}</span>
                  <span className="text-xs font-medium">{statusLabels[order.status]}</span>
                </div>
                <p className="text-sm text-gray-500">{order.items?.length} item(ns)</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleString("pt-BR")}</span>
                  <span className="font-bold text-sm">R$ {order.total.toFixed(2)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
