"use client";

import { useSession, signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ReceiptText,
  LayoutDashboard,
  Upload,
  FileSpreadsheet,
  LogOut,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Scan Struk",
    href: "/dashboard/scan",
    icon: Upload,
  },
  {
    label: "Export",
    href: "/dashboard/export",
    icon: FileSpreadsheet,
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-black border-t-transparent rounded-full animate-spin" />
          <p className="text-[#737373] text-sm">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const userInitials =
    session.user?.name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  return (
    <div className="min-h-screen flex bg-white">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-[#F5F5F5] border-r border-black/[0.08] flex flex-col transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 h-16 border-b border-black/[0.08]">
          <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center">
            <ReceiptText className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-black font-[family-name:var(--font-fira-code)] text-sm">
            ExpenseAI
          </span>
          <button
            className="ml-auto lg:hidden text-[#737373] hover:text-black transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#737373] hover:text-black hover:bg-black/[0.06] transition-all duration-200 group"
            >
              <item.icon className="w-4.5 h-4.5 group-hover:text-black transition-colors" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* User profile at bottom */}
        <div className="border-t border-black/[0.08] p-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-black/[0.06] transition-all duration-200">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={session.user?.image || undefined} />
                  <AvatarFallback className="bg-black text-white text-xs font-semibold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm text-black truncate">
                    {session.user?.name}
                  </p>
                  <p className="text-xs text-[#A3A3A3] truncate">
                    {session.user?.email}
                  </p>
                </div>
                <ChevronDown className="w-4 h-4 text-[#A3A3A3]" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem className="text-xs text-muted-foreground" disabled>
                {session.user?.email}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => signOut({ fetchOptions: { onSuccess: () => router.push("/login") } })}
                className="text-black focus:text-white"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Keluar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar (mobile) */}
        <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-xl border-b border-black/[0.08] flex items-center px-4 lg:px-6">
          <button
            className="lg:hidden mr-3 text-[#737373] hover:text-black transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
