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
  Loader2,
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
      const monthPrefix = todayStr.slice(0, 7); // e.g. "2026-10"
      setCurrentMonthStr(monthPrefix);

      // 1. Ambil janji status "selesai" untuk kunjungan hari ini & bulan ini (PRD 4.12)
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

      // 2. Ambil janji berstatus "menunggu" (PRD 4.12)
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
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">Pusat Kendali Pemilik Klinik</span>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight mt-1">
                Dasbor Super Admin (Bu Ratna) 👑
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Ringkasan operasional Klinik Gigi Senyum Rekah secara menyeluruh.
              </p>
            </div>
            <Link
              href="/admin/pengguna"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0E7490] text-white text-xs font-semibold hover:bg-[#155E75] shadow-sm shrink-0"
            >
              <Users className="w-4 h-4" />
              Kelola Pengguna & Peran
            </Link>
          </div>

          {/* Kartu Statistik Bab 4.12 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Kunjungan hari ini */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Kunjungan Hari Ini</span>
                <span className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </span>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-800 tabular-nums">
                  {loading ? "..." : todayVisits}
                </span>
                <span className="text-xs text-slate-400">pasien selesai</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">Dihitung dari janji berstatus selesai hari ini.</p>
            </div>

            {/* Kunjungan bulan ini (klik membuka laporan) */}
            <Link
              href={`/admin/laporan?bulan=${currentMonthStr}`}
              className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:border-[#0E7490] transition group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Kunjungan Bulan Ini</span>
                <span className="w-9 h-9 rounded-xl bg-cyan-50 text-[#0E7490] flex items-center justify-center">
                  <BarChart3 className="w-5 h-5" />
                </span>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-[#0E7490] tabular-nums">
                  {loading ? "..." : monthVisits}
                </span>
                <span className="text-xs text-slate-400">pasien selesai</span>
              </div>
              <p className="text-[11px] text-[#0E7490] mt-2 group-hover:underline flex items-center gap-1 font-semibold">
                Buka Laporan Bulan Berjalan ({currentMonthStr}) →
              </p>
            </Link>

            {/* Menunggu konfirmasi */}
            <Link
              href="/resepsionis/janji?status=menunggu"
              className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:border-amber-400 transition group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Menunggu Konfirmasi</span>
                <span className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </span>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-amber-600 tabular-nums">
                  {loading ? "..." : waitingConfirm}
                </span>
                <span className="text-xs text-slate-400">antrean permohonan</span>
              </div>
              <p className="text-[11px] text-[#0E7490] mt-2 group-hover:underline flex items-center gap-1 font-semibold">
                Periksa di Kelola Janji →
              </p>
            </Link>
          </div>

          {/* Navigasi Modul Admin */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/admin/pengguna"
              className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:border-[#0E7490] transition group"
            >
              <Users className="w-7 h-7 text-[#0E7490] mb-3" />
              <h3 className="font-bold text-slate-800 text-sm group-hover:text-[#0E7490]">Kelola Pengguna</h3>
              <p className="text-xs text-slate-500 mt-1">Ubah peran staf, dokter, atau nonaktifkan akun.</p>
            </Link>

            <Link
              href="/admin/layanan"
              className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:border-[#0E7490] transition group"
            >
              <ClipboardList className="w-7 h-7 text-[#0E7490] mb-3" />
              <h3 className="font-bold text-slate-800 text-sm group-hover:text-[#0E7490]">Katalog Layanan</h3>
              <p className="text-xs text-slate-500 mt-1">Atur nama layanan, durasi (kelipatan 30m), dan tarif.</p>
            </Link>

            <Link
              href="/admin/jadwal-dokter"
              className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:border-[#0E7490] transition group"
            >
              <CalendarDays className="w-7 h-7 text-[#0E7490] mb-3" />
              <h3 className="font-bold text-slate-800 text-sm group-hover:text-[#0E7490]">Jadwal Dokter</h3>
              <p className="text-xs text-slate-500 mt-1">Atur hari praktik (Senin-Sabtu) dan jam tugas dokter.</p>
            </Link>

            <Link
              href="/admin/laporan"
              className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:border-[#0E7490] transition group"
            >
              <BarChart3 className="w-7 h-7 text-[#0E7490] mb-3" />
              <h3 className="font-bold text-slate-800 text-sm group-hover:text-[#0E7490]">Laporan Kunjungan</h3>
              <p className="text-xs text-slate-500 mt-1">Rekap data kunjungan selesai per dokter & per layanan.</p>
            </Link>
          </div>
        </div>
      </AppLayout>
    </RouteGuard>
  );
}
