import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { success, error } from '@/lib/api'
import { findStoreCustomer, attachCustomerIdentifiers, normalizeEmail, normalizePhone } from '@/lib/customers'

export async function POST(req: NextRequest) {
  try {
    const { credential, storeId, phone } = await req.json()

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

    const cleanEmail = normalizeEmail(email)
    const cleanPhone = normalizePhone(phone)

    if (!cleanEmail && !cleanPhone) {
      return error('Email not found in token', 401)
    }

    // Find an existing customer by email OR phone (unified identity per store)
    let customer = await findStoreCustomer(storeId, { email: cleanEmail, phone: cleanPhone })

    if (customer) {
      // Attach the identifiers it was missing (e.g. phone from a previous manual order)
      customer = await attachCustomerIdentifiers(customer, { email: cleanEmail, phone: cleanPhone })
    } else {
      customer = await prisma.customer.create({
        data: {
          storeId,
          name: name || cleanEmail!.split('@')[0],
          email: cleanEmail,
          phone: cleanPhone,
        },
      })
    }

    const full = await prisma.customer.findUnique({
      where: { id: customer.id },
      include: { addresses: true },
    })

    return success({
      customer: {
        id: full!.id,
        name: full!.name,
        email: full!.email,
        phone: full!.phone,
        addresses: full!.addresses,
        picture,
      },
    })
  } catch (err) {
    console.error('Google auth error:', err)
    return error('Internal server error', 500)
  }
}
