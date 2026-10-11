"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import RouteGuard from "@/components/RouteGuard";
import AppLayout from "@/components/AppLayout";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import {
  ShieldCheck,
  Users,
  ClipboardList,
  CalendarDays,
  BarChart3,
  Calendar,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";

export default function DasborAdminPage() {
  const { userData } = useAuth();

  const [loading, setLoading] = useState(true);
  const [todayVisits, setTodayVisits] = useState(0);
  const [monthVisits, setMonthVisits] = useState(0);
  const [waitingConfirm, setWaitingConfirm] = useState(0);
  const [currentMonthStr, setCurrentMonthStr] = useState("");

  const loadAdminStats = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const todayStr = now.toISOString().split("T")[0];
      const monthPrefix = todayStr.slice(0, 7);
      setCurrentMonthStr(monthPrefix);

      const qDone = query(
        collection(db, "janji_temu"),
        where("status", "==", "selesai")
      );
      const snapDone = await getDocs(qDone);

      let todayCount = 0;
      let monthCount = 0;
      snapDone.forEach((d) => {
        const data = d.data();
        if (data.tanggal === todayStr) todayCount++;
        if (data.tanggal && data.tanggal.startsWith(monthPrefix)) monthCount++;
      });

      setTodayVisits(todayCount);
      setMonthVisits(monthCount);

      const qWait = query(
        collection(db, "janji_temu"),
        where("status", "==", "menunggu")
      );
      const snapWait = await getDocs(qWait);
      setWaitingConfirm(snapWait.size);
    } catch (err) {
      console.error("Gagal memuat statistik admin:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminStats();
  }, []);

  return (
    <RouteGuard allowedRoles={["super_admin"]}>
      <AppLayout>
        <div className="space-y-6 max-w-5xl mx-auto">
          {/* Hero Banner (Dantoa Dental Clinic Theme) */}
          <div className="bg-gradient-to-r from-[#e9f7fb] via-[#f0f9ff] to-white rounded-3xl p-6 sm:p-8 border border-cyan-100 shadow-[0_2px_15px_rgba(0,180,216,0.06)] relative overflow-hidden">
            <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-white text-[#0891b2] text-[11px] font-extrabold uppercase tracking-wider shadow-xs border border-cyan-200">
                  Panel Pemilik & Tata Kelola
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Dasbor Super Administrator
                </h1>
                <p className="text-slate-600 text-xs sm:text-sm font-medium max-w-md">
                  Pengawasan operasional klinik, otorisasi staf & dokter, katalog tarif layanan, dan rekapitulasi data.
                </p>
              </div>

              <Link
                href="/admin/pengguna"
                id="btn-kelola-pengguna"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#00c5de] to-[#06b6d4] hover:from-[#06b6d4] hover:to-[#0891b2] text-white text-xs font-extrabold uppercase tracking-wider shadow-md shadow-cyan-500/25 transition shrink-0 active:scale-95"
              >
                <Users className="w-4 h-4" />
                <span>Kelola Pengguna</span>
              </Link>
            </div>
          </div>

          {/* Metric Cards (Dantoa Dental Big Stats) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,180,216,0.04)] p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                  Kunjungan Hari Ini
                </span>
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
              <span className="text-3xl sm:text-4xl font-black text-slate-900 tabular-nums block">
                {loading ? "..." : todayVisits}
              </span>
              <span className="text-xs text-slate-400 font-medium block mt-0.5">Pasien selesai ditangani</span>
            </div>

            <Link
              href={`/admin/laporan?bulan=${currentMonthStr}`}
              id="card-kunjungan-bulan"
              className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,180,216,0.04)] p-6 hover:border-cyan-300 hover:shadow-md transition group block"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                  Kunjungan Bulan Ini ({currentMonthStr})
                </span>
                <div className="w-10 h-10 rounded-2xl bg-cyan-50 text-[#06b6d4] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <BarChart3 className="w-5 h-5" />
                </div>
              </div>
              <span className="text-3xl sm:text-4xl font-black text-[#06b6d4] tabular-nums block">
                {loading ? "..." : monthVisits}
              </span>
              <p className="text-xs text-[#06b6d4] mt-2 flex items-center gap-1 font-bold group-hover:underline">
                Buka Rekapitulasi <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </p>
            </Link>

            <Link
              href="/resepsionis/janji?status=menunggu"
              id="card-menunggu-admin"
              className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,180,216,0.04)] p-6 hover:border-amber-300 hover:shadow-md transition group block"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                  Menunggu Konfirmasi
                </span>
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <span className="text-3xl sm:text-4xl font-black text-amber-600 tabular-nums block">
                {loading ? "..." : waitingConfirm}
              </span>
              <p className="text-xs text-[#06b6d4] mt-2 flex items-center gap-1 font-bold group-hover:underline">
                Tinjau Antrean <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </p>
            </Link>
          </div>

          {/* Navigasi Modul Admin */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/admin/pengguna"
              className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,180,216,0.04)] hover:border-cyan-300 hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-[#06b6d4] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-sm group-hover:text-[#06b6d4] transition-colors">
                Kelola Pengguna & Peran
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Ubah peran akun, tetapkan staf/dokter, dan atur status akses aktif.
              </p>
            </Link>

            <Link
              href="/admin/layanan"
              className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,180,216,0.04)] hover:border-cyan-300 hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-[#06b6d4] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <ClipboardList className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-sm group-hover:text-[#06b6d4] transition-colors">
                Katalog Layanan Medis
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Konfigurasi nama layanan, durasi (kelipatan 30m), dan tarif resmi.
              </p>
            </Link>

            <Link
              href="/admin/jadwal-dokter"
              className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,180,216,0.04)] hover:border-cyan-300 hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-[#06b6d4] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <CalendarDays className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-sm group-hover:text-[#06b6d4] transition-colors">
                Jadwal Praktik Dokter
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Atur hari praktik operasional (Senin-Sabtu) dan jam tugas masing-masing dokter.
              </p>
            </Link>

            <Link
              href="/admin/laporan"
              className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,180,216,0.04)] hover:border-cyan-300 hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-[#06b6d4] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-sm group-hover:text-[#06b6d4] transition-colors">
                Laporan Kunjungan
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Rekapitulasi kunjungan selesai bulanan per dokter dan per layanan.
              </p>
            </Link>
          </div>
        </div>
      </AppLayout>
    </RouteGuard>
  );
}
