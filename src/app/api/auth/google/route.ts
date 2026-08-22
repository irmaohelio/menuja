import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { success, error } from '@/lib/api'

export async function POST(req: NextRequest) {
  try {
    const { credential, storeId } = await req.json()

    if (!credential || !storeId) {
      return error('credential and storeId required', 400)
    }

    // Verify Google token
    const ticketRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`)
    if (!ticketRes.ok) {
      const errText = await ticketRes.text()
      console.error('Google token verification failed:', errText)
      return error('Invalid Google token', 401)
    }

    const ticket = await ticketRes.json()
    
    // Verify the token was issued for our client ID
    const clientId = process.env.GOOGLE_CLIENT_ID
    if (clientId && ticket.aud !== clientId) {
      console.error('Google token audience mismatch:', ticket.aud, '!=', clientId)
      return error('Invalid Google token audience', 401)
    }

    const { email, name, picture } = ticket

    if (!email) {
      return error('Email not found in token', 401)
    }

    // Find or create customer
    let customer = await prisma.customer.findFirst({
      where: { storeId, email },
      include: { addresses: true },
    })

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          storeId,
          name: name || email.split('@')[0],
          email,
          phone: null,
        },
        include: { addresses: true },
      })
    }

    return success({
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        addresses: customer.addresses,
        picture,
      },
    })
  } catch (err) {
    console.error('Google auth error:', err)
    return error('Internal server error', 500)
  }
}
