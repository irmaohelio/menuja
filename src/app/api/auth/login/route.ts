import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/auth'
import { success, error } from '@/lib/api'
import { rateLimit, clientIp } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) return error('Preencha todos os campos')

    // Anti força-bruta: por IP e por e-mail
    const ip = clientIp(req)
    const byIp = rateLimit(`login:ip:${ip}`, 12, 5 * 60 * 1000)
    const byEmail = rateLimit(`login:email:${String(email).toLowerCase()}`, 8, 5 * 60 * 1000)
    const blocked = !byIp.ok ? byIp : !byEmail.ok ? byEmail : null
    if (blocked) {
      return error(`Muitas tentativas. Tente novamente em ${blocked.retryAfter}s.`, 429)
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { store: true },
    })

    if (!user) return error('E-mail ou senha incorretos')
    if (!user.isActive) return error('Conta desativada')

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return error('E-mail ou senha incorretos')

    const token = await signToken({ userId: user.id, role: user.role })

    const response = success({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      store: user.store ? { slug: user.store.slug } : null,
    })
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return response
  } catch (e: any) {
    return error(e.message || 'Erro ao fazer login', 500)
  }
}
