"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  FileSpreadsheet,
  CalendarIcon,
  Download,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import {
  type Transaction,
  CATEGORIES,
  PAYMENT_METHODS,
  formatRupiah,
  formatDate,
} from "@/lib/constants";
import { toast } from "sonner";

// Mock transactions for development
const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "1", userId: "user1", kategori: "kopi",
    deskripsi: "Kopi Latte + Croissant", metodePembayaran: "qris",
    jumlah: 45000, tanggal: "2026-06-22", createdAt: "2026-06-22T10:30:00Z",
  },
  {
    id: "2", userId: "user1", kategori: "bensin",
    deskripsi: "Pertamax 10 Liter", metodePembayaran: "debit",
    jumlah: 141000, tanggal: "2026-06-21", createdAt: "2026-06-21T08:15:00Z",
  },
  {
    id: "3", userId: "user1", kategori: "makan",
    deskripsi: "Nasi Padang + Es Teh", metodePembayaran: "tunai",
    jumlah: 35000, tanggal: "2026-06-21", createdAt: "2026-06-21T12:45:00Z",
  },
  {
    id: "4", userId: "user1", kategori: "transportasi",
    deskripsi: "Grab ke kantor", metodePembayaran: "qris",
    jumlah: 28000, tanggal: "2026-06-20", createdAt: "2026-06-20T07:30:00Z",
  },
  {
    id: "5", userId: "user1", kategori: "belanja",
    deskripsi: "Sabun, Shampoo, Tissue", metodePembayaran: "debit",
    jumlah: 87500, tanggal: "2026-06-19", createdAt: "2026-06-19T16:00:00Z",
  },
];

export default function ExportPage() {
  const [dateFrom, setDateFrom] = useState<Date | undefined>(
    new Date(new Date().setDate(new Date().getDate() - 30))
  );
  const [dateTo, setDateTo] = useState<Date | undefined>(new Date());
  const [isExporting, setIsExporting] = useState(false);

  const filteredTransactions = MOCK_TRANSACTIONS.filter((t) => {
    const d = new Date(t.tanggal);
    if (dateFrom && d < dateFrom) return false;
    if (dateTo && d > dateTo) return false;
    return true;
  });

  const totalAmount = filteredTransactions.reduce(
    (sum, t) => sum + t.jumlah,
    0
  );

  const handleExport = useCallback(async () => {
    if (filteredTransactions.length === 0) {
      toast.error("Tidak ada transaksi untuk di-export.");
      return;
    }

    setIsExporting(true);

    try {
      const ExcelJS = await import("exceljs");
      const workbook = new ExcelJS.Workbook();
      workbook.creator = "Smart Expense Tracker AI";
      workbook.created = new Date();

      const sheet = workbook.addWorksheet("Laporan Pengeluaran", {
        properties: { tabColor: { argb: "1E40AF" } },
      });

      // Column definitions
      sheet.columns = [
        { header: "No", key: "no", width: 6 },
        { header: "Tanggal", key: "tanggal", width: 15 },
        { header: "Kategori", key: "kategori", width: 18 },
        { header: "Deskripsi", key: "deskripsi", width: 35 },
        { header: "Metode Pembayaran", key: "metode", width: 20 },
        { header: "Jumlah (Rp)", key: "jumlah", width: 18 },
      ];

      // Header styling
      const headerRow = sheet.getRow(1);
      headerRow.font = { bold: true, color: { argb: "FFFFFF" }, size: 11 };
      headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "1E40AF" },
      };
      headerRow.alignment = { vertical: "middle", horizontal: "center" };
      headerRow.height = 28;

      // Add data rows with zebra striping
      filteredTransactions.forEach((t, idx) => {
        const catLabel =
          CATEGORIES.find((c) => c.value === t.kategori)?.label || t.kategori;
        const pmLabel =
          PAYMENT_METHODS.find((p) => p.value === t.metodePembayaran)?.label ||
          t.metodePembayaran;

        const row = sheet.addRow({
          no: idx + 1,
          tanggal: new Date(t.tanggal).toLocaleDateString("id-ID"),
          kategori: catLabel,
          deskripsi: t.deskripsi,
          metode: pmLabel,
          jumlah: t.jumlah,
        });

        // Zebra striping
        if (idx % 2 === 1) {
          row.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "F1F5F9" },
          };
        }

        // Rupiah formatting for jumlah column
        const jumlahCell = row.getCell("jumlah");
        jumlahCell.numFmt = '#,##0';
        jumlahCell.alignment = { horizontal: "right" };

        row.alignment = { vertical: "middle" };
        row.height = 22;
      });

      // Total row
      const totalRow = sheet.addRow({
        no: "",
        tanggal: "",
        kategori: "",
        deskripsi: "",
        metode: "TOTAL",
        jumlah: totalAmount,
      });
      totalRow.font = { bold: true, size: 11 };
      totalRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "059669" },
      };
      totalRow.getCell("metode").font = { bold: true, color: { argb: "FFFFFF" } };
      totalRow.getCell("jumlah").font = { bold: true, color: { argb: "FFFFFF" } };
      totalRow.getCell("jumlah").numFmt = '#,##0';
      totalRow.getCell("jumlah").alignment = { horizontal: "right" };
      totalRow.height = 28;

      // Add borders to all cells
      sheet.eachRow((row) => {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: "thin", color: { argb: "E2E8F0" } },
            left: { style: "thin", color: { argb: "E2E8F0" } },
            bottom: { style: "thin", color: { argb: "E2E8F0" } },
            right: { style: "thin", color: { argb: "E2E8F0" } },
          };
        });
      });

      // Generate file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const fromStr = dateFrom
        ? dateFrom.toLocaleDateString("id-ID").replace(/\//g, "-")
        : "awal";
      const toStr = dateTo
        ? dateTo.toLocaleDateString("id-ID").replace(/\//g, "-")
        : "sekarang";
      a.href = url;
      a.download = `Laporan-Pengeluaran_${fromStr}_sd_${toStr}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success("File Excel berhasil diunduh!", {
        description: `${filteredTransactions.length} transaksi — ${formatRupiah(totalAmount)}`,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Gagal membuat file Excel.");
    } finally {
      setIsExporting(false);
    }
  }, [filteredTransactions, totalAmount, dateFrom, dateTo]);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white font-[family-name:var(--font-fira-code)]">
          Export ke Excel
        </h1>
        <p className="text-[#94A3B8] text-sm mt-1">
          Unduh laporan pengeluaran berdasarkan rentang tanggal
        </p>
      </div>

      {/* Date Range Card */}
      <Card className="bg-[#1E293B]/60 border-white/[0.06]">
        <CardHeader>
          <CardTitle className="text-lg text-white font-[family-name:var(--font-fira-code)]">
            Pilih Rentang Tanggal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Date From */}
            <div className="space-y-2">
              <label className="text-sm text-[#CBD5E1]">Dari tanggal</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-[#0F172A] border-white/[0.08] text-left font-normal"
                  >
                    <CalendarIcon className="w-4 h-4 mr-2 text-[#64748B]" />
                    {dateFrom ? (
                      <span className="text-white">
                        {formatDate(dateFrom)}
                      </span>
                    ) : (
                      <span className="text-[#64748B]">Pilih tanggal</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateFrom}
                    onSelect={setDateFrom}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Date To */}
            <div className="space-y-2">
              <label className="text-sm text-[#CBD5E1]">Sampai tanggal</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-[#0F172A] border-white/[0.08] text-left font-normal"
                  >
                    <CalendarIcon className="w-4 h-4 mr-2 text-[#64748B]" />
                    {dateTo ? (
                      <span className="text-white">{formatDate(dateTo)}</span>
                    ) : (
                      <span className="text-[#64748B]">Pilih tanggal</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateTo}
                    onSelect={setDateTo}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-[#0F172A] rounded-lg p-4 border border-white/[0.06]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[#94A3B8]">
                Transaksi ditemukan
              </span>
              <span className="text-white font-semibold font-[family-name:var(--font-fira-code)]">
                {filteredTransactions.length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#94A3B8]">Total pengeluaran</span>
              <span className="text-[#059669] font-semibold font-[family-name:var(--font-fira-code)]">
                {formatRupiah(totalAmount)}
              </span>
            </div>
          </div>

          {/* Export Button */}
          <Button
            onClick={handleExport}
            disabled={isExporting || filteredTransactions.length === 0}
            className="w-full bg-[#059669] hover:bg-[#047857] text-white font-semibold py-5 transition-all duration-200"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Membuat file Excel...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Download Excel
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Preview Card */}
      <Card className="bg-[#1E293B]/60 border-white/[0.06]">
        <CardHeader className="flex flex-row items-center gap-3">
          <FileSpreadsheet className="w-5 h-5 text-[#059669]" />
          <CardTitle className="text-sm text-[#94A3B8] font-normal">
            File akan berisi header berwarna, zebra striping, format Rupiah, dan
            baris total otomatis.
          </CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}
