"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import RouteGuard from "@/components/RouteGuard";
import AppLayout from "@/components/AppLayout";
import StatusBadge from "@/components/StatusBadge";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import {
  Stethoscope,
  Calendar,
  Clock,
  ArrowRight,
  AlertCircle,
  Loader2,
  CheckCircle2,
  RefreshCw,
  Sparkles
} from "lucide-react";

export default function DasborDokterPage() {
  const { user, userData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [todayStr, setTodayStr] = useState("");
  const [error, setError] = useState("");

  const loadDoctorSchedule = async () => {
    if (!user) return;
    setLoading(true);
    setError("");

    try {
      const today = new Date().toISOString().split("T")[0];
      setTodayStr(today);

      let q;
      if (userData?.role === "super_admin") {
        q = query(
          collection(db, "janji_temu"),
          where("tanggal", "==", today)
        );
      } else {
        q = query(
          collection(db, "janji_temu"),
          where("dokterId", "==", user.uid),
          where("tanggal", "==", today)
        );
      }

      const snap = await getDocs(q);
      const items = [];

      for (const d of snap.docs) {
        const item = d.data();
        let patientName = "Pasien";
        let serviceName = "Layanan";

        if (item.pasienId) {
          try {
            const pSnap = await getDoc(doc(db, "users", item.pasienId));
            if (pSnap.exists()) patientName = pSnap.data().nama;
          } catch {}
        }

        if (item.layananId) {
          try {
            const lSnap = await getDoc(doc(db, "layanan", item.layananId));
            if (lSnap.exists()) serviceName = lSnap.data().nama;
          } catch {}
        }

        items.push({
          id: d.id,
          ...item,
          patientName,
          serviceName,
        });
      }

      items.sort((a, b) => (a.jam || "").localeCompare(b.jam || ""));
      setAppointments(items);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat jadwal dokter hari ini.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctorSchedule();
  }, [user, userData]);

  const readyCount = appointments.filter((a) => a.status === "hadir").length;
  const completedCount = appointments.filter((a) => a.status === "selesai").length;

  return (
    <RouteGuard allowedRoles={["dokter"]}>
      <AppLayout>
        <div className="space-y-6 max-w-5xl mx-auto">
          {/* Hero Banner (Dantoa Dental Clinic Theme) */}
          <div className="bg-gradient-to-r from-[#e9f7fb] via-[#f0f9ff] to-white rounded-3xl p-6 sm:p-8 border border-cyan-100 shadow-[0_2px_15px_rgba(0,180,216,0.06)] relative overflow-hidden">
            <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-white text-[#0891b2] text-[11px] font-extrabold uppercase tracking-wider shadow-xs border border-cyan-200">
                  Stasiun Praktik Medis · {todayStr}
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Selamat Bertugas, {userData?.nama?.split(" ").slice(0, 2).join(" ") || "drg. Dokter"}!
                </h1>
                <p className="text-slate-600 text-xs sm:text-sm font-medium max-w-md">
                  Panel penanganan rawat jalan, rekam medis tindakan gigi, dan riwayat diagnosis pasien klinik.
                </p>
              </div>

              <div className="inline-flex items-center gap-2.5 bg-white border border-cyan-200 px-5 py-3 rounded-full shadow-sm shrink-0">
                <div className="w-8 h-8 rounded-full bg-cyan-100 text-[#06b6d4] flex items-center justify-center">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-black text-slate-900 block">{readyCount} Pasien Hadir</span>
                  <span className="text-[10px] text-cyan-700 font-bold uppercase">Siap Diperiksa</span>
                </div>
              </div>
            </div>
          </div>

          {/* Metric Cards (Dantoa Dental Big Stats) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,180,216,0.04)] p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                  Total Jadwal Hari Ini
                </span>
                <div className="w-10 h-10 rounded-2xl bg-cyan-50 text-[#06b6d4] flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
              </div>
              <span className="text-3xl sm:text-4xl font-black text-slate-900 tabular-nums block">
                {appointments.length}
              </span>
              <span className="text-xs text-slate-400 font-medium">Pasien terjadwal</span>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,180,216,0.04)] p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                  Siap Diperiksa (Hadir)
                </span>
                <div className="w-10 h-10 rounded-2xl bg-cyan-50 text-[#06b6d4] flex items-center justify-center">
                  <Stethoscope className="w-5 h-5" />
                </div>
              </div>
              <span className="text-3xl sm:text-4xl font-black text-[#06b6d4] tabular-nums block">
                {readyCount}
              </span>
              <span className="text-xs text-slate-400 font-medium">Menunggu di ruang tunggu</span>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,180,216,0.04)] p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                  Tindakan Selesai
                </span>
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
              <span className="text-3xl sm:text-4xl font-black text-emerald-500 tabular-nums block">
                {completedCount}
              </span>
              <span className="text-xs text-slate-400 font-medium">Rekam medis terbit</span>
            </div>
          </div>

          {/* Daftar Janji Hari Ini Milik Dokter */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,180,216,0.04)] overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-50 text-[#06b6d4] flex items-center justify-center">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-extrabold text-slate-900">Antrean Pasien Praktik Hari Ini</h2>
                  <p className="text-xs text-slate-400">Verifikasi kedatangan & input rekam medis tindakan</p>
                </div>
              </div>
              <button
                id="btn-segarkan-dokter"
                onClick={loadDoctorSchedule}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#06b6d4] hover:text-[#0891b2] px-4 py-2 rounded-full hover:bg-cyan-50 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Segarkan
              </button>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
                  <Loader2 className="w-7 h-7 text-[#06b6d4] animate-spin" />
                  <p className="text-xs font-medium">Memuat antrean praktik dokter...</p>
                </div>
              ) : error ? (
                <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-center text-xs border border-red-200">
                  <p>{error}</p>
                </div>
              ) : appointments.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30 text-slate-400" />
                  <p className="font-extrabold text-slate-800 text-sm">Tidak ada jadwal pasien hari ini</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Anda tidak memiliki jadwal janji temu untuk tanggal {todayStr}.
                  </p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {appointments.map((apt) => {
                    const isReady = apt.status === "hadir";
                    return (
                      <div
                        key={apt.id}
                        className={`p-5 rounded-3xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 border ${
                          isReady
                            ? "bg-[#f0f9ff] border-cyan-300 shadow-sm"
                            : "bg-white border-slate-200/80 hover:border-cyan-200"
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-xs text-slate-900 tabular-nums flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-[#06b6d4]" />
                              {apt.jam} WITA
                            </span>
                            <StatusBadge status={apt.status} />
                            {isReady && (
                              <span className="px-3 py-0.5 rounded-full text-[10px] font-extrabold bg-[#06b6d4] text-white shadow-xs">
                                Pasien di Ruang Tunggu
                              </span>
                            )}
                          </div>

                          <h3 className="font-black text-slate-900 text-base">
                            {apt.patientName}
                          </h3>

                          <div className="text-xs text-slate-600">
                            Tindakan Dimohon: <span className="font-bold text-slate-800">{apt.serviceName}</span>
                          </div>

                          {apt.keluhan && (
                            <p className="text-xs text-slate-600 italic bg-white/90 px-3 py-1 rounded-xl border border-slate-200 inline-block mt-1">
                              Keluhan: &ldquo;{apt.keluhan}&rdquo;
                            </p>
                          )}
                        </div>

                        <div className="self-end sm:self-center">
                          {isReady ? (
                            <Link
                              href={`/dokter/janji/${apt.id}`}
                              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#00c5de] to-[#06b6d4] hover:from-[#06b6d4] hover:to-[#0891b2] text-white text-xs font-extrabold uppercase tracking-wider shadow-md shadow-cyan-500/25 transition active:scale-95"
                            >
                              <Stethoscope className="w-3.5 h-3.5" />
                              <span>Mulai Periksa</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          ) : apt.status === "selesai" ? (
                            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-bold px-4 py-2 bg-emerald-50 rounded-full border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Pemeriksaan Selesai
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400 font-medium">
                              {apt.status === "menunggu"
                                ? "Menunggu verifikasi resepsionis"
                                : apt.status === "dikonfirmasi"
                                ? "Pasien belum tiba di klinik"
                                : "Dibatalkan"}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </AppLayout>
    </RouteGuard>
  );
}
