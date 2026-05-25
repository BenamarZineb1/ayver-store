import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Singleton de PrismaClient :
 * Garantit qu'une seule instance de connexion est créée en mode Développement,
 * évitant l'accumulation de connexions ouvertes lors du rechargement à chaud (Hot Reload).
 */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}