"use client"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"

const statusLabels: Record<string, { label: string; icon: string }> = {
  received: { label: "Pedido recebido", icon: "📥" },
  confirmed: { label: "Pedido confirmado", icon: "✅" },
  preparing: { label: "Em preparação", icon: "👨‍🍳" },
  out_for_delivery: { label: "Saiu para entrega", icon: "🛵" },
  ready_for_pickup: { label: "Pronto para retirada", icon: "🏪" },
  completed: { label: "Pedido concluído", icon: "🎉" },
  cancelled: { label: "Pedido cancelado", icon: "❌" },
}

const allStatuses = ["received", "confirmed", "preparing", "out_for_delivery", "completed"]

export default function PedidoPage() {
  const params = useParams()
  const orderId = params.id as string
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = () => {
      fetch(`/api/orders/track?id=${orderId}`).then(r => r.json()).then(data => {
        if (data.success) setOrder(data.order)
        setLoading(false)
      })
    }
    load()
    const interval = setInterval(load, 15000) // Polling a cada 15s
    return () => clearInterval(interval)
  }, [orderId])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-rose-600 border-t-transparent rounded-full" />
    </div>
  )

  if (!order) return (
    <div className="min-h-screen flex items-center justify-center text-gray-400">
      <div className="text-center">
        <p className="text-5xl mb-4">😕</p>
        <p>Pedido não encontrado</p>
        <Link href="/" className="text-rose-600 text-sm mt-2 inline-block">Voltar ao início</Link>
      </div>
    </div>
  )

  const currentIdx = allStatuses.indexOf(order.status)
  const isCancelled = order.status === "cancelled"

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Link href={`/loja/${order.store?.slug || ""}`} className="text-gray-500">←</Link>
          <h1 className="font-bold">Pedido #{order.orderNumber}</h1>
          <span className={`ml-auto px-3 py-1 rounded-full text-xs font-medium ${
            isCancelled ? "bg-red-100 text-red-700" : order.status === "completed" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
          }`}>
            {statusLabels[order.status]?.label || order.status}
          </span>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Progresso visual */}
        {!isCancelled && (
          <div className="bg-white p-5 rounded-2xl shadow-sm">
            <div className="flex justify-between mb-2">
              {allStatuses.map((s, i) => {
                const isDone = i <= currentIdx
                const isCurrent = i === currentIdx
                return (
                  <div key={s} className="flex flex-col items-center" style={{ width: `${100 / allStatuses.length}%` }}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                      isCurrent ? "bg-rose-600 text-white ring-4 ring-rose-100" :
                      isDone ? "bg-green-500 text-white" : "bg-gray-200 text-gray-400"
                    }`}>
                      {isDone ? "✓" : i + 1}
                    </div>
                    <span className="text-[10px] text-center mt-1 leading-tight">{statusLabels[s]?.label.split(" ").pop()}</span>
                  </div>
                )
              })}
            </div>
            <div className="h-1 bg-gray-200 rounded-full mt-3">
              <div className="h-1 bg-rose-600 rounded-full transition-all duration-500"
                style={{ width: `${(currentIdx / (allStatuses.length - 1)) * 100}%` }} />
            </div>
          </div>
        )}

        {/* Status log */}
        <div className="bg-white p-5 rounded-2xl shadow-sm">
          <h2 className="font-bold mb-3">Acompanhamento</h2>
          <div className="space-y-3">
            {order.statusLog?.map((log: any, i: number) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`w-3 h-3 rounded-full mt-1.5 ${i === 0 ? "bg-rose-600" : "bg-gray-300"}`} />
                <div>
                  <p className="text-sm font-medium">{statusLabels[log.status]?.label || log.status}</p>
                  <p className="text-xs text-gray-400">{new Date(log.createdAt).toLocaleString("pt-BR")}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detalhes do pedido */}
        <div className="bg-white p-5 rounded-2xl shadow-sm">
          <h2 className="font-bold mb-3">Itens do pedido</h2>
          <div className="space-y-2">
            {order.items?.map((item: any, i: number) => (
              <div key={i} className="flex justify-between text-sm">
                <span>{item.quantity}x {item.productName}</span>
                <span className="font-medium">R$ {item.totalPrice.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t mt-3 pt-3 space-y-1 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>R$ {order.subtotal.toFixed(2)}</span></div>
            {order.deliveryFee > 0 && <div className="flex justify-between"><span>Taxa de entrega</span><span>R$ {order.deliveryFee.toFixed(2)}</span></div>}
            <div className="flex justify-between font-bold text-lg"><span>Total</span><span>R$ {order.total.toFixed(2)}</span></div>
          </div>
        </div>

        {/* Info do pedido */}
        <div className="bg-white p-5 rounded-2xl shadow-sm text-sm space-y-2">
          <p><strong>Pagamento:</strong> {order.paymentMethod === "cash" ? "Dinheiro" : order.paymentMethod === "pix" ? "PIX" : "Cartão"}</p>
          <p><strong>Entrega:</strong> {order.deliveryType === "delivery" ? "Entrega" : "Retirada"}</p>
          {order.customerAddress && (
            <p><strong>Endereço:</strong> {order.customerAddress}, {order.customerNumber} - {order.customerNeighborhood}</p>
          )}
          <p className="text-gray-400 text-xs">Pedido em {new Date(order.createdAt).toLocaleString("pt-BR")}</p>
        </div>

        {/* WhatsApp da loja */}
        {order.store?.whatsapp && (
          <a href={`https://wa.me/55${order.store.whatsapp.replace(/\D/g, "")}`} target="_blank"
            className="block w-full py-3 bg-green-500 text-white text-center rounded-xl font-bold">
            💬 Falar com a loja no WhatsApp
          </a>
        )}
      </div>
    </div>
  )
}
