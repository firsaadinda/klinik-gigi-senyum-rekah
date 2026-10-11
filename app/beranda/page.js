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
  Calendar,
  Clock,
  ArrowRight,
  PlusCircle,
  AlertCircle,
  Loader2,
  FileText,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Smile
} from "lucide-react";

export default function BerandaPage() {
  const { user, userData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [allAppointments, setAllAppointments] = useState([]);
  const [nearestJanji, setNearestJanji] = useState(null);
  const [doctorName, setDoctorName] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [error, setError] = useState("");
  const [selectedDayStr, setSelectedDayStr] = useState("");

  const [activeCount, setActiveCount] = useState(0);
  const [doneCount, setDoneCount] = useState(0);

  const [todayStr, setTodayStr] = useState("");
  const [weekDays, setWeekDays] = useState([]);
  const [formattedToday, setFormattedToday] = useState("");

  useEffect(() => {
    const now = new Date();
    const strToday = now.toISOString().slice(0, 10);
    setTodayStr(strToday);
    setSelectedDayStr((prev) => prev || strToday);
    setFormattedToday(
      now.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    );

    const days = [];
    for (let i = -1; i <= 5; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + i);
      const str = d.toISOString().slice(0, 10);
      const dayNames = ["MIN", "SEN", "SEL", "RAB", "KAM", "JUM", "SAB"];
      days.push({
        dateStr: str,
        dayName: dayNames[d.getDay()],
        dayNum: d.getDate(),
        isToday: str === strToday,
      });
    }
    setWeekDays(days);
  }, []);

  const fetchJanjiTerdekat = async () => {
    if (!user) return;
    setLoading(true);
    setError("");

    try {
      const q = query(
        collection(db, "janji_temu"),
        where("pasienId", "==", user.uid)
      );
      const snapshot = await getDocs(q);

      let list = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() });
      });

      setAllAppointments(list);

      const activeList = list
        .filter((item) => ["menunggu", "dikonfirmasi", "hadir"].includes(item.status))
        .sort((a, b) => {
          const dtA = `${a.tanggal} ${a.jam}`;
          const dtB = `${b.tanggal} ${b.jam}`;
          return dtA.localeCompare(dtB);
        });

      setActiveCount(activeList.length);
      setDoneCount(list.filter((item) => item.status === "selesai").length);

      if (activeList.length > 0) {
        const top = activeList[0];
        setNearestJanji(top);
        setSelectedDayStr(top.tanggal || todayStr);

        if (top.dokterId) {
          try {
            const docSnap = await getDoc(doc(db, "users", top.dokterId));
            if (docSnap.exists()) setDoctorName(docSnap.data().nama);
            else setDoctorName("Dokter");
          } catch {
            setDoctorName("Dokter");
          }
        }

        if (top.layananId) {
          try {
            const laySnap = await getDoc(doc(db, "layanan", top.layananId));
            if (laySnap.exists()) setServiceName(laySnap.data().nama);
          } catch {
            setServiceName("Pemeriksaan");
          }
        }
      } else {
        setNearestJanji(null);
        setSelectedDayStr(todayStr);
      }
    } catch (err) {
      console.error(err);
      setError("Gagal memuat data janji terdekat.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJanjiTerdekat();
  }, [user]);

  const appointmentsOnSelectedDay = allAppointments.filter(
    (a) => a.tanggal === selectedDayStr && ["menunggu", "dikonfirmasi", "hadir"].includes(a.status)
  );

  return (
    <RouteGuard allowedRoles={["pasien"]}>
      <AppLayout>
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Greeting Header (Dantoa Dental Clinic Soft Banner) */}
          <div className="bg-gradient-to-r from-[#e9f7fb] via-[#f0f9ff] to-white rounded-3xl p-6 sm:p-8 border border-cyan-100 shadow-[0_2px_15px_rgba(0,180,216,0.06)] relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:20px_20px] opacity-30 pointer-events-none" />

            <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-white text-[#0891b2] text-[11px] font-extrabold uppercase tracking-wider shadow-xs border border-cyan-200">
                  {formattedToday}
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Halo, {userData?.nama?.split(" ")[0] || "Pasien"}! 👋
                </h1>
                <p className="text-slate-600 text-xs sm:text-sm font-medium max-w-md">
                  Selamat datang di Portal Resmi Klinik Gigi Senyum Rekah Makassar. Jadwalkan pemeriksaan dan pantau riwayat perawatan gigi Anda di sini.
                </p>
              </div>

              <Link
                href="/janji/baru"
                id="btn-buat-janji"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#00c5de] to-[#06b6d4] hover:from-[#06b6d4] hover:to-[#0891b2] text-white text-xs font-extrabold uppercase tracking-wider shadow-md shadow-cyan-500/25 transition shrink-0 active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Buat Janji Baru</span>
              </Link>
            </div>
          </div>

          {/* Stats Row (Dantoa Dental Big Stats Aesthetic) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 flex items-center justify-between shadow-[0_2px_12px_rgba(0,180,216,0.04)]">
              <div>
                <span className="text-3xl sm:text-4xl font-black text-[#06b6d4] tracking-tight block">
                  {loading ? <Loader2 className="w-6 h-6 animate-spin text-slate-300" /> : activeCount}
                </span>
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider mt-1 block">
                  Janji Temu Aktif
                </span>
                <span className="text-[11px] text-slate-400">Dalam antrean/konfirmasi</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-[#06b6d4] flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 flex items-center justify-between shadow-[0_2px_12px_rgba(0,180,216,0.04)]">
              <div>
                <span className="text-3xl sm:text-4xl font-black text-emerald-500 tracking-tight block">
                  {loading ? <Loader2 className="w-6 h-6 animate-spin text-slate-300" /> : doneCount}
                </span>
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider mt-1 block">
                  Sesi Perawatan
                </span>
                <span className="text-[11px] text-slate-400">Tindakan medis selesai</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 flex items-center justify-between shadow-[0_2px_12px_rgba(0,180,216,0.04)]">
              <div>
                <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight block">
                  EHR 24/7
                </span>
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider mt-1 block">
                  Rekam Medis
                </span>
                <span className="text-[11px] text-slate-400">Tersimpan rapi & aman</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Weekly Calendar Strip */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,180,216,0.04)] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-cyan-50 text-[#06b6d4] flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <span className="text-sm font-extrabold text-slate-900">Jadwal Mingguan Anda</span>
              </div>
              <span className="text-xs text-slate-400 font-medium">Pilih tanggal untuk melihat jadwal</span>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((day) => {
                const isSelected = selectedDayStr === day.dateStr;
                const hasSchedule = allAppointments.some(
                  (a) => a.tanggal === day.dateStr && ["menunggu", "dikonfirmasi", "hadir"].includes(a.status)
                );
                return (
                  <button
                    key={day.dateStr}
                    onClick={() => setSelectedDayStr(day.dateStr)}
                    className={`flex flex-col items-center justify-center py-3 rounded-2xl border transition relative focus:outline-none ${
                      isSelected
                        ? "bg-[#06b6d4] text-white border-[#06b6d4] shadow-md shadow-cyan-500/25"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-cyan-50/50 hover:border-cyan-200"
                    }`}
                  >
                    <span className={`text-[10px] font-extrabold uppercase ${isSelected ? "text-cyan-100" : "text-slate-400"}`}>
                      {day.dayName}
                    </span>
                    <span className="text-base font-black mt-0.5 tabular-nums">{day.dayNum}</span>
                    {hasSchedule && (
                      <span className={`w-1.5 h-1.5 rounded-full mt-1 ${isSelected ? "bg-white" : "bg-[#06b6d4]"}`} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Selected Day Agenda */}
            {appointmentsOnSelectedDay.length > 0 && (
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Agenda Tanggal {selectedDayStr}
                </p>
                {appointmentsOnSelectedDay.map((apt) => (
                  <Link
                    key={apt.id}
                    href={`/janji/${apt.id}`}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-cyan-50/50 border border-cyan-200/80 hover:bg-cyan-50 transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#06b6d4] text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-slate-900 tabular-nums">{apt.jam} WITA</p>
                        <StatusBadge status={apt.status} />
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#06b6d4] transition" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Nearest Appointment Card (Dantoa Dental Voucher Card) */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,180,216,0.04)] overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-cyan-50 text-[#06b6d4] flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <span className="text-sm font-extrabold text-slate-900">Janji Temu Terdekat</span>
              </div>
              {nearestJanji && (
                <Link
                  href="/janji"
                  className="text-xs font-bold text-[#06b6d4] hover:underline flex items-center gap-1"
                >
                  Semua Janji
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

            <div className="p-6">
              {loading ? (
                <div className="py-10 flex flex-col items-center justify-center gap-2 text-slate-400">
                  <Loader2 className="w-7 h-7 animate-spin text-[#06b6d4]" />
                  <p className="text-xs">Memuat jadwal janji temu...</p>
                </div>
              ) : error ? (
                <div className="py-6 text-center">
                  <AlertCircle className="w-6 h-6 mx-auto mb-2 text-red-400" />
                  <p className="text-xs text-red-600 font-medium">{error}</p>
                  <button
                    onClick={fetchJanjiTerdekat}
                    className="mt-3 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-xs font-bold transition"
                  >
                    Coba lagi
                  </button>
                </div>
              ) : nearestJanji ? (
                <div className="bg-[#f0f9ff] rounded-2xl border border-cyan-200 p-5 sm:p-6 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-cyan-200/60">
                    <StatusBadge status={nearestJanji.status} />
                    <div className="flex items-center gap-2 text-xs font-extrabold text-cyan-900">
                      <Clock className="w-4 h-4 text-[#06b6d4]" />
                      <span>{nearestJanji.tanggal} · {nearestJanji.jam} WITA</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#06b6d4]">
                        Layanan Terpilih
                      </span>
                      <h3 className="text-lg font-black text-slate-900">
                        {serviceName || "Pemeriksaan Gigi"}
                      </h3>
                      <p className="text-xs text-slate-600 flex items-center gap-2 pt-0.5">
                        <span className="text-slate-400">Dokter:</span>
                        <strong className="text-slate-800">{doctorName || "Dokter Gigi"}</strong>
                        <span className="text-slate-300">·</span>
                        <span className="text-slate-400 font-mono text-[11px]">#{nearestJanji.id.slice(0, 8)}</span>
                      </p>
                    </div>

                    <Link
                      href={`/janji/${nearestJanji.id}`}
                      id="btn-detail-janji"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#06b6d4] hover:bg-[#0891b2] text-white text-xs font-bold shadow-md shadow-cyan-500/20 transition active:scale-95 shrink-0"
                    >
                      <span>Lihat Detail</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="py-10 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-cyan-50 text-[#06b6d4] flex items-center justify-center mx-auto mb-3">
                    <Calendar className="w-7 h-7" />
                  </div>
                  <p className="font-extrabold text-slate-900 text-sm">Belum Ada Janji Temu Aktif</p>
                  <p className="text-xs text-slate-500 mt-1 mb-5 max-w-sm mx-auto">
                    Kesehatan gigi Anda prioritas kami. Reservasi jadwal pemeriksaan dengan dokter spesialis kami hari ini.
                  </p>
                  <Link
                    href="/janji/baru"
                    id="btn-buat-janji-kosong"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#00c5de] to-[#06b6d4] hover:from-[#06b6d4] hover:to-[#0891b2] text-white text-xs font-extrabold uppercase tracking-wider shadow-md shadow-cyan-500/25 transition active:scale-95"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Reservasi Sekarang</span>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/janji"
              id="link-semua-janji"
              className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,180,216,0.04)] hover:border-cyan-300 hover:shadow-md transition flex items-center justify-between group"
            >
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm group-hover:text-[#06b6d4] transition">
                  Daftar Janji Temu Saya
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Pantau status konfirmasi & jam hadir</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-slate-50 group-hover:bg-[#06b6d4] text-slate-400 group-hover:text-white flex items-center justify-center transition shrink-0">
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

            <Link
              href="/riwayat"
              id="link-riwayat"
              className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,180,216,0.04)] hover:border-cyan-300 hover:shadow-md transition flex items-center justify-between group"
            >
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm group-hover:text-[#06b6d4] transition">
                  Riwayat & Rekam Medis
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Catatan tindakan dokter terdahulu</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-slate-50 group-hover:bg-[#06b6d4] text-slate-400 group-hover:text-white flex items-center justify-center transition shrink-0">
                <FileText className="w-4 h-4" />
              </div>
            </Link>
          </div>
        </div>
      </AppLayout>
    </RouteGuard>
  );
}
