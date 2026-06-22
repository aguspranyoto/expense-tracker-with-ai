"use client";

import { saveTransaction } from "@/app/actions/transaction";

import { useState, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Upload,
  Camera,
  ImageIcon,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
} from "lucide-react";
import { compressImage, blobToBase64, formatFileSize } from "@/lib/image-utils";
import {
  CATEGORIES,
  PAYMENT_METHODS,
  formatRupiah,
  formatDeskripsi,
  type ReceiptExtraction,
} from "@/lib/constants";
import { toast } from "sonner";

type ProcessingState = "idle" | "compressing" | "analyzing" | "done" | "error";

export default function ScanPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processingState, setProcessingState] = useState<ProcessingState>("idle");
  const [compressionInfo, setCompressionInfo] = useState<{
    original: number;
    compressed: number;
  } | null>(null);
  const [extraction, setExtraction] = useState<ReceiptExtraction | null>(null);
  const [editedExtraction, setEditedExtraction] = useState<ReceiptExtraction | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar.");
      return;
    }

    setSelectedFile(file);
    setProcessingState("idle");
    setExtraction(null);
    setCompressionInfo(null);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect]
  );

  const handleProcess = useCallback(async () => {
    if (!selectedFile) return;

    try {
      // Step 1: Compress
      setProcessingState("compressing");
      const compressed = await compressImage(selectedFile);
      setCompressionInfo({
        original: selectedFile.size,
        compressed: compressed.size,
      });

      // Step 2: Convert to base64
      const base64 = await blobToBase64(compressed);

      // Step 3: Send to AI
      setProcessingState("analyzing");
      const formData = new FormData();
      formData.append("image", base64);

      const response = await fetch("/api/ai/extract", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to process receipt");
      }

      const result = await response.json();

      if (result.success && result.data) {
        const formattedData = {
          ...result.data,
          deskripsi: formatDeskripsi(result.data.deskripsi),
        };
        setExtraction(formattedData);
        setEditedExtraction({ ...formattedData });
        setProcessingState("done");
        setModalOpen(true);
      } else {
        throw new Error(result.error || "Unknown error");
      }
    } catch (error) {
      console.error("Processing error:", error);
      setProcessingState("error");
      toast.error("Gagal memproses struk. Silakan coba lagi.");
    }
  }, [selectedFile]);

  const handleSave = useCallback(async () => {
    if (!editedExtraction) return;

    try {
      setProcessingState("compressing"); // reusing existing loading state visually or just disable buttons
      await saveTransaction(editedExtraction);

      toast.success("Transaksi berhasil disimpan!", {
        description: `${formatDeskripsi(editedExtraction.deskripsi)} — ${formatRupiah(editedExtraction.jumlah)}`,
      });

      setModalOpen(false);
      setSelectedFile(null);
      setPreview(null);
      setProcessingState("idle");
      setExtraction(null);
      setEditedExtraction(null);
      setCompressionInfo(null);
    } catch (error) {
      console.error(error);
      toast.error("Gagal menyimpan transaksi ke database.");
      setProcessingState("done");
    }
  }, [editedExtraction]);

  const clearSelection = () => {
    setSelectedFile(null);
    setPreview(null);
    setProcessingState("idle");
    setExtraction(null);
    setCompressionInfo(null);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white font-[family-name:var(--font-fira-code)]">
          Scan Struk
        </h1>
        <p className="text-[#94A3B8] text-sm mt-1">
          Upload atau foto struk belanja untuk dianalisis AI
        </p>
      </div>

      {/* Upload Area */}
      <Card className="bg-[#1E293B]/60 border-white/[0.06]">
        <CardContent className="pt-6">
          {!selectedFile ? (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              className={`relative border-2 border-dashed rounded-xl p-10 text-center transition-all duration-300 ${
                isDragging
                  ? "border-[#3B82F6] bg-[#3B82F6]/5"
                  : "border-white/[0.08] hover:border-white/[0.15]"
              }`}
            >
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-[#1E40AF]/10 flex items-center justify-center">
                  <Upload className="w-7 h-7 text-[#3B82F6]" />
                </div>
                <div>
                  <p className="text-white font-medium mb-1">
                    Drop gambar struk di sini
                  </p>
                  <p className="text-[#64748B] text-sm">
                    atau pilih dari perangkat
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="bg-transparent border-white/[0.1] text-[#CBD5E1] hover:text-white hover:bg-white/[0.06]"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Pilih File
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-transparent border-white/[0.1] text-[#CBD5E1] hover:text-white hover:bg-white/[0.06]"
                    onClick={() => cameraInputRef.current?.click()}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Kamera
                  </Button>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
              />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Preview */}
              <div className="relative rounded-xl overflow-hidden border border-white/[0.06]">
                <img
                  src={preview || ""}
                  alt="Receipt preview"
                  className="w-full max-h-80 object-contain bg-black/20"
                />
                <button
                  onClick={clearSelection}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* File info */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#94A3B8] truncate max-w-[200px]">
                  {selectedFile.name}
                </span>
                <span className="text-[#64748B]">
                  {formatFileSize(selectedFile.size)}
                </span>
              </div>

              {/* Compression info */}
              {compressionInfo && (
                <div className="flex items-center gap-2 text-xs text-[#059669] bg-[#059669]/10 rounded-lg px-3 py-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>
                    Terkompresi: {formatFileSize(compressionInfo.original)} →{" "}
                    {formatFileSize(compressionInfo.compressed)} (
                    {Math.round(
                      (1 - compressionInfo.compressed / compressionInfo.original) * 100
                    )}
                    % lebih kecil)
                  </span>
                </div>
              )}

              {/* Error state */}
              {processingState === "error" && (
                <div className="flex items-center gap-2 text-xs text-[#DC2626] bg-[#DC2626]/10 rounded-lg px-3 py-2">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Gagal memproses. Silakan coba lagi.</span>
                </div>
              )}

              {/* Process button */}
              <Button
                onClick={handleProcess}
                disabled={processingState === "compressing" || processingState === "analyzing"}
                className="w-full bg-gradient-to-r from-[#1E40AF] to-[#059669] hover:opacity-90 text-white font-semibold py-5 transition-all duration-200"
              >
                {processingState === "compressing" ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Mengompresi gambar...
                  </>
                ) : processingState === "analyzing" ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    AI sedang menganalisis...
                  </>
                ) : processingState === "done" ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Selesai — Lihat Hasil
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Proses dengan AI
                  </>
                )}
              </Button>

              {processingState === "done" && (
                <Button
                  variant="outline"
                  onClick={() => setModalOpen(true)}
                  className="w-full bg-transparent border-white/[0.08] text-[#CBD5E1]"
                >
                  Buka Konfirmasi Data
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-[#1E293B] border-white/[0.08] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white font-[family-name:var(--font-fira-code)]">
              Konfirmasi Data Struk
            </DialogTitle>
            <DialogDescription className="text-[#94A3B8]">
              Periksa dan koreksi data yang diekstrak AI sebelum menyimpan.
            </DialogDescription>
          </DialogHeader>

          {editedExtraction && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label className="text-[#CBD5E1] text-sm">Kategori</Label>
                <Select
                  value={editedExtraction.kategori}
                  onValueChange={(value) =>
                    setEditedExtraction({
                      ...editedExtraction,
                      kategori: value as ReceiptExtraction["kategori"],
                    })
                  }
                >
                  <SelectTrigger className="bg-[#0F172A] border-white/[0.08]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[#CBD5E1] text-sm">Deskripsi</Label>
                <Input
                  value={editedExtraction.deskripsi}
                  onChange={(e) =>
                    setEditedExtraction({
                      ...editedExtraction,
                      deskripsi: e.target.value,
                    })
                  }
                  className="bg-[#0F172A] border-white/[0.08]"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[#CBD5E1] text-sm">
                  Metode Pembayaran
                </Label>
                <Select
                  value={editedExtraction.metode_pembayaran}
                  onValueChange={(value) =>
                    setEditedExtraction({
                      ...editedExtraction,
                      metode_pembayaran: value as ReceiptExtraction["metode_pembayaran"],
                    })
                  }
                >
                  <SelectTrigger className="bg-[#0F172A] border-white/[0.08]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((pm) => (
                      <SelectItem key={pm.value} value={pm.value}>
                        {pm.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[#CBD5E1] text-sm">Jumlah (Rp)</Label>
                <Input
                  type="number"
                  value={editedExtraction.jumlah}
                  onChange={(e) =>
                    setEditedExtraction({
                      ...editedExtraction,
                      jumlah: parseInt(e.target.value) || 0,
                    })
                  }
                  className="bg-[#0F172A] border-white/[0.08] font-[family-name:var(--font-fira-code)]"
                />
                <p className="text-xs text-[#64748B]">
                  {formatRupiah(editedExtraction.jumlah)}
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setModalOpen(false)}
              className="bg-transparent border-white/[0.08] text-[#94A3B8]"
            >
              Batal
            </Button>
            <Button
              onClick={handleSave}
              className="bg-[#059669] hover:bg-[#047857] text-white"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Simpan Transaksi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
