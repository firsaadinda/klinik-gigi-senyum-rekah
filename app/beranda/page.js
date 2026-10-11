"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import RouteGuard from "@/components/RouteGuard";
import AppLayout from "@/components/AppLayout";
import StatusBadge from "@/components/StatusBadge";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { Calendar, Clock, ArrowRight, PlusCircle, AlertCircle, Loader2, FileText, CheckCircle2 } from "lucide-react";

export default function BerandaPage() {
  const { user, userData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [nearestJanji, setNearestJanji] = useState(null);
  const [doctorName, setDoctorName] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [error, setError] = useState("");

  const fetchJanjiTerdekat = async () => {
    if (!user) return;
    setLoading(true);
    setError("");

    try {
      // Ambil janji milik pasien ini yang belum selesai dan belum dibatalkan
      const q = query(
        collection(db, "janji_temu"),
        where("pasienId", "==", user.uid)
      );
      const snapshot = await getDocs(q);

      let list = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() });
      });

      // Filter janji aktif (menunggu, dikonfirmasi, hadir) dan urutkan dari tanggal terdekat
      const activeList = list
        .filter((item) => ["menunggu", "dikonfirmasi", "hadir"].includes(item.status))
        .sort((a, b) => {
          const dtA = `${a.tanggal} ${a.jam}`;
          const dtB = `${b.tanggal} ${b.jam}`;
          return dtA.localeCompare(dtB);
        });

      if (activeList.length > 0) {
        const top = activeList[0];
        setNearestJanji(top);

        // Ambil nama dokter
        if (top.dokterId) {
          try {
            const docSnap = await getDoc(doc(db, "users", top.dokterId));
            if (docSnap.exists()) {
              setDoctorName(docSnap.data().nama);
            } else {
              setDoctorName("Dokter");
            }
          } catch {
            setDoctorName("Dokter");
          }
        }

        // Ambil nama layanan
        if (top.layananId) {
          try {
            const laySnap = await getDoc(doc(db, "layanan", top.layananId));
            if (laySnap.exists()) {
              setServiceName(laySnap.data().nama);
            }
          } catch {
            setServiceName("Pemeriksaan");
          }
        }
      } else {
        setNearestJanji(null);
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

  return (
    <RouteGuard allowedRoles={["pasien"]}>
      <AppLayout>
        <div className="space-y-6">
          {/* Welcome header */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#0E7490]">Portal Pasien</span>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight mt-1">
                Halo, {userData?.nama || "Pasien"}! 👋
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Selamat datang di sistem janji temu Klinik Gigi Senyum Rekah.
              </p>
            </div>
            <Link
              href="/janji/baru"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#0E7490] text-white font-semibold text-sm hover:bg-[#155E75] shadow-sm transition shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              Buat Janji Temu
            </Link>
          </div>

          {/* Kartu Janji Terdekat sesuai PRD 4.2 */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#0E7490]" />
                Janji Terdekat Anda
              </h2>
              {nearestJanji && (
                <Link
                  href="/janji"
                  className="text-xs font-semibold text-[#0E7490] hover:underline flex items-center gap-1"
                >
                  Lihat Semua
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="w-7 h-7 animate-spin text-[#0E7490] mb-2" />
                <p className="text-sm">Memuat janji terdekat...</p>
              </div>
            ) : error ? (
              <div className="py-8 text-center text-red-600 text-sm">
                <AlertCircle className="w-6 h-6 mx-auto mb-2 text-red-500" />
                <p>{error}</p>
                <button
                  onClick={fetchJanjiTerdekat}
                  className="mt-3 px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                >
                  Coba lagi
                </button>
              </div>
            ) : nearestJanji ? (
              <Link
                href={`/janji/${nearestJanji.id}`}
                className="block group bg-slate-50 hover:bg-cyan-50/50 border border-slate-200 hover:border-cyan-200 rounded-2xl p-5 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5">
                      <StatusBadge status={nearestJanji.status} />
                      <span className="text-xs text-slate-400">ID: {nearestJanji.id.slice(0, 8)}...</span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-800 group-hover:text-[#0E7490] transition">
                      {serviceName || "Layanan Gigi"}
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="tabular-nums font-medium">{nearestJanji.tanggal}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span className="tabular-nums font-medium">{nearestJanji.jam} WITA</span>
                      </div>
                      <div>
                        Dokter: <span className="font-semibold text-slate-700">{doctorName || "Dokter Gigi"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm font-semibold text-[#0E7490] group-hover:translate-x-1 transition">
                    <span>Lihat Rincian</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            ) : (
              <div className="py-12 text-center text-slate-500">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                  <Calendar className="w-6 h-6" />
                </div>
                <p className="font-semibold text-slate-700">Belum ada janji aktif</p>
                <p className="text-xs text-slate-400 mt-1 mb-5">
                  Anda tidak memiliki jadwal janji temu dalam waktu dekat.
                </p>
                <Link
                  href="/janji/baru"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0E7490] text-white text-xs font-semibold hover:bg-[#155E75] transition"
                >
                  <PlusCircle className="w-4 h-4" />
                  Buat Janji Sekarang
                </Link>
              </div>
            )}
          </div>

          {/* Pintasan Cepat Menu Lain */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/janji"
              className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:border-[#0E7490] transition flex items-center justify-between"
            >
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Semua Janji Saya</h3>
                <p className="text-xs text-slate-500 mt-0.5">Pantau status konfirmasi dan jadwal Anda</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>

            <Link
              href="/riwayat"
              className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:border-[#0E7490] transition flex items-center justify-between"
            >
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Riwayat Perawatan</h3>
                <p className="text-xs text-slate-500 mt-0.5">Baca tindakan dan catatan dokter yang telah selesai</p>
              </div>
              <FileText className="w-4 h-4 text-slate-400" />
            </Link>
          </div>
        </div>
      </AppLayout>
    </RouteGuard>
  );
}
