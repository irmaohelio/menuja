import { NextRequest } from 'next/server'
import { success, error } from '@/lib/api'
import { getTelegramChatId } from '@/lib/notify'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const { token } = await req.json().catch(() => ({}))
  if (!token) return error('Token obrigatório')

  const chatId = await getTelegramChatId(token)
  if (!chatId) {
    return error('Não foi possível obter o Chat ID. Envie uma mensagem ao bot no Telegram e tente novamente.')
  }
  return success({ chatId })
}
