"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Smile, Calendar, ShieldCheck, Clock, ArrowRight, Loader2, Sparkles } from "lucide-react";

export default function Home() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user && userData) {
      if (userData.role === "resepsionis") {
        router.replace("/resepsionis");
      } else if (userData.role === "dokter") {
        router.replace("/dokter");
      } else if (userData.role === "super_admin") {
        router.replace("/admin");
      } else {
        router.replace("/beranda");
      }
    }
  }, [user, userData, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F7F9]">
        <Loader2 className="w-8 h-8 text-[#0E7490] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7F9] flex flex-col justify-between">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-[#0E7490] text-white rounded-xl flex items-center justify-center shadow-sm">
              <Smile className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-slate-800 text-lg leading-tight block">Senyum Rekah</span>
              <span className="text-xs text-slate-500">Klinik Gigi Makassar</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/masuk"
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition"
            >
              Masuk
            </Link>
            <Link
              href="/daftar"
              className="px-4 py-2 text-sm font-medium bg-[#0E7490] text-white rounded-xl hover:bg-[#155E75] shadow-sm transition"
            >
              Daftar Pasien
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto px-4 py-16 text-center my-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-50 border border-cyan-200 text-[#0E7490] text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          Sistem Janji Temu Resmi Klinik Gigi Senyum Rekah
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
          Senyum Sehat & Cerah Dimulai dari Janji Temu yang Mudah
        </h1>

        <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          Pilih dokter gigi favoritmu, cek slot waktu yang tersedia tanpa bentrok, dan pantau riwayat perawatan gigimu dalam satu portal terpadu.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/daftar"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#0E7490] text-white font-semibold shadow-md hover:bg-[#155E75] transition"
          >
            <Calendar className="w-5 h-5" />
            Buat Janji Sekarang
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/masuk"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition"
          >
            Masuk ke Akun
          </Link>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 text-left">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="w-10 h-10 bg-cyan-50 text-[#0E7490] rounded-xl flex items-center justify-center mb-4">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 mb-1">Slot Waktu Real-Time</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Jadwal tidak akan bentrok karena hanya slot waktu kosong yang dapat dipilih oleh pasien.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 mb-1">Catatan Medis Terlindungi</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Riwayat tindakan dan catatan perawatan tersimpan aman serta hanya bisa diakses oleh dokter pemeriksa dan pasien.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
              <Smile className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 mb-1">Empat Peran Terintegrasi</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Alur kerja otomatis dari pasien, meja resepsionis, ruang pemeriksaan dokter, hingga pengawasan Super Admin.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <p>&copy; 2026 Klinik Gigi Senyum Rekah · janji.senyumrekah.id · Makassar</p>
      </footer>
    </div>
  );
}
