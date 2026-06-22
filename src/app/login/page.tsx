"use client";

import { signIn } from "@/lib/auth-client";
import { useState } from "react";
import { ReceiptText, Sparkles, ArrowRight, Shield, Zap, BarChart3 } from "lucide-react";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
      });
    } catch {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[#0F172A]" />
        <div className="absolute top-0 -left-40 w-[600px] h-[600px] bg-[#1E40AF]/20 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute bottom-0 -right-40 w-[500px] h-[500px] bg-[#059669]/15 rounded-full blur-[128px] animate-pulse [animation-delay:2s]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#3B82F6]/10 rounded-full blur-[128px] animate-pulse [animation-delay:4s]" />
      </div>

      <div className="w-full max-w-md mx-auto px-6">
        {/* Logo & Branding */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1E40AF] to-[#059669] mb-6 shadow-lg shadow-[#1E40AF]/25">
            <ReceiptText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white font-[family-name:var(--font-fira-code)] tracking-tight">
            Smart Expense
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3B82F6] to-[#059669]">
              {" "}Tracker
            </span>
          </h1>
          <p className="text-[#94A3B8] mt-3 text-sm leading-relaxed max-w-xs mx-auto">
            Otomatis baca struk belanja dengan AI. Lacak pengeluaranmu lebih cerdas.
          </p>
        </div>

        {/* Login Card */}
        <div className="relative group">
          {/* Card glow effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#1E40AF] to-[#059669] rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-500" />

          <div className="relative bg-[#1E293B]/80 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-8 shadow-2xl">
            {/* Features */}
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3 text-sm text-[#CBD5E1]">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#1E40AF]/15">
                  <Zap className="w-4 h-4 text-[#3B82F6]" />
                </div>
                <span>Scan struk otomatis dengan AI</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-[#CBD5E1]">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#059669]/15">
                  <BarChart3 className="w-4 h-4 text-[#059669]" />
                </div>
                <span>Laporan & export ke Excel</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-[#CBD5E1]">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#8B5CF6]/15">
                  <Shield className="w-4 h-4 text-[#8B5CF6]" />
                </div>
                <span>Data aman & terenkripsi</span>
              </div>
            </div>

            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8" />

            {/* Google Login Button */}
            <button
              id="google-login-btn"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white hover:bg-gray-50 text-gray-800 font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-white/10 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group/btn"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              )}
              <span>{isLoading ? "Menghubungkan..." : "Masuk dengan Google"}</span>
              {!isLoading && (
                <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all duration-200" />
              )}
            </button>

            <p className="text-center text-xs text-[#64748B] mt-4">
              Dengan masuk, kamu menyetujui{" "}
              <span className="text-[#3B82F6] hover:underline cursor-pointer">
                Ketentuan Layanan
              </span>
            </p>
          </div>
        </div>

        {/* Bottom sparkle */}
        <div className="flex items-center justify-center gap-2 mt-8 text-xs text-[#475569]">
          <Sparkles className="w-3 h-3" />
          <span>Powered by AI — Hemat waktu, cerdas kelola uang</span>
        </div>
      </div>
    </div>
  );
}
