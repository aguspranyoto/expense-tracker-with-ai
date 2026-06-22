/**
 * Format a number as Indonesian Rupiah currency.
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Parse and format AI JSON description array into readable string.
 */
export function formatDeskripsi(deskripsi: string): string {
  try {
    const parsed = JSON.parse(deskripsi);
    if (Array.isArray(parsed)) {
      return parsed.map((item: Record<string, number>) => {
        const key = Object.keys(item)[0];
        const value = item[key];
        return `${key} (${formatRupiah(value)})`;
      }).join(", ");
    }
    return deskripsi;
  } catch (e) {
    return deskripsi;
  }
}

/**
 * Format a date string for display.
 */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

/**
 * Format a date string as a short date.
 */
export function formatDateShort(date: string | Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

/**
 * Category type and labels
 */
export const CATEGORIES = [
  { value: "kopi", label: "Kopi / Jajan" },
  { value: "bensin", label: "Bensin" },
  { value: "makan", label: "Makan" },
  { value: "transportasi", label: "Transportasi" },
  { value: "belanja", label: "Belanja" },
  { value: "lainnya", label: "Lainnya" },
] as const;

export type CategoryValue = (typeof CATEGORIES)[number]["value"];

/**
 * Payment method type and labels
 */
export const PAYMENT_METHODS = [
  { value: "qris", label: "QRIS" },
  { value: "tunai", label: "Tunai" },
  { value: "debit", label: "Kartu Debit" },
  { value: "kredit", label: "Kartu Kredit" },
  { value: "transfer", label: "Transfer Bank" },
] as const;

export type PaymentMethodValue = (typeof PAYMENT_METHODS)[number]["value"];

/**
 * Transaction type
 */
export interface Transaction {
  id: string;
  userId: string;
  kategori: CategoryValue;
  deskripsi: string;
  metodePembayaran: PaymentMethodValue;
  jumlah: number;
  tanggal: string;
  createdAt: string;
}

/**
 * AI extraction result from receipt
 */
export interface ReceiptExtraction {
  kategori: CategoryValue;
  deskripsi: string;
  metode_pembayaran: PaymentMethodValue;
  jumlah: number;
}
