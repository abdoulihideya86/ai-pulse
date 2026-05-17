import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Only create PrismaClient if DATABASE_URL is available
function createPrismaClient() {
  if (!process.env.DATABASE_URL) return null
  return new PrismaClient({ log: [] })
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production' && db) globalForPrisma.prisma = db

export function isDatabaseAvailable(): boolean {
  return db !== null
}
