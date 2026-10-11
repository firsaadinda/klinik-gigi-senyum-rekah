"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Calendar,
  Clock,
  FileText,
  User,
  Users,
  LayoutDashboard,
  Stethoscope,
  ClipboardList,
  CalendarDays,
  BarChart3,
  LogOut,
  Menu,
  X,
  PlusCircle,
  ShieldCheck,
  ChevronRight,
  Smile,
} from "lucide-react";

export default function AppLayout({ children }) {
  const { userData, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/masuk");
    } catch (err) {
      console.error("Gagal keluar:", err);
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case "super_admin":
        return <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-amber-300">Super Admin</span>;
      case "dokter":
        return <span className="bg-purple-100 text-purple-800 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-purple-300">Dokter</span>;
      case "resepsionis":
        return <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-blue-300">Resepsionis</span>;
      default:
        return <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-emerald-300">Pasien</span>;
    }
  };

  const role = userData?.role || "pasien";
  const isSuperAdmin = role === "super_admin";

  const navItems = [];

  // Menu Pasien
  if (role === "pasien" || isSuperAdmin) {
    navItems.push({
      category: isSuperAdmin ? "Area Pasien" : "Menu Utama",
      items: [
        { label: "Beranda", href: "/beranda", icon: LayoutDashboard },
        { label: "Daftar Janji", href: "/janji", icon: Calendar },
        { label: "Buat Janji Baru", href: "/janji/baru", icon: PlusCircle },
        { label: "Riwayat Perawatan", href: "/riwayat", icon: FileText },
      ],
    });
  }

  // Menu Resepsionis
  if (role === "resepsionis" || isSuperAdmin) {
    navItems.push({
      category: isSuperAdmin ? "Area Resepsionis" : "Menu Utama",
      items: [
        { label: "Dasbor Resepsionis", href: "/resepsionis", icon: LayoutDashboard },
        { label: "Kelola Janji", href: "/resepsionis/janji", icon: ClipboardList },
        { label: "Data Pasien", href: "/resepsionis/pasien", icon: Users },
      ],
    });
  }

  // Menu Dokter
  if (role === "dokter" || isSuperAdmin) {
    navItems.push({
      category: isSuperAdmin ? "Area Dokter" : "Menu Utama",
      items: [
        { label: "Dasbor Dokter", href: "/dokter", icon: Stethoscope },
      ],
    });
  }

  // Menu Super Admin
  if (isSuperAdmin) {
    navItems.push({
      category: "Administrasi Sistem",
      items: [
        { label: "Dasbor Admin", href: "/admin", icon: ShieldCheck },
        { label: "Kelola Pengguna", href: "/admin/pengguna", icon: Users },
        { label: "Kelola Layanan", href: "/admin/layanan", icon: ClipboardList },
        { label: "Jadwal Dokter", href: "/admin/jadwal-dokter", icon: CalendarDays },
        { label: "Laporan Kunjungan", href: "/admin/laporan", icon: BarChart3 },
      ],
    });
  }

  // Profil untuk semua
  navItems.push({
    category: "Akun",
    items: [
      { label: "Profil Saya", href: "/profil", icon: User },
    ],
  });

  return (
    <div className="min-h-screen bg-[#F4F7F9] flex flex-col">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-[#0E7490] text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
              <div className="w-9 h-9 bg-white text-[#0E7490] rounded-xl flex items-center justify-center shadow-sm">
                <Smile className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div className="flex flex-col">
                <span className="leading-tight">Senyum Rekah</span>
                <span className="text-[10px] text-cyan-100 font-normal tracking-wider uppercase">Portal Janji Temu</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-semibold leading-tight">{userData?.nama || "Memuat..."}</span>
              <span className="text-xs text-cyan-100">{userData?.email || ""}</span>
            </div>
            {userData && getRoleBadge(userData.role)}
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium transition"
              title="Keluar dari akun"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container with Sidebar */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1 flex gap-6">
        {/* Sidebar Desktop */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 sticky top-24 space-y-6">
            {navItems.map((group, idx) => (
              <div key={idx} className="space-y-1">
                <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {group.category}
                </p>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition ${
                        isActive
                          ? "bg-[#0E7490] text-white shadow-sm"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        </aside>

        {/* Mobile Sidebar Modal */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative w-72 bg-white h-full p-4 overflow-y-auto space-y-6 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Smile className="w-5 h-5 text-[#0E7490]" />
                  <span className="font-bold text-slate-800">Senyum Rekah</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {navItems.map((group, idx) => (
                <div key={idx} className="space-y-1">
                  <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    {group.category}
                  </p>
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                          isActive
                            ? "bg-[#0E7490] text-white shadow-sm"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
