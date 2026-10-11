"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Logo from "@/components/Logo";
import {
  Calendar,
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
  Shield,
  Activity,
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
    const styles = {
      super_admin: { bg: "bg-amber-50", text: "text-amber-800", dot: "bg-amber-500", border: "border-amber-200/80", label: "Super Admin" },
      dokter: { bg: "bg-cyan-50", text: "text-cyan-800", dot: "bg-cyan-500", border: "border-cyan-200/80", label: "Dokter Gigi" },
      resepsionis: { bg: "bg-sky-50", text: "text-sky-800", dot: "bg-sky-500", border: "border-sky-200/80", label: "Resepsionis" },
    };
    const s = styles[role] || { bg: "bg-emerald-50", text: "text-emerald-800", dot: "bg-emerald-500", border: "border-emerald-200/80", label: "Pasien" };
    return (
      <span className={`inline-flex items-center gap-1.5 ${s.bg} ${s.text} text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${s.border}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
        {s.label}
      </span>
    );
  };

  const role = userData?.role || "pasien";
  const isSuperAdmin = role === "super_admin";
  const navSections = [];

  if (role === "pasien" || isSuperAdmin) {
    navSections.push({
      title: isSuperAdmin ? "Area Pasien" : "Pelayanan Pasien",
      links: [
        { label: "Beranda Pasien", href: "/beranda", icon: LayoutDashboard },
        { label: "Daftar Janji Saya", href: "/janji", icon: Calendar },
        { label: "Buat Janji Baru", href: "/janji/baru", icon: PlusCircle },
        { label: "Riwayat Perawatan", href: "/riwayat", icon: FileText },
      ],
    });
  }

  if (role === "resepsionis" || isSuperAdmin) {
    navSections.push({
      title: isSuperAdmin ? "Meja Depan" : "Operasional Resepsionis",
      links: [
        { label: "Dasbor Resepsionis", href: "/resepsionis", icon: Activity },
        { label: "Kelola Janji Temu", href: "/resepsionis/janji", icon: ClipboardList },
        { label: "Buku Kontak Pasien", href: "/resepsionis/pasien", icon: Users },
      ],
    });
  }

  if (role === "dokter" || isSuperAdmin) {
    navSections.push({
      title: isSuperAdmin ? "Ruang Dokter" : "Praktik Medis",
      links: [
        { label: "Dasbor Dokter", href: "/dokter", icon: Stethoscope },
      ],
    });
  }

  if (isSuperAdmin) {
    navSections.push({
      title: "Administrasi & Pengawasan",
      links: [
        { label: "Dasbor Pemilik", href: "/admin", icon: Shield },
        { label: "Kelola Pengguna & Peran", href: "/admin/pengguna", icon: Users },
        { label: "Katalog Layanan", href: "/admin/layanan", icon: ClipboardList },
        { label: "Jadwal Praktik Dokter", href: "/admin/jadwal-dokter", icon: CalendarDays },
        { label: "Laporan Kunjungan", href: "/admin/laporan", icon: BarChart3 },
      ],
    });
  }

  navSections.push({
    title: "Pengaturan Akun",
    links: [{ label: "Profil Saya", href: "/profil", icon: User }],
  });

  const mobileBottomLinks = [
    ...(role === "pasien"
      ? [
          { label: "Beranda", href: "/beranda", icon: LayoutDashboard },
          { label: "Janji", href: "/janji", icon: Calendar },
          { label: "Booking", href: "/janji/baru", icon: PlusCircle, isPrimary: true },
          { label: "Riwayat", href: "/riwayat", icon: FileText },
          { label: "Profil", href: "/profil", icon: User },
        ]
      : role === "resepsionis"
      ? [
          { label: "Dasbor", href: "/resepsionis", icon: Activity },
          { label: "Antrean", href: "/resepsionis/janji", icon: ClipboardList },
          { label: "Pasien", href: "/resepsionis/pasien", icon: Users },
          { label: "Profil", href: "/profil", icon: User },
        ]
      : role === "dokter"
      ? [
          { label: "Ruang Dokter", href: "/dokter", icon: Stethoscope },
          { label: "Profil", href: "/profil", icon: User },
        ]
      : [
          { label: "Admin", href: "/admin", icon: Shield },
          { label: "Pengguna", href: "/admin/pengguna", icon: Users },
          { label: "Layanan", href: "/admin/layanan", icon: ClipboardList },
          { label: "Laporan", href: "/admin/laporan", icon: BarChart3 },
          { label: "Profil", href: "/profil", icon: User },
        ]),
  ];

  const userInitial = (userData?.nama || "P").charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#f8fcfe] flex flex-col text-slate-800 font-sans selection:bg-cyan-100 selection:text-cyan-900">
      {/* Top Header (Dantoa Dental Theme) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              id="btn-mobile-menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
              aria-label="Buka Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Link href="/" className="flex items-center gap-3 group">
              <Logo size="md" />
              <div className="flex flex-col">
                <span className="font-extrabold text-sm sm:text-base leading-tight tracking-tight text-slate-900">
                  Senyum Rekah
                </span>
                <span className="text-[10px] uppercase tracking-wider text-cyan-600 font-bold hidden sm:block">Dental Clinic Portal</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col items-end text-right">
              <span className="text-xs font-bold leading-tight text-slate-900">{userData?.nama || "Pengguna"}</span>
              <span className="text-[11px] text-slate-500 leading-tight">{userData?.email || ""}</span>
            </div>
            {userData && getRoleBadge(userData.role)}
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#06b6d4] to-[#00c5de] text-white font-black text-xs flex items-center justify-center shadow-md shadow-cyan-500/20">
              {userInitial}
            </div>
            <button
              id="btn-keluar"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition"
              title="Keluar dari sesi"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1 flex gap-6 pb-24 md:pb-8">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_2px_15px_rgba(0,180,216,0.05)] p-4 sticky top-24 space-y-6">
            {navSections.map((section, idx) => (
              <div key={idx} className="space-y-1">
                <h3 className="px-3 pt-1 pb-1 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                  {section.title}
                </h3>
                {section.links.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                        isActive
                          ? "text-[#0891b2] bg-cyan-50 shadow-xs border border-cyan-200/60"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <span
                        className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                          isActive
                            ? "bg-[#06b6d4] text-white shadow-xs"
                            : "text-slate-400 bg-slate-100"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </span>
                      <span className="truncate">{link.label}</span>
                      {isActive && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#06b6d4]" />
                      )}
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
            <div className="relative w-72 bg-white h-full p-6 overflow-y-auto space-y-5 shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <Logo size="sm" />
                  <div>
                    <span className="font-extrabold text-sm text-slate-900 block leading-tight">Senyum Rekah</span>
                    <span className="text-[10px] uppercase font-bold text-cyan-600">{userData?.nama || "Portal"}</span>
                  </div>
                </div>
                <button
                  id="btn-tutup-menu"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {navSections.map((section, idx) => (
                <div key={idx} className="space-y-1">
                  <h3 className="px-2 pt-1 pb-1 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                    {section.title}
                  </h3>
                  {section.links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold transition ${
                          isActive
                            ? "bg-cyan-50 text-[#0891b2] border border-cyan-200/60"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        <span
                          className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                            isActive ? "bg-[#06b6d4] text-white shadow-xs" : "text-slate-400 bg-slate-100"
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </span>
                        <span>{link.label}</span>
                      </Link>
                    );
                  })}
                </div>
              ))}

              <div className="pt-4 border-t border-slate-100">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-2xl text-xs font-bold text-rose-600 hover:bg-rose-50 w-full transition"
                >
                  <LogOut className="w-4 h-4" />
                  Keluar dari Sesi
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-100 shadow-[0_-2px_12px_rgba(0,0,0,0.06)] px-2 py-2 flex items-center justify-around">
        {mobileBottomLinks.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          if (item.isPrimary) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center -mt-5"
              >
                <div className="w-12 h-12 rounded-full text-white bg-gradient-to-tr from-[#06b6d4] to-[#00c5de] shadow-lg shadow-cyan-500/30 flex items-center justify-center hover:scale-105 transition active:scale-95">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-extrabold text-[#06b6d4] mt-1">{item.label}</span>
              </Link>
            );
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition ${
                isActive ? "text-[#06b6d4]" : "text-slate-400 hover:text-slate-700"
              }`}
            >
              <div className={`w-7 h-7 rounded-xl flex items-center justify-center transition ${
                isActive ? "bg-[#06b6d4] text-white shadow-xs" : "text-slate-400"
              }`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className={`text-[10px] mt-0.5 font-bold ${isActive ? "text-[#06b6d4]" : "text-slate-500"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Legal bar */}
      <footer className="mt-auto border-t border-slate-100 bg-white py-4 text-center text-xs text-slate-400 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Klinik Gigi Senyum Rekah · Makassar, Sulawesi Selatan</span>
          <span>Buka Senin–Sabtu: 09:00–15:00 WITA · janji.senyumrekah.id</span>
        </div>
      </footer>
    </div>
  );
}
