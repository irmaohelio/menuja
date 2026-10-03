import { success } from '@/lib/api'

export const dynamic = 'force-dynamic'

export async function GET() {
  return success({ key: process.env.VAPID_PUBLIC_KEY || null })
}
