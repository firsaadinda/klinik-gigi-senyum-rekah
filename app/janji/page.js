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
  PlusCircle,
  ArrowRight,
  Loader2,
  AlertCircle,
  ChevronRight,
  Filter,
} from "lucide-react";

export default function DaftarJanjiPasienPage() {
  const { user } = useAuth();
  const [janjiList, setJanjiList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("semua");
  const [error, setError] = useState("");

  const loadJanji = async () => {
    if (!user) return;
    setLoading(true);
    setError("");

    try {
      const q = query(
        collection(db, "janji_temu"),
        where("pasienId", "==", user.uid)
      );
      const snap = await getDocs(q);

      const items = [];
      for (const d of snap.docs) {
        const data = d.data();
        let doctorName = "Dokter";
        let serviceName = "Layanan";

        if (data.dokterId) {
          try {
            const docSnap = await getDoc(doc(db, "users", data.dokterId));
            if (docSnap.exists()) doctorName = docSnap.data().nama;
          } catch {}
        }

        if (data.layananId) {
          try {
            const laySnap = await getDoc(doc(db, "layanan", data.layananId));
            if (laySnap.exists()) serviceName = laySnap.data().nama;
          } catch {}
        }

        items.push({
          id: d.id,
          ...data,
          doctorName,
          serviceName,
        });
      }

      // Urutkan dari tanggal terdekat
      items.sort((a, b) => {
        const dtA = `${a.tanggal} ${a.jam}`;
        const dtB = `${b.tanggal} ${b.jam}`;
        return dtB.localeCompare(dtA);
      });

      setJanjiList(items);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat daftar janji temu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJanji();
  }, [user]);

  const filtered = janjiList.filter((item) => {
    if (filterStatus === "semua") return true;
    return item.status === filterStatus;
  });

  return (
    <RouteGuard allowedRoles={["pasien"]}>
      <AppLayout>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#0E7490] bg-cyan-50 px-2 py-0.5 rounded border border-cyan-100">
                  Portal Pasien
                </span>
                <span className="text-xs text-slate-400">• Reservasi Rawat Jalan</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Janji Temu Saya</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Daftar permohonan reservasi kunjungan Anda di Klinik Gigi Senyum Rekah.
              </p>
            </div>
            <Link
              href="/janji/baru"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-[#0E7490] text-white font-medium text-xs hover:bg-[#155E75] transition shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              Buat Janji Baru
            </Link>
          </div>

          {/* Filter Bar Segmented Pills */}
          <div className="bg-white p-2.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-1.5 overflow-x-auto">
            <span className="text-xs font-semibold text-slate-400 px-2 flex items-center gap-1.5 shrink-0">
              <Filter className="w-3.5 h-3.5" />
              Filter:
            </span>
            {["semua", "menunggu", "dikonfirmasi", "hadir", "selesai", "dibatalkan"].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize whitespace-nowrap transition ${
                  filterStatus === st
                    ? "bg-[#0E7490] text-white shadow-xs"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/70"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-500">
              <Loader2 className="w-7 h-7 animate-spin text-[#0E7490] mx-auto mb-2" />
              <p className="text-xs">Memuat daftar janji temu...</p>
            </div>
          ) : error ? (
            <div className="p-6 bg-red-50 rounded-2xl border border-red-200 text-center text-red-600 text-xs">
              <AlertCircle className="w-5 h-5 mx-auto mb-2 text-red-500" />
              <p>{error}</p>
              <button
                onClick={loadJanji}
                className="mt-3 px-3 py-1 bg-white border border-red-200 rounded-lg text-xs font-medium"
              >
                Coba lagi
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-400">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto mb-2.5">
                <Calendar className="w-6 h-6" />
              </div>
              <p className="font-bold text-slate-800 text-sm">Tidak ada janji temu ditemukan</p>
              <p className="text-xs text-slate-400 mt-1 mb-4">
                {filterStatus !== "semua"
                  ? `Tidak ada janji temu dengan status "${filterStatus}".`
                  : "Anda belum pernah mengajukan janji temu."}
              </p>
              <Link
                href="/janji/baru"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0E7490] text-white text-xs font-semibold hover:bg-[#155E75] shadow-xs"
              >
                <PlusCircle className="w-4 h-4" />
                Buat Janji Sekarang
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((item) => (
                <Link
                  key={item.id}
                  href={`/janji/${item.id}`}
                  className="block p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-[#0E7490] hover:shadow-sm transition group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-cyan-50 text-[#0E7490] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        {item.doctorName.charAt(0)}
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2.5">
                          <StatusBadge status={item.status} />
                          <span className="text-xs text-slate-400 font-mono">#{item.id.slice(0, 8)}</span>
                        </div>
                        
                        <h3 className="font-bold text-slate-900 text-base group-hover:text-[#0E7490] transition">
                          {item.serviceName}
                        </h3>

                        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-slate-600">
                          <span className="flex items-center gap-1.5 tabular-nums font-semibold text-slate-800">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {item.tanggal}
                          </span>
                          <span className="flex items-center gap-1.5 tabular-nums font-semibold text-slate-800">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {item.jam} WITA
                          </span>
                          <span>
                            Dokter: <strong className="text-slate-800">{item.doctorName}</strong>
                          </span>
                        </div>

                        {item.keluhan && (
                          <p className="text-xs text-slate-500 line-clamp-1 italic mt-1 bg-slate-50 px-2.5 py-1 rounded-lg">
                            Keluhan: &ldquo;{item.keluhan}&rdquo;
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 self-end sm:self-center text-xs font-semibold text-[#0E7490] group-hover:translate-x-1 transition shrink-0">
                      <span>Rincian Voucher</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </AppLayout>
    </RouteGuard>
  );
}
