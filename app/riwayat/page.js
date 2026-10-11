"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import RouteGuard from "@/components/RouteGuard";
import AppLayout from "@/components/AppLayout";
import StatusBadge from "@/components/StatusBadge";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import {
  FileText,
  Calendar,
  Clock,
  User,
  Stethoscope,
  Loader2,
  AlertCircle,
  PlusCircle,
  CheckCircle2,
} from "lucide-react";

export default function RiwayatPerawatanPage() {
  const { user } = useAuth();
  const [riwayatList, setRiwayatList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRiwayat = async () => {
    if (!user) return;
    setLoading(true);
    setError("");

    try {
      // Ambil catatan_perawatan milik pasien ini sesuai PRD 4.4 & 7.1
      const q = query(
        collection(db, "catatan_perawatan"),
        where("pasienId", "==", user.uid)
      );
      const snap = await getDocs(q);

      const items = [];
      for (const d of snap.docs) {
        const catData = d.data();

        let tanggal = "-";
        let jam = "-";
        let doctorName = "drg. Dokter Gigi";
        let serviceName = "Perawatan Gigi";

        // Ambil data janji_temu pendukung
        if (catData.janjiId) {
          try {
            const jSnap = await getDoc(doc(db, "janji_temu", catData.janjiId));
            if (jSnap.exists()) {
              const jData = jSnap.data();
              tanggal = jData.tanggal;
              jam = jData.jam;

              if (jData.layananId) {
                const lSnap = await getDoc(doc(db, "layanan", jData.layananId));
                if (lSnap.exists()) serviceName = lSnap.data().nama;
              }
            }
          } catch {}
        }

        // Ambil nama dokter
        if (catData.dokterId) {
          try {
            const docSnap = await getDoc(doc(db, "users", catData.dokterId));
            if (docSnap.exists()) doctorName = docSnap.data().nama;
          } catch {}
        }

        items.push({
          id: d.id,
          ...catData,
          tanggal,
          jam,
          doctorName,
          serviceName,
        });
      }

      // Urutkan dari kunjungan terbaru
      items.sort((a, b) => (b.tanggal || "").localeCompare(a.tanggal || ""));
      setRiwayatList(items);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat riwayat perawatan medis.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRiwayat();
  }, [user]);

  return (
    <RouteGuard allowedRoles={["pasien"]}>
      <AppLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Riwayat Perawatan Medis</h1>
            <p className="text-xs text-slate-500 mt-1">
              Catatan tindakan medis dan instruksi perawatan dari dokter gigi yang telah selesai.
            </p>
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
              <Loader2 className="w-8 h-8 text-[#0E7490] animate-spin mx-auto mb-2" />
              <p className="text-sm">Memuat catatan perawatan...</p>
            </div>
          ) : error ? (
            <div className="p-6 bg-red-50 rounded-2xl border border-red-200 text-center text-red-600 text-sm">
              <AlertCircle className="w-6 h-6 mx-auto mb-2 text-red-500" />
              <p>{error}</p>
              <button
                onClick={loadRiwayat}
                className="mt-3 px-4 py-1.5 bg-white border border-red-200 rounded-lg text-xs font-semibold"
              >
                Coba lagi
              </button>
            </div>
          ) : riwayatList.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
              <FileText className="w-10 h-10 mx-auto mb-3 opacity-40 text-slate-500" />
              <p className="font-semibold text-slate-700">Belum Ada Riwayat Perawatan Selesai</p>
              <p className="text-xs text-slate-400 mt-1 mb-5">
                Hasil tindakan dokter gigi Anda akan otomatis tampil di sini setelah janji temu ditandai selesai.
              </p>
              <Link
                href="/janji/baru"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0E7490] text-white text-xs font-semibold hover:bg-[#155E75]"
              >
                <PlusCircle className="w-4 h-4" />
                Buat Janji Temu
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {riwayatList.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-7 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status="selesai" />
                        <span className="text-xs text-slate-400 font-mono">#{item.id.slice(0, 8)}</span>
                      </div>
                      <h3 className="font-bold text-slate-800 text-lg mt-1">{item.serviceName}</h3>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1.5 font-medium tabular-nums text-slate-700">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        {item.tanggal}
                      </span>
                      <span className="flex items-center gap-1.5 font-medium tabular-nums text-slate-700">
                        <Clock className="w-4 h-4 text-slate-400" />
                        {item.jam} WITA
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Tindakan yang Dilakukan
                      </span>
                      <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                        {item.tindakan || "-"}
                      </p>
                    </div>

                    <div className="bg-cyan-50/40 p-4 rounded-xl border border-cyan-100 space-y-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#0E7490]">
                        Catatan & Instruksi Dokter
                      </span>
                      <p className="text-sm text-slate-700 leading-relaxed">
                        {item.catatan || "-"}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Stethoscope className="w-3.5 h-3.5 text-slate-400" />
                      Pemeriksa: <strong className="text-slate-700">{item.doctorName}</strong>
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Tersimpan secara rahasia di rekam klinik
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </AppLayout>
    </RouteGuard>
  );
}
