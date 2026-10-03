// Envia um aviso de novo pedido no WhatsApp do lojista via CallMeBot (gratuito).
// O lojista configura o número e a API key do CallMeBot em Configurações.
export async function sendOrderWhatsApp(
  settings: { notifyOnOrder?: boolean | null; notifyWhatsapp?: string | null; notifyApiKey?: string | null } | null | undefined,
  text: string,
): Promise<boolean> {
  if (!settings?.notifyOnOrder || !settings?.notifyWhatsapp || !settings?.notifyApiKey) return false

  let phone = String(settings.notifyWhatsapp).replace(/[^\d]/g, '')
  if (!phone) return false
  if (!phone.startsWith('55') && phone.length <= 11) phone = '55' + phone // adiciona DDI Brasil se faltar

  const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodeURIComponent(text)}&apikey=${encodeURIComponent(settings.notifyApiKey)}`

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 6000)
  try {
    const res = await fetch(url, { signal: controller.signal })
    return res.ok
  } catch {
    return false
  } finally {
    clearTimeout(timer)
  }
}

export function orderWhatsAppText(order: {
  orderNumber: number | string
  customerName: string
  total: number
  deliveryType?: string | null
  paymentMethod?: string | null
  customerNeighborhood?: string | null
}) {
  const tipo = order.deliveryType === 'delivery' ? '🛵 Entrega' : '🏪 Retirada'
  const local = order.deliveryType === 'delivery' && order.customerNeighborhood ? ` (${order.customerNeighborhood})` : ''
  return `🔔 Novo pedido #${order.orderNumber}\n${order.customerName}\n${tipo}${local}\nTotal: R$ ${order.total.toFixed(2)}`
}
