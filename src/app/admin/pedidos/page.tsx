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
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])

  const load = () => {
    const url = filter ? `/api/orders?status=${filter}` : "/api/orders"
    fetch(url).then(r => r.json()).then(data => {
      if (data.success) setOrders(data.orders)
    })
  }

  useEffect(() => { 
    load()
    // Polling a cada 5 segundos para atualizar em tempo real
    const interval = setInterval(load, 5000)
    return () => clearInterval(interval)
  }, [filter])

  const updateStatus = async (orderId: string, status: string) => {
    await fetch("/api/orders", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status }),
    })
    load()
    setSelected(null)
  }

  const deleteOrders = async () => {
    if (selectedOrders.length === 0) return
    if (!confirm(`Excluir ${selectedOrders.length} pedido(s)?`)) return
    
    await fetch("/api/orders", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderIds: selectedOrders }),
    })
    setSelectedOrders([])
    load()
  }

  const confirmPayment = async (orderId: string, action: 'confirm' | 'reject') => {
    await fetch("/api/orders/payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, action }),
    })
    load()
    setSelected(null)
  }

  const paymentLabels: Record<string, string> = {
    awaiting_proof: '⏳ Aguardando PIX',
    proof_submitted: '📸 Comprovante enviado',
    confirmed: '✅ Pagamento confirmado',
    rejected: '❌ Pagamento recusado',
  }
  const paymentColors: Record<string, string> = {
    awaiting_proof: 'bg-amber-100 text-amber-700',
    proof_submitted: 'bg-blue-100 text-blue-700',
    confirmed: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
  }

  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    )
  }

  const printOrder = (order: any) => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const itemsHtml = order.items?.map((item: any) => {
      const optionsHtml = item.options?.map((opt: any) => 
        `<div style="font-size: 12px; color: #666; margin-left: 10px;">${opt.quantity > 1 ? `${opt.quantity}x` : '1x'} ${opt.name} ${opt.price > 0 ? `(R$ ${(opt.price * (opt.quantity || 1)).toFixed(2)})` : ''}</div>`
      ).join('') || ''

      return `
        <div style="border-bottom: 1px solid #eee; padding: 8px 0;">
          <div style="display: flex; justify-content: space-between;">
            <span><strong>${item.quantity}x ${item.productName}</strong> ${item.sizeName ? `(${item.sizeName})` : ''}</span>
            <span><strong>R$ ${item.totalPrice.toFixed(2)}</strong></span>
          </div>
          ${optionsHtml}
          ${item.notes ? `<div style="font-size: 12px; color: #888; font-style: italic; margin-top: 4px;">Obs: ${item.notes}</div>` : ''}
        </div>
      `
    }).join('') || ''

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Pedido #${order.orderNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; max-width: 400px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px; }
            .info { margin-bottom: 15px; }
            .info p { margin: 5px 0; }
            .items { margin-bottom: 15px; }
            .total { border-top: 2px solid #000; padding-top: 10px; font-size: 18px; font-weight: bold; }
            @media print {
              body { padding: 0; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>Pedido #${order.orderNumber}</h2>
            <p>${new Date(order.createdAt).toLocaleString('pt-BR')}</p>
          </div>
          
          <div class="info">
            <p><strong>Cliente:</strong> ${order.customerName}</p>
            ${order.customerPhone ? `<p><strong>Telefone:</strong> ${order.customerPhone}</p>` : ''}
            <p><strong>Tipo:</strong> ${order.deliveryType === 'delivery' ? 'Entrega' : 'Retirada'}</p>
            ${order.customerAddress ? `<p><strong>Endereço:</strong> ${order.customerAddress}, ${order.customerNumber} ${order.customerComplement || ''} - ${order.customerNeighborhood}</p>` : ''}
            <p><strong>Pagamento:</strong> ${order.paymentMethod === 'cash' ? 'Dinheiro' : order.paymentMethod === 'pix' ? 'PIX' : 'Cartão'}</p>
            ${order.changeFor ? `<p><strong>Troco para:</strong> R$ ${order.changeFor.toFixed(2)}</p>` : ''}
            ${order.scheduledDate ? `<p><strong>📅 Encomenda para:</strong> ${new Date(order.scheduledDate).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}</p>` : ''}
          </div>
          
          <div class="items">
            <h3>Itens:</h3>
            ${itemsHtml}
          </div>
          
          <div class="total">
            <div style="display: flex; justify-content: space-between;">
              <span>Subtotal</span>
              <span>R$ ${order.subtotal.toFixed(2)}</span>
            </div>
            ${order.deliveryFee > 0 ? `<div style="display: flex; justify-content: space-between; font-size: 14px; font-weight: normal;">
              <span>Taxa de entrega</span>
              <span>R$ ${order.deliveryFee.toFixed(2)}</span>
            </div>` : ''}
            <div style="display: flex; justify-content: space-between; margin-top: 5px;">
              <span>Total</span>
              <span>R$ ${order.total.toFixed(2)}</span>
            </div>
          </div>
          
          ${order.notes ? `<p style="margin-top: 15px; color: #666;"><strong>Obs:</strong> ${order.notes}</p>` : ''}
          
          <div style="margin-top: 20px; text-align: center;">
            <button onclick="window.print()" style="padding: 10px 20px; background: #000; color: #fff; border: none; border-radius: 5px; cursor: pointer;">
              Imprimir
            </button>
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
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
                  {order.paymentStatus && paymentLabels[order.paymentStatus] && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${paymentColors[order.paymentStatus]}`}>
                      {paymentLabels[order.paymentStatus]}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{order.customerName}</p>
                <p className="text-sm font-medium">R$ {order.total.toFixed(2)}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(order.createdAt).toLocaleString("pt-BR")}</p>

                {/* Itens do pedido */}
                {order.items && order.items.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-100 space-y-1">
                    {order.items.map((item: any, j: number) => (
                      <div key={j} className="flex justify-between text-xs text-gray-600">
                        <span>{item.quantity}x {item.productName}</span>
                        <span>R$ {item.totalPrice.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Mini stepper */}
                <div className="flex items-center gap-1 mt-3 mb-2">
                  {["received", "confirmed", "preparing", "out_for_delivery", "completed"].map((s, i, arr) => {
                    const currentIdx = arr.indexOf(order.status)
                    const isDone = i <= currentIdx
                    const isCurrent = i === currentIdx
                    return (
                      <div key={s} className="flex items-center flex-1">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                          isCurrent ? 'bg-red-500 text-white ring-2 ring-red-200' :
                          isDone ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
                        }`}>
                          {isDone ? '✓' : i + 1}
                        </div>
                        {i < arr.length - 1 && (
                          <div className={`flex-1 h-0.5 ${isDone && i < currentIdx ? 'bg-green-400' : 'bg-gray-200'}`} />
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Botões de ação rápida */}
                {nextStatus[order.status] && (
                  <div className="flex gap-2 mt-2">
                    <button onClick={(e) => { e.stopPropagation(); updateStatus(order.id, nextStatus[order.status]) }}
                      className="flex-1 py-2 text-white rounded-lg text-xs font-bold bg-green-600 hover:bg-green-700 active:scale-95 transition">
                      {order.status === 'received' ? '✅ Confirmar' :
                       order.status === 'confirmed' ? '👨‍🍳 Preparar' :
                       order.status === 'preparing' ? '🛵 Saiu p/ entrega' :
                       '✅ Concluir'}
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); updateStatus(order.id, 'cancelled') }}
                      className="px-3 py-2 border border-red-300 text-red-600 rounded-lg text-xs font-medium hover:bg-red-50 active:scale-95 transition">
                      ✕
                    </button>
                  </div>
                )}
                <button onClick={(e) => { e.stopPropagation(); setSelected(order) }}
                  className="w-full mt-2 py-2 border border-gray-300 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 active:scale-95 transition">
                  🖨️ Ver detalhes / Imprimir
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pedidos anteriores */}
      {pastOrders.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Anteriores</h2>
            {selectedOrders.length > 0 && (
              <button onClick={deleteOrders} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">
                Excluir ({selectedOrders.length})
              </button>
            )}
          </div>
          <div className="space-y-2">
            {pastOrders.map(order => (
              <div key={order.id} className="bg-white p-3 rounded-xl shadow-sm opacity-70 flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedOrders.includes(order.id)}
                  onChange={() => toggleOrderSelection(order.id)}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <div className="flex-1 cursor-pointer" onClick={() => setSelected(order)}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">#{order.orderNumber} - {order.customerName}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${statusColors[order.status]}`}>
                      {statusLabels[order.status]}
                    </span>
                  </div>
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
              {selected.scheduledDate && (
                <p className="flex items-center gap-1"><strong>📅 Encomenda para:</strong> <span className="text-amber-600 font-medium">{new Date(selected.scheduledDate).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}</span></p>
              )}

              {/* Pagamento / Comprovante */}
              {selected.paymentStatus && (
                <div className="border-t pt-3 space-y-2">
                  <p className="font-semibold flex items-center gap-2">
                    Pagamento:
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${paymentColors[selected.paymentStatus] || ''}`}>
                      {paymentLabels[selected.paymentStatus] || selected.paymentStatus}
                    </span>
                  </p>
                  {selected.paymentProofUrl && (
                    <div className="flex items-start gap-3">
                      <a href={selected.paymentProofUrl} target="_blank" rel="noopener noreferrer">
                        <img src={selected.paymentProofUrl} alt="Comprovante" className="w-32 rounded-xl border hover:opacity-80 transition" />
                      </a>
                      <div className="flex flex-col gap-2">
                        <span className="text-xs text-gray-400">Clique para ampliar</span>
                        {selected.paymentStatus === 'proof_submitted' && (
                          <>
                            <button onClick={() => confirmPayment(selected.id, 'confirm')}
                              className="px-4 py-2 text-white rounded-xl text-sm font-bold bg-green-600 hover:bg-green-700">
                              ✅ Confirmar pagamento
                            </button>
                            <button onClick={() => confirmPayment(selected.id, 'reject')}
                              className="px-4 py-2 border border-red-300 text-red-600 rounded-xl text-sm font-medium hover:bg-red-50">
                              ❌ Recusar
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

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
                        {(() => {
                          const sabores = item.options.filter((o: any) => o.name.startsWith('Sabor:'))
                          const caldas = item.options.filter((o: any) => o.name.startsWith('Cobertura:'))
                          const extras = item.options.filter((o: any) => o.name.startsWith('Extra:'))
                          const outros = item.options.filter((o: any) => !o.name.startsWith('Sabor:') && !o.name.startsWith('Cobertura:') && !o.name.startsWith('Extra:'))
                          return (
                            <>
                              {sabores.map((opt: any, j: number) => (
                                <p key={`s${j}`} className="text-xs text-gray-500">
                                  {opt.quantity > 1 ? `${opt.quantity}x` : '1x'} {opt.name.replace('Sabor: ', '')} {opt.price > 0 ? `(R$ ${(opt.price * (opt.quantity || 1)).toFixed(2)})` : ''}
                                </p>
                              ))}
                              {caldas.length > 0 && <p className="text-xs font-bold text-gray-700 mt-2">Caldas</p>}
                              {caldas.map((opt: any, j: number) => (
                                <p key={`c${j}`} className="text-xs text-gray-500">
                                  {opt.quantity > 1 ? `${opt.quantity}x` : '1x'} {opt.name.replace('Cobertura: ', '')} {opt.price > 0 ? `(R$ ${(opt.price * (opt.quantity || 1)).toFixed(2)})` : ''}
                                </p>
                              ))}
                              {extras.length > 0 && <p className="text-xs font-bold text-gray-700 mt-2">Extras</p>}
                              {extras.map((opt: any, j: number) => (
                                <p key={`e${j}`} className="text-xs text-gray-500">
                                  {opt.quantity > 1 ? `${opt.quantity}x` : '1x'} {opt.name.replace('Extra: ', '')} {opt.price > 0 ? `(R$ ${(opt.price * (opt.quantity || 1)).toFixed(2)})` : ''}
                                </p>
                              ))}
                              {outros.map((opt: any, j: number) => (
                                <p key={`o${j}`} className="text-xs text-gray-500">
                                  {opt.quantity > 1 ? `${opt.quantity}x` : '+'} {opt.name} {opt.price > 0 ? `(R$ ${(opt.price * (opt.quantity || 1)).toFixed(2)})` : ''}
                                </p>
                              ))}
                            </>
                          )
                        })()}
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
              <div className="border-t pt-4 flex gap-2">
                {nextStatus[selected.status] && (
                  <>
                    <button onClick={() => updateStatus(selected.id, nextStatus[selected.status])}
                      className="flex-1 py-3 text-white rounded-xl font-bold bg-green-600 hover:bg-green-700">
                      Avançar status
                    </button>
                    <button onClick={() => updateStatus(selected.id, "cancelled")}
                      className="px-4 py-3 border border-red-300 text-red-600 rounded-xl font-medium hover:bg-red-50">
                      Cancelar
                    </button>
                  </>
                )}
                <button onClick={() => printOrder(selected)}
                  className="px-4 py-3 border border-gray-300 text-gray-600 rounded-xl font-medium hover:bg-gray-50">
                  🖨️ Imprimir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
