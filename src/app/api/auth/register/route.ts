import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/auth'
import { success, error } from '@/lib/api'
import { slugify } from '@/lib/utils'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, phone, password, storeName, segment } = body

    if (!name || !email || !password || !storeName) {
      return error('Preencha todos os campos obrigatórios')
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return error('E-mail já cadastrado')

    const hashedPassword = await bcrypt.hash(password, 10)
    let slug = slugify(storeName)

    const existingSlug = await prisma.store.findUnique({ where: { slug } })
    if (existingSlug) slug = slug + '-' + Date.now().toString(36)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        store: {
          create: {
            slug,
            name: storeName,
            segment: segment || 'outros',
            trialStartsAt: new Date(),
            trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            settings: { create: {} },
            businessHours: {
              create: [
                { dayOfWeek: 0, isOpen: false },
                { dayOfWeek: 1, isOpen: true, openTime: '11:00', closeTime: '23:00' },
                { dayOfWeek: 2, isOpen: true, openTime: '11:00', closeTime: '23:00' },
                { dayOfWeek: 3, isOpen: true, openTime: '11:00', closeTime: '23:00' },
                { dayOfWeek: 4, isOpen: true, openTime: '11:00', closeTime: '23:00' },
                { dayOfWeek: 5, isOpen: true, openTime: '11:00', closeTime: '23:00' },
                { dayOfWeek: 6, isOpen: true, openTime: '11:00', closeTime: '23:00' },
              ],
            },
          },
        },
      },
    })

    const token = await signToken({ userId: user.id, role: user.role })

    const response = success({ user: { id: user.id, name: user.name, email: user.email }, slug })
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return response
  } catch (e: any) {
    return error(e.message || 'Erro ao criar conta', 500)
  }
}
