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

// WhatsApp Cloud API (Meta oficial) - gratuito ate 1000 conversas/mes
export async function sendWhatsAppCloud(
  to: string,       // numero do lojista (com DDI, ex: 5533999421853)
  phoneId: string,  // WhatsApp Business phone number ID
  token: string,    // Meta access token
  text: string,
): Promise<boolean> {
  try {
    const res = await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: to.replace(/\D/g, ''),
        type: 'text',
        text: { body: text },
      }),
    })
    return res.ok
  } catch {
    return false
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

// Telegram: enviar mensagem para o chat do lojista
export async function sendTelegramMessage(token: string, chatId: string, text: string): Promise<boolean> {
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
    })
    return res.ok
  } catch {
    return false
  }
}

// Telegram: descobrir o chat ID do bot (depois de enviar uma mensagem)
export async function getTelegramChatId(token: string): Promise<string | null> {
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/getUpdates`)
    if (!res.ok) return null
    const data = await res.json()
    const last = data.result?.[data.result.length - 1]
    return last?.message?.chat?.id?.toString() || last?.message?.from?.id?.toString() || null
  } catch {
    return null
  }
}
