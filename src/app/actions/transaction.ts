"use server";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL! });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function saveTransaction(data: any) {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({
    headers: reqHeaders,
  });
  
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  await prisma.transaction.create({
    data: {
      userId: session.user.id,
      kategori: data.kategori,
      deskripsi: data.deskripsi,
      metodePembayaran: data.metode_pembayaran,
      jumlah: data.jumlah,
      tanggal: new Date(),
    }
  });

  revalidatePath("/dashboard");
  return { success: true };
}

export async function getTransactions() {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({
    headers: reqHeaders,
  });
  
  if (!session?.user) {
    return [];
  }

  const transactions = await prisma.transaction.findMany({
    where: { userId: session.user.id },
    orderBy: { tanggal: 'desc' }
  });

  return transactions.map(t => ({
    id: t.id,
    userId: t.userId,
    kategori: t.kategori,
    deskripsi: t.deskripsi,
    metodePembayaran: t.metodePembayaran,
    jumlah: t.jumlah,
    tanggal: t.tanggal.toISOString(),
    createdAt: t.createdAt.toISOString()
  }));
}
