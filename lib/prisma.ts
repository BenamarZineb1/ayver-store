import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

// On vérifie si on est en train de compiler sur Vercel
const isBuilding = process.env.NEXT_PHASE === "phase-production-build";

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error", "warn"],
    // Si on build, on empêche Prisma de bloquer le processus en cas de base vide
    datasourceUrl: isBuilding ? undefined : process.env.DATABASE_URL,
  });

if (process.env.NODE_ENV !== "production")
  globalForPrisma.prisma = prisma;