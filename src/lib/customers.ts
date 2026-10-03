import type { Customer } from '@prisma/client'
import { prisma } from './prisma'

export function normalizeEmail(email?: string | null) {
  const v = email?.trim().toLowerCase()
  return v ? v : null
}

export function normalizePhone(phone?: string | null) {
  const v = phone?.replace(/\D/g, '')
  return v ? v : null
}

// Find a customer inside a store using email OR phone (at least one identifier).
// Email takes precedence; if not found, falls back to phone.
export async function findStoreCustomer(
  storeId: string,
  { email, phone }: { email?: string | null; phone?: string | null },
) {
  const e = normalizeEmail(email)
  const p = normalizePhone(phone)

  if (e) {
    const byEmail = await prisma.customer.findFirst({ where: { storeId, email: e } })
    if (byEmail) return byEmail
  }
  if (p) {
    const byPhone = await prisma.customer.findFirst({ where: { storeId, phone: p } })
    if (byPhone) return byPhone
  }
  return null
}

// Attach missing identifiers to an existing customer so the same person
// is never duplicated (a Google-only record gets the phone, and vice-versa).
export async function attachCustomerIdentifiers(
  customer: Customer,
  { email, phone }: { email?: string | null; phone?: string | null },
): Promise<Customer> {
  const e = normalizeEmail(email)
  const p = normalizePhone(phone)

  const data: { email?: string; phone?: string } = {}
  if (e && customer.email !== e) data.email = e
  if (p && customer.phone !== p) data.phone = p

  if (Object.keys(data).length === 0) return customer
  return prisma.customer.update({ where: { id: customer.id }, data })
}
