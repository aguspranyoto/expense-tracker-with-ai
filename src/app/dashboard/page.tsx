"use client";

import { useState, useMemo, useEffect } from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getFilteredRowModel,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type Transaction,
  CATEGORIES,
  PAYMENT_METHODS,
  formatRupiah,
  formatDeskripsi,
  formatDateShort,
} from "@/lib/constants";
import {
  TrendingUp,
  TrendingDown,
  Receipt,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Coffee,
  Fuel,
  UtensilsCrossed,
  Car,
  ShoppingBag,
  HelpCircle,
} from "lucide-react";

// Category icon mapping
const categoryIcons: Record<string, React.ElementType> = {
  kopi: Coffee,
  bensin: Fuel,
  makan: UtensilsCrossed,
  transportasi: Car,
  belanja: ShoppingBag,
  lainnya: HelpCircle,
};

// Category badge color mapping
const categoryColors: Record<string, string> = {
  kopi: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  bensin: "bg-red-500/15 text-red-400 border-red-500/20",
  makan: "bg-orange-500/15 text-orange-400 border-orange-500/20",
  transportasi: "bg-purple-500/15 text-purple-400 border-purple-500/20",
  belanja: "bg-pink-500/15 text-pink-400 border-pink-500/20",
  lainnya: "bg-slate-500/15 text-slate-400 border-slate-500/20",
};

// Mock data for development
const MOCK_TRANSACTIONS: Transaction[] = [];

import { getTransactions } from "@/app/actions/transaction";

export default function DashboardPage() {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch transactions
  useEffect(() => {
    async function loadTransactions() {
      try {
        const data = await getTransactions();
        setTransactions(data as any);
      } catch (err) {
        console.error("Gagal mengambil data", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadTransactions();
  }, []);

  // Stats
  const stats = useMemo(() => {
    const total = transactions.reduce((sum, t) => sum + t.jumlah, 0);
    const thisWeek = transactions
      .filter((t) => {
        const d = new Date(t.tanggal);
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return d >= weekAgo;
      })
      .reduce((sum, t) => sum + t.jumlah, 0);
    return {
      totalTransactions: transactions.length,
      totalAmount: total,
      thisWeekAmount: thisWeek,
      avgTransaction: transactions.length > 0 ? Math.round(total / transactions.length) : 0,
    };
  }, [transactions]);

  // Filtered data
  const filteredData = useMemo(() => {
    if (categoryFilter === "all") return transactions;
    return transactions.filter((t) => t.kategori === categoryFilter);
  }, [transactions, categoryFilter]);

  const columns: ColumnDef<Transaction>[] = [
    {
      accessorKey: "tanggal",
      header: "Tanggal",
      cell: ({ row }) => (
        <span className="text-[#94A3B8] text-sm tabular-nums">
          {formatDateShort(row.getValue("tanggal"))}
        </span>
      ),
    },
    {
      accessorKey: "kategori",
      header: "Kategori",
      cell: ({ row }) => {
        const kategori = row.getValue("kategori") as string;
        const Icon = categoryIcons[kategori] || HelpCircle;
        const label =
          CATEGORIES.find((c) => c.value === kategori)?.label || kategori;
        return (
          <Badge
            variant="outline"
            className={`${categoryColors[kategori] || ""} gap-1.5 font-medium`}
          >
            <Icon className="w-3 h-3" />
            {label}
          </Badge>
        );
      },
    },
    {
      accessorKey: "deskripsi",
      header: "Deskripsi",
      cell: ({ row }) => (
        <div className="max-w-[200px] sm:max-w-[300px]">
          <span className="text-white font-medium text-sm truncate block" title={formatDeskripsi(row.getValue("deskripsi"))}>
            {formatDeskripsi(row.getValue("deskripsi"))}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "metodePembayaran",
      header: "Metode",
      cell: ({ row }) => {
        const method = row.getValue("metodePembayaran") as string;
        const label =
          PAYMENT_METHODS.find((p) => p.value === method)?.label || method;
        return <span className="text-[#94A3B8] text-sm">{label}</span>;
      },
    },
    {
      accessorKey: "jumlah",
      header: () => <div className="text-right">Jumlah</div>,
      cell: ({ row }) => (
        <div className="text-right font-semibold text-white font-[family-name:var(--font-fira-code)] text-sm tabular-nums">
          {formatRupiah(row.getValue("jumlah"))}
        </div>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Aksi</div>,
      cell: ({ row }) => {
        const transaction = row.original;
        return (
          <div className="text-right">
            <button
              onClick={() => {
                setSelectedTx(transaction);
                setIsDialogOpen(true);
              }}
              className="text-sm text-[#3B82F6] hover:text-[#60A5FA] underline underline-offset-4 transition-colors font-medium"
            >
              View Detail
            </button>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
    state: {
      columnFilters,
    },
    initialState: {
      pagination: { pageSize: 10 },
    },
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white font-[family-name:var(--font-fira-code)]">
          Dashboard
        </h1>
        <p className="text-[#94A3B8] text-sm mt-1">
          Ringkasan pengeluaran dan riwayat transaksi
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-[#1E293B]/60 border-white/[0.06] hover:border-white/[0.12] transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider">
              Total Transaksi
            </CardTitle>
            <Receipt className="w-4 h-4 text-[#3B82F6]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white font-[family-name:var(--font-fira-code)]">
              {stats.totalTransactions}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1E293B]/60 border-white/[0.06] hover:border-white/[0.12] transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider">
              Total Pengeluaran
            </CardTitle>
            <TrendingDown className="w-4 h-4 text-[#DC2626]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white font-[family-name:var(--font-fira-code)]">
              {formatRupiah(stats.totalAmount)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1E293B]/60 border-white/[0.06] hover:border-white/[0.12] transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider">
              Minggu Ini
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-[#059669]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white font-[family-name:var(--font-fira-code)]">
              {formatRupiah(stats.thisWeekAmount)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1E293B]/60 border-white/[0.06] hover:border-white/[0.12] transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider">
              Rata-rata
            </CardTitle>
            <CreditCard className="w-4 h-4 text-[#8B5CF6]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white font-[family-name:var(--font-fira-code)]">
              {formatRupiah(stats.avgTransaction)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card className="bg-[#1E293B]/60 border-white/[0.06]">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="text-lg text-white font-[family-name:var(--font-fira-code)]">
            Riwayat Transaksi
          </CardTitle>
          <Select
            value={categoryFilter}
            onValueChange={setCategoryFilter}
          >
            <SelectTrigger className="w-full sm:w-44 bg-[#0F172A] border-white/[0.08]">
              <SelectValue placeholder="Filter kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kategori</SelectItem>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-white/[0.06] overflow-hidden">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow
                    key={headerGroup.id}
                    className="border-white/[0.06] hover:bg-transparent"
                  >
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className="text-[#64748B] text-xs uppercase tracking-wider font-semibold bg-[#0B1120]/50"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      className="border-white/[0.04] hover:bg-white/[0.03] transition-colors"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="py-3">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center text-[#64748B]"
                    >
                      Belum ada transaksi.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-xs text-[#64748B]">
              Menampilkan{" "}
              {table.getState().pagination.pageIndex *
                table.getState().pagination.pageSize +
                1}
              -
              {Math.min(
                (table.getState().pagination.pageIndex + 1) *
                  table.getState().pagination.pageSize,
                filteredData.length
              )}{" "}
              dari {filteredData.length} transaksi
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="bg-transparent border-white/[0.08] text-[#94A3B8] hover:text-white hover:bg-white/[0.06]"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-[#94A3B8] tabular-nums">
                {table.getState().pagination.pageIndex + 1} /{" "}
                {table.getPageCount()}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="bg-transparent border-white/[0.08] text-[#94A3B8] hover:text-white hover:bg-white/[0.06]"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#1E293B] border-white/[0.08] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white font-[family-name:var(--font-fira-code)]">
              Detail Transaksi
            </DialogTitle>
            <DialogDescription className="text-[#94A3B8]">
              Rincian lengkap dari transaksi Anda.
            </DialogDescription>
          </DialogHeader>

          {selectedTx && (
            <div className="space-y-4 py-2">
              <div className="flex justify-between items-center py-2 border-b border-white/[0.08]">
                <span className="text-[#94A3B8] text-sm">Tanggal</span>
                <span className="text-white font-medium text-sm tabular-nums">
                  {formatDateShort(selectedTx.tanggal)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/[0.08]">
                <span className="text-[#94A3B8] text-sm">Kategori</span>
                <Badge
                  variant="outline"
                  className={`${categoryColors[selectedTx.kategori] || ""} font-medium`}
                >
                  {CATEGORIES.find((c) => c.value === selectedTx.kategori)?.label || selectedTx.kategori}
                </Badge>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/[0.08]">
                <span className="text-[#94A3B8] text-sm">Metode</span>
                <span className="text-white font-medium text-sm">
                  {PAYMENT_METHODS.find((p) => p.value === selectedTx.metodePembayaran)?.label || selectedTx.metodePembayaran}
                </span>
              </div>
              <div className="py-2 border-b border-white/[0.08] space-y-2">
                <span className="text-[#94A3B8] text-sm block">Deskripsi Item</span>
                <div className="bg-[#0F172A] p-3 rounded-lg border border-white/[0.05] max-h-[200px] overflow-y-auto">
                  <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">
                    {formatDeskripsi(selectedTx.deskripsi).split(", ").join("\n")}
                  </p>
                </div>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-[#94A3B8] text-sm font-medium">Total Jumlah</span>
                <span className="text-xl font-bold text-white font-[family-name:var(--font-fira-code)] tabular-nums">
                  {formatRupiah(selectedTx.jumlah)}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
