import { getCurrentUser } from '@/lib/auth'
import { success, unauthorized } from '@/lib/api'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return unauthorized()

  const response = success({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    store: user.store,
  })
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
  return response
}
