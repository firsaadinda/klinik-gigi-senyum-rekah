"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import RouteGuard from "@/components/RouteGuard";
import AppLayout from "@/components/AppLayout";
import StatusBadge from "@/components/StatusBadge";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import {
  Calendar,
  Clock,
  Users,
  ClipboardList,
  AlertCircle,
  ArrowRight,
  Loader2,
  RefreshCw,
  Sparkles
} from "lucide-react";

export default function DasborResepsionisPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [waitingCount, setWaitingCount] = useState(0);
  const [doctors, setDoctors] = useState([]);
  const [todayAppointmentsByDoctor, setTodayAppointmentsByDoctor] = useState({});
  const [todayStr, setTodayStr] = useState("");
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const today = new Date().toISOString().split("T")[0];
      setTodayStr(today);

      const qWait = query(collection(db, "janji_temu"), where("status", "==", "menunggu"));
      const snapWait = await getDocs(qWait);
      setWaitingCount(snapWait.size);

      const qDoc = query(collection(db, "users"), where("role", "==", "dokter"), where("aktif", "==", true));
      const snapDoc = await getDocs(qDoc);
      const docList = [];
      snapDoc.forEach((d) => docList.push({ id: d.id, ...d.data() }));
      setDoctors(docList);

      const qToday = query(collection(db, "janji_temu"), where("tanggal", "==", today));
      const snapToday = await getDocs(qToday);

      const byDoctor = {};
      docList.forEach((doc) => {
        byDoctor[doc.id] = [];
      });

      for (const d of snapToday.docs) {
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

        const appointmentObj = { id: d.id, ...item, patientName, serviceName };

        if (byDoctor[item.dokterId]) {
          byDoctor[item.dokterId].push(appointmentObj);
        } else {
          byDoctor[item.dokterId] = [appointmentObj];
        }
      }

      Object.keys(byDoctor).forEach((dId) => {
        byDoctor[dId].sort((a, b) => (a.jam || "").localeCompare(b.jam || ""));
      });

      setTodayAppointmentsByDoctor(byDoctor);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat dasbor resepsionis.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <RouteGuard allowedRoles={["resepsionis"]}>
      <AppLayout>
        <div className="space-y-6 max-w-5xl mx-auto">
          {/* Header Banner (Dantoa Dental Soft Banner) */}
          <div className="bg-gradient-to-r from-[#e9f7fb] via-[#f0f9ff] to-white rounded-3xl p-6 sm:p-8 border border-cyan-100 shadow-[0_2px_15px_rgba(0,180,216,0.06)] relative overflow-hidden">
            <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-white text-[#0891b2] text-[11px] font-extrabold uppercase tracking-wider shadow-xs border border-cyan-200">
                  Meja Depan Klinik · {todayStr}
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Dasbor Operasional Resepsionis
                </h1>
                <p className="text-slate-600 text-xs sm:text-sm font-medium max-w-md">
                  Verifikasi kedatangan pasien, konfirmasi jadwal reservasi, dan koordinasi antrean dokter gigi secara realtime.
                </p>
              </div>

              <Link
                href="/resepsionis/janji"
                id="btn-kelola-janji"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#00c5de] to-[#06b6d4] hover:from-[#06b6d4] hover:to-[#0891b2] text-white text-xs font-extrabold uppercase tracking-wider shadow-md shadow-cyan-500/25 transition shrink-0 active:scale-95"
              >
                <ClipboardList className="w-4 h-4" />
                <span>Kelola Semua Janji</span>
              </Link>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Metric Cards (Dantoa Dental Stats style) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/resepsionis/janji?status=menunggu"
              id="card-menunggu"
              className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,180,216,0.04)] p-6 hover:border-amber-300 hover:shadow-md transition group block"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                  Menunggu Konfirmasi
                </span>
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <ClipboardList className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-amber-600 tabular-nums">
                  {loading ? "..." : waitingCount}
                </span>
                <span className="text-xs font-bold text-slate-500 uppercase">Permohonan</span>
              </div>
              <p className="text-xs text-[#06b6d4] mt-3 flex items-center gap-1 font-bold group-hover:underline">
                Saring status Menunggu <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </p>
            </Link>

            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,180,216,0.04)] p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                  Tanggal Operasional
                </span>
                <div className="w-10 h-10 rounded-2xl bg-cyan-50 text-[#06b6d4] flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums">
                  {todayStr || "--"}
                </span>
                <p className="text-xs text-slate-400 mt-1 font-medium">Zona Waktu Makassar (WITA)</p>
              </div>
            </div>

            <Link
              href="/resepsionis/pasien"
              id="card-pasien"
              className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,180,216,0.04)] p-6 hover:border-cyan-300 hover:shadow-md transition group block"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                  Buku Kontak Pasien
                </span>
                <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div>
                <span className="text-base font-extrabold text-slate-900 block">Direktori & WhatsApp</span>
                <p className="text-xs text-slate-400 mt-0.5">Verifikasi nomor kontak pasien</p>
              </div>
              <p className="text-xs text-[#06b6d4] mt-3 flex items-center gap-1 font-bold group-hover:underline">
                Buka daftar pasien <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </p>
            </Link>
          </div>

          {/* Doctor Queue Board */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,180,216,0.04)] overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-50 text-[#06b6d4] flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-extrabold text-slate-900">Jadwal Praktik Dokter Hari Ini</h2>
                  <p className="text-xs text-slate-400">Antrean pasien per ruang periksa dokter gigi</p>
                </div>
              </div>
              <button
                id="btn-segarkan"
                onClick={loadData}
                className="inline-flex items-center gap-1.5 text-xs text-[#06b6d4] font-bold hover:text-[#0891b2] px-4 py-2 rounded-full hover:bg-cyan-50 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Segarkan
              </button>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
                  <Loader2 className="w-7 h-7 animate-spin text-[#06b6d4]" />
                  <p className="text-xs font-medium">Memuat antrean dokter...</p>
                </div>
              ) : doctors.length === 0 ? (
                <p className="text-xs text-slate-400 py-8 text-center">Belum ada akun dokter terdaftar.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {doctors.map((docItem) => {
                    const appointments = todayAppointmentsByDoctor[docItem.id] || [];
                    const initial = docItem.nama ? docItem.nama.replace("drg. ", "").charAt(0) : "D";
                    return (
                      <div key={docItem.id} className="bg-slate-50 border border-slate-200 rounded-3xl overflow-hidden">
                        {/* Doctor Card Header */}
                        <div className="px-5 py-4 border-b border-slate-200/80 flex items-center justify-between bg-white">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#06b6d4] to-[#00c5de] text-white font-black text-xs flex items-center justify-center shadow-xs">
                              {initial}
                            </div>
                            <div>
                              <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm">{docItem.nama}</h3>
                              <p className="text-[11px] text-cyan-600 font-bold uppercase tracking-wider">Dokter Gigi Pemeriksa</p>
                            </div>
                          </div>
                          <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200">
                            {appointments.length} Pasien
                          </span>
                        </div>

                        <div className="p-4 space-y-2.5">
                          {appointments.length === 0 ? (
                            <div className="py-8 text-center text-xs text-slate-400 bg-white/70 rounded-2xl border border-dashed border-slate-200">
                              Tidak ada antrean hari ini
                            </div>
                          ) : (
                            appointments.map((apt) => (
                              <Link
                                key={apt.id}
                                href={`/resepsionis/janji/${apt.id}`}
                                className="flex items-center justify-between p-3.5 bg-white rounded-2xl border border-slate-200/80 hover:border-[#06b6d4] hover:shadow-sm transition group"
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-3.5 h-3.5 text-[#06b6d4]" />
                                    <span className="font-extrabold text-xs text-slate-900 tabular-nums">{apt.jam} WITA</span>
                                    <StatusBadge status={apt.status} />
                                  </div>
                                  <p className="text-xs font-bold text-slate-800 group-hover:text-[#06b6d4] transition pl-5">
                                    {apt.patientName}
                                  </p>
                                  <p className="text-[11px] text-slate-400 pl-5">{apt.serviceName}</p>
                                </div>
                                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#06b6d4] transition shrink-0" />
                              </Link>
                            ))
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
