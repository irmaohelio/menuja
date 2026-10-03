import { NextRequest } from 'next/server'
import { getCurrentStore } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { success, error, unauthorized } from '@/lib/api'
import { sendOrderWhatsApp } from '@/lib/notify'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const store = await getCurrentStore()
  if (!store) return unauthorized()

  const body = await req.json().catch(() => ({}))
  const settings = await prisma.storeSettings.findUnique({ where: { storeId: store.id } })

  const notifyWhatsapp = body.notifyWhatsapp || settings?.notifyWhatsapp
  const notifyApiKey = body.notifyApiKey || settings?.notifyApiKey

  if (!notifyWhatsapp || !notifyApiKey) {
    return error('Informe o seu WhatsApp e a API key do CallMeBot.')
  }

  const ok = await sendOrderWhatsApp(
    { notifyOnOrder: true, notifyWhatsapp, notifyApiKey },
    '✅ Teste do MenuJá: seus avisos de pedido no WhatsApp estão funcionando!',
  )

  if (!ok) {
    return error('Não foi possível enviar. Confira o número (com DDD) e a API key do CallMeBot.')
  }
  return success({ sent: true })
}
