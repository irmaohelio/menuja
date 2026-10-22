import { NextRequest } from 'next/server'
import { getCurrentStore } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { success, error, unauthorized } from '@/lib/api'
import { sendWhatsAppCloud, sendTelegramMessage } from '@/lib/notify'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const store = await getCurrentStore()
  if (!store) return unauthorized()

  const body = await req.json().catch(() => ({}))
  const settings = await prisma.storeSettings.findUnique({ where: { storeId: store.id } })

  // Telegram
  const telegramToken = body.telegramToken || settings?.notifyTelegramToken
  const telegramChatId = body.telegramChatId || settings?.notifyTelegramChatId
  if (body.type === 'telegram' && telegramToken && telegramChatId) {
    const ok = await sendTelegramMessage(telegramToken, telegramChatId, '✅ Teste do MenuJá: seus avisos de pedido no Telegram estão funcionando!')
    return ok ? success({ sent: true }) : error('Não foi possível enviar via Telegram. Confira o token e o Chat ID.')
  }

  // WhatsApp Cloud API
  const to = body.notifyWhatsapp || settings?.notifyWhatsapp
  const phoneId = body.notifyWhatsappId || settings?.notifyWhatsappId
  const token = body.notifyWhatsappToken || settings?.notifyWhatsappToken

  if (!to || !phoneId || !token) {
    return error('Preencha número, Phone Number ID e Access Token primeiro.')
  }

  const ok = await sendWhatsAppCloud(to, phoneId, token, '✅ Teste do MenuJá: seus avisos de pedido no WhatsApp estão funcionando!')
  return ok ? success({ sent: true }) : error('Não foi possível enviar. Confira o número (com DDI), Phone Number ID e Access Token.')
}
