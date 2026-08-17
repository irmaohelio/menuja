import { success } from '@/lib/api'

export async function POST() {
  const response = success({ message: 'Deslogado' })
  response.cookies.set('token', '', { maxAge: 0, path: '/' })
  return response
}
