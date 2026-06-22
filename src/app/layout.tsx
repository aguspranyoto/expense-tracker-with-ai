import type { Metadata } from "next";
import { Fira_Code, Fira_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const firaSans = Fira_Sans({
  variable: "--font-fira-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const firaCode = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Smart Expense Tracker AI",
  description:
    "Pelacak pengeluaran pintar berbasis AI — otomatis baca struk belanja menggunakan teknologi Omni-Modal AI.",
  keywords: ["expense tracker", "AI", "receipt scanner", "pengeluaran", "struk"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${firaSans.variable} ${firaCode.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster
          theme="dark"
          position="top-right"
          toastOptions={{
            style: {
              background: "#1E293B",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#F1F5F9",
            },
          }}
        />
      </body>
    </html>
  );
}
