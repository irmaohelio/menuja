"use client"
import { useState, useEffect } from "react"

const statusLabels: Record<string, string> = {
  received: "📥 Recebido",
  confirmed: "✅ Confirmado",
  preparing: "👨‍🍳 Preparando",
  out_for_delivery: "🛵 Saiu para entrega",
  ready_for_pickup: "🏪 Pronto para retirada",
  completed: "✅ Concluído",
  cancelled: "❌ Cancelado",
}

const statusColors: Record<string, string> = {
  received: "bg-blue-100 text-blue-700",
  confirmed: "bg-yellow-100 text-yellow-700",
  preparing: "bg-orange-100 text-orange-700",
  out_for_delivery: "bg-purple-100 text-purple-700",
  ready_for_pickup: "bg-indigo-100 text-indigo-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
}

const nextStatus: Record<string, string> = {
  received: "confirmed",
  confirmed: "preparing",
  preparing: "out_for_delivery",
  out_for_delivery: "completed",
  ready_for_pickup: "completed",
}

export default function PedidosPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [filter, setFilter] = useState("")
  const [selected, setSelected] = useState<any>(null)

  const load = () => {
    const url = filter ? `/api/orders?status=${filter}` : "/api/orders"
    fetch(url).then(r => r.json()).then(data => {
      if (data.success) setOrders(data.orders)
    })
  }

  useEffect(() => { load() }, [filter])

  const updateStatus = async (orderId: string, status: string) => {
    await fetch("/api/orders", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status }),
    })
    load()
    setSelected(null)
  }

  const activeOrders = orders.filter(o => !["completed", "cancelled"].includes(o.status))
  const pastOrders = orders.filter(o => ["completed", "cancelled"].includes(o.status))

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Pedidos</h1>
        <select value={filter} onChange={e => setFilter(e.target.value)}
          className="px-3 py-2 border rounded-xl text-sm">
          <option value="">Todos</option>
          {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {/* Pedidos ativos */}
      {activeOrders.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Ativos ({activeOrders.length})</h2>
          <div className="space-y-3">
            {activeOrders.map(order => (
              <div key={order.id} className="bg-white p-4 rounded-xl shadow-sm cursor-pointer hover:shadow-md transition"
                onClick={() => setSelected(order)}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold">#{order.orderNumber}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                    {statusLabels[order.status]}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{order.customerName}</p>
                <p className="text-sm font-medium">R$ {order.total.toFixed(2)}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(order.createdAt).toLocaleString("pt-BR")}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pedidos anteriores */}
      {pastOrders.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Anteriores</h2>
          <div className="space-y-2">
            {pastOrders.map(order => (
              <div key={order.id} className="bg-white p-3 rounded-xl shadow-sm opacity-70"
                onClick={() => setSelected(order)}>
                <div className="flex items-center justify-between">
                  <span className="font-medium">#{order.orderNumber} - {order.customerName}</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${statusColors[order.status]}`}>
                    {statusLabels[order.status]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {orders.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">📭</p>
          <p>Nenhum pedido ainda</p>
        </div>
      )}

      {/* Modal do pedido */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4"
          onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto p-6"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Pedido #{selected.orderNumber}</h3>
              <button onClick={() => setSelected(null)} className="text-gray-400 text-2xl">×</button>
            </div>

            <div className="space-y-3 text-sm">
              <p><strong>Cliente:</strong> {selected.customerName}</p>
              {selected.customerPhone && <p><strong>Telefone:</strong> {selected.customerPhone}</p>}
              <p><strong>Tipo:</strong> {selected.deliveryType === "delivery" ? "Entrega" : "Retirada"}</p>
              {selected.customerAddress && (
                <p><strong>Endereço:</strong> {selected.customerAddress}, {selected.customerNumber} {selected.customerComplement} - {selected.customerNeighborhood}</p>
              )}
              <p><strong>Pagamento:</strong> {selected.paymentMethod === "cash" ? "Dinheiro" : selected.paymentMethod === "pix" ? "PIX" : "Cartão"}</p>
              {selected.changeFor && <p><strong>Troco para:</strong> R$ {selected.changeFor.toFixed(2)}</p>}

              <div className="border-t pt-3">
                <p className="font-semibold mb-2">Itens:</p>
                {selected.items?.map((item: any, i: number) => (
                  <div key={i} className="py-2 border-b last:border-0">
                    <div className="flex justify-between">
                      <span className="font-medium">{item.quantity}x {item.productName} {item.sizeName ? `(${item.sizeName})` : ""}</span>
                      <span className="font-bold">R$ {item.totalPrice.toFixed(2)}</span>
                    </div>
                    {item.options?.length > 0 && (
                      <div className="mt-1 ml-2 space-y-0.5">
                        {item.options.map((opt: any, j: number) => (
                          <p key={j} className="text-xs text-gray-500">
                            {opt.quantity > 1 ? `${opt.quantity}x` : '+'} {opt.name} {opt.price > 0 ? `(R$ ${opt.price.toFixed(2)})` : ''}
                          </p>
                        ))}
                      </div>
                    )}
                    {item.notes && <p className="text-xs text-gray-400 italic mt-1">Obs: {item.notes}</p>}
                  </div>
                ))}
              </div>

              <div className="border-t pt-3 space-y-1">
                <div className="flex justify-between"><span>Subtotal</span><span>R$ {selected.subtotal.toFixed(2)}</span></div>
                {selected.deliveryFee > 0 && <div className="flex justify-between"><span>Taxa de entrega</span><span>R$ {selected.deliveryFee.toFixed(2)}</span></div>}
                <div className="flex justify-between font-bold text-lg"><span>Total</span><span>R$ {selected.total.toFixed(2)}</span></div>
              </div>

              {selected.notes && <p className="text-gray-500 italic">Obs: {selected.notes}</p>}

              {/* Ações */}
              {nextStatus[selected.status] && (
                <div className="border-t pt-4 flex gap-2">
                  <button onClick={() => updateStatus(selected.id, nextStatus[selected.status])}
                    className="flex-1 py-3 text-white rounded-xl font-bold">
                    Avançar status
                  </button>
                  <button onClick={() => updateStatus(selected.id, "cancelled")}
                    className="px-4 py-3 border border-red-300 text-red-600 rounded-xl font-medium hover:bg-red-50">
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
