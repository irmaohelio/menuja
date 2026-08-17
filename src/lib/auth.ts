import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { prisma } from './prisma'

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret')

export async function signToken(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secret)
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload
  } catch {
    return null
  }
}

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) return null

  const payload = await verifyToken(token)
  if (!payload || !payload.userId) return null

  const user = await prisma.user.findUnique({
    where: { id: payload.userId as string },
    include: { store: true },
  })

  return user
}

export async function getCurrentStore() {
  const user = await getCurrentUser()
  if (!user?.store) return null
  return user.store
}
