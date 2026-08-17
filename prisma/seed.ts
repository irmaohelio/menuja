import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const existing = await prisma.user.findUnique({ where: { email: "admin@lojadigital.com" } })
  if (existing) {
    console.log("Master user already exists")
    return
  }

  const password = await bcrypt.hash("admin123", 10)
  await prisma.user.create({
    data: {
      name: "Administrador",
      email: "admin@lojadigital.com",
      password,
      role: "master",
    },
  })
  console.log("Master user created: admin@lojadigital.com / admin123")
}

main().catch(console.error).finally(() => prisma.$disconnect())
