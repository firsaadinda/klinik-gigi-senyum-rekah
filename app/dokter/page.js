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
  User,
  ArrowRight,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Smile,
  ShieldCheck,
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

      // PRD 4.9: Hanya janji dengan dokterId miliknya yang tampil!
      // Kecuali super_admin yang berhak melihat semua
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

      // Urutkan dari jam paling awal
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
        <div className="space-y-6">
          {/* Welcome Dokter */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-purple-700">Ruang Praktik Dokter</span>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight mt-1">
                Selamat Bertugas, {userData?.nama || "drg. Dokter"}! 🩺
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Jadwal praktik hari ini: <span className="font-semibold text-slate-700 tabular-nums">{todayStr}</span> (WITA).
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3.5 py-2 rounded-xl bg-purple-50 text-purple-700 text-xs font-semibold border border-purple-200">
                {readyCount} Pasien Siap Diperiksa
              </span>
            </div>
          </div>

          {/* Kartu Statistik Cepat */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Jadwal Hari Ini</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-800 tabular-nums">{appointments.length}</span>
                <span className="text-xs text-slate-400">pasien</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider">Siap Diperiksa (Hadir)</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-purple-700 tabular-nums">{readyCount}</span>
                <span className="text-xs text-purple-600">di ruang tunggu</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Selesai Ditangani</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-emerald-600 tabular-nums">{completedCount}</span>
                <span className="text-xs text-emerald-600">rekam medis tercatat</span>
              </div>
            </div>
          </div>

          {/* Daftar Janji Hari Ini Milik Dokter (PRD 4.9) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-[#0E7490]" />
                Daftar Pasien Praktik Hari Ini
              </h2>
              <button
                onClick={loadDoctorSchedule}
                className="text-xs font-semibold text-[#0E7490] hover:underline"
              >
                Segarkan
              </button>
            </div>

            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="w-8 h-8 text-[#0E7490] animate-spin mb-2" />
                <p className="text-sm">Memuat jadwal dokter...</p>
              </div>
            ) : error ? (
              <div className="p-6 bg-red-50 text-red-600 rounded-xl text-center text-xs">
                <p>{error}</p>
              </div>
            ) : appointments.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <Calendar className="w-10 h-10 mx-auto mb-2 opacity-40 text-slate-500" />
                <p className="font-semibold text-slate-700">Tidak ada jadwal pasien hari ini</p>
                <p className="text-xs text-slate-400 mt-1">
                  Anda tidak memiliki janji temu yang dijadwalkan untuk tanggal {todayStr}.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {appointments.map((apt) => {
                  const isReady = apt.status === "hadir";
                  return (
                    <div
                      key={apt.id}
                      className={`p-4 sm:p-5 rounded-2xl transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 my-1 ${
                        isReady
                          ? "bg-purple-50/60 border border-purple-200 ring-1 ring-purple-300/40"
                          : "hover:bg-slate-50/80 border border-transparent"
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2.5">
                          <span className="font-bold text-sm text-slate-800 tabular-nums">
                            {apt.jam} WITA
                          </span>
                          <StatusBadge status={apt.status} />
                          {isReady && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-600 text-white animate-pulse">
                              ✨ Siap Diperiksa
                            </span>
                          )}
                        </div>

                        <h3 className="font-bold text-slate-900 text-base">
                          {apt.patientName}
                        </h3>

                        <div className="text-xs text-slate-600">
                          Layanan: <span className="font-semibold text-slate-800">{apt.serviceName}</span>
                        </div>

                        {apt.keluhan && (
                          <p className="text-xs text-slate-500 italic bg-white/70 px-3 py-1.5 rounded-lg border border-slate-200/50 inline-block">
                            Keluhan: &ldquo;{apt.keluhan}&rdquo;
                          </p>
                        )}
                      </div>

                      <div className="self-end sm:self-center">
                        {isReady ? (
                          <Link
                            href={`/dokter/janji/${apt.id}`}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 shadow-md transition"
                          >
                            <Stethoscope className="w-4 h-4" />
                            Mulai Pemeriksaan
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        ) : apt.status === "selesai" ? (
                          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-semibold px-3 py-1.5 bg-emerald-50 rounded-xl border border-emerald-200">
                            <CheckCircle2 className="w-4 h-4" />
                            Pemeriksaan Selesai
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 italic">
                            {apt.status === "menunggu"
                              ? "Menunggu konfirmasi meja depan"
                              : apt.status === "dikonfirmasi"
                              ? "Belum tiba di klinik"
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
      </AppLayout>
    </RouteGuard>
  );
}
