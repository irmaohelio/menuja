import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function createPrismaClient() {
  const url = process.env.TURSO_DATABASE_URL || 'file:./prisma/dev.db'
  const authToken = process.env.TURSO_AUTH_TOKEN

  // Local dev: plain file URL without adapter
  if (!process.env.TURSO_DATABASE_URL) {
    return new PrismaClient()
  }

  // Production: Turso via libSQL adapter
  const adapter = new PrismaLibSql({
    url,
    authToken: authToken || undefined,
  })
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma || createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
