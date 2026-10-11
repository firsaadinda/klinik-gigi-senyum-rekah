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
  CheckCircle,
  Stethoscope,
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

      // 1. Ambil jumlah janji menunggu konfirmasi
      const qWait = query(
        collection(db, "janji_temu"),
        where("status", "==", "menunggu")
      );
      const snapWait = await getDocs(qWait);
      setWaitingCount(snapWait.size);

      // 2. Ambil semua dokter
      const qDoc = query(
        collection(db, "users"),
        where("role", "==", "dokter"),
        where("aktif", "==", true)
      );
      const snapDoc = await getDocs(qDoc);
      const docList = [];
      snapDoc.forEach((d) => docList.push({ id: d.id, ...d.data() }));
      setDoctors(docList);

      // 3. Ambil janji hari ini
      const qToday = query(
        collection(db, "janji_temu"),
        where("tanggal", "==", today)
      );
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

        const appointmentObj = {
          id: d.id,
          ...item,
          patientName,
          serviceName,
        };

        if (byDoctor[item.dokterId]) {
          byDoctor[item.dokterId].push(appointmentObj);
        } else {
          byDoctor[item.dokterId] = [appointmentObj];
        }
      }

      // Sort by jam in each doctor column
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
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#0E7490]">Meja Depan</span>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight mt-1">Dasbor Resepsionis</h1>
              <p className="text-xs text-slate-500 mt-1">
                Kelola konfirmasi janji dan pantau kedatangan pasien klinik hari ini ({todayStr}).
              </p>
            </div>
            <Link
              href="/resepsionis/janji"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#0E7490] text-white text-xs font-semibold hover:bg-[#155E75] shadow-sm transition shrink-0"
            >
              <ClipboardList className="w-4 h-4" />
              Kelola Semua Janji
            </Link>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          {/* Kartu Ringkasan Sesuai PRD 4.6 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/resepsionis/janji?status=menunggu"
              className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:border-amber-400 transition group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Menunggu Konfirmasi</span>
                <span className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <ClipboardList className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-amber-600 tabular-nums">
                  {loading ? "..." : waitingCount}
                </span>
                <span className="text-xs text-slate-400">janji baru</span>
              </div>
              <p className="text-[11px] text-[#0E7490] mt-3 group-hover:underline flex items-center gap-1 font-semibold">
                Buka daftar saringan Menunggu →
              </p>
            </Link>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tanggal Operasional</span>
                <span className="w-8 h-8 rounded-xl bg-cyan-50 text-[#0E7490] flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-4">
                <span className="text-xl font-bold text-slate-800 tabular-nums">{todayStr}</span>
                <p className="text-xs text-slate-400 mt-1">Waktu Indonesia Tengah (WITA)</p>
              </div>
            </div>

            <Link
              href="/resepsionis/pasien"
              className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:border-[#0E7490] transition group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Data Pasien</span>
                <span className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-4">
                <span className="text-base font-bold text-slate-800">Buku Kontak Pasien</span>
                <p className="text-xs text-slate-400 mt-1">Cari nomor HP & WhatsApp pasien</p>
              </div>
              <p className="text-[11px] text-[#0E7490] mt-3 group-hover:underline flex items-center gap-1 font-semibold">
                Lihat daftar kontak →
              </p>
            </Link>
          </div>

          {/* Janji Hari Ini Per Dokter Sesuai PRD 4.6 */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#0E7490]" />
                Jadwal Janji Hari Ini per Dokter
              </h2>
              <button
                onClick={loadData}
                className="text-xs text-[#0E7490] font-semibold hover:underline"
              >
                Segarkan
              </button>
            </div>

            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="w-7 h-7 animate-spin text-[#0E7490] mb-2" />
                <p className="text-xs">Memuat jadwal dokter...</p>
              </div>
            ) : doctors.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">Belum ada akun dokter terdaftar.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {doctors.map((docItem) => {
                  const appointments = todayAppointmentsByDoctor[docItem.id] || [];
                  return (
                    <div key={docItem.id} className="bg-slate-50/70 border border-slate-200 rounded-2xl p-5 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                        <div className="flex items-center gap-2">
                          <Stethoscope className="w-4 h-4 text-[#0E7490]" />
                          <h3 className="font-bold text-slate-800 text-sm">{docItem.nama}</h3>
                        </div>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                          {appointments.length} Janji
                        </span>
                      </div>

                      {appointments.length === 0 ? (
                        <div className="py-8 text-center text-xs text-slate-400">
                          Tidak ada janji untuk dokter ini hari ini.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {appointments.map((apt) => (
                            <Link
                              key={apt.id}
                              href={`/resepsionis/janji/${apt.id}`}
                              className="block p-3 bg-white rounded-xl border border-slate-200 hover:border-[#0E7490] hover:shadow-sm transition"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-xs text-slate-800 tabular-nums">
                                  {apt.jam} WITA
                                </span>
                                <StatusBadge status={apt.status} />
                              </div>
                              <p className="text-xs font-semibold text-slate-700 mt-1">{apt.patientName}</p>
                              <p className="text-[11px] text-slate-500">{apt.serviceName}</p>
                            </Link>
                          ))}
                        </div>
                      )}
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
