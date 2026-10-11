"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import RouteGuard from "@/components/RouteGuard";
import AppLayout from "@/components/AppLayout";
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
  History,
  Calendar,
  Clock,
  User,
  ArrowLeft,
  FileQuestion,
  Loader2,
  Stethoscope,
} from "lucide-react";

function RiwayatPasienDokterContent() {
  const { id } = useParams();
  const { user, userData } = useAuth();

  const [patientData, setPatientData] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");

  const loadHistory = async () => {
    if (!id || !user) return;
    setLoading(true);
    setNotFound(false);
    setError("");

    try {
      const pSnap = await getDoc(doc(db, "users", id));
      if (!pSnap.exists()) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setPatientData(pSnap.data());

      let q;
      if (userData?.role === "super_admin") {
        q = query(
          collection(db, "catatan_perawatan"),
          where("pasienId", "==", id)
        );
      } else {
        q = query(
          collection(db, "catatan_perawatan"),
          where("pasienId", "==", id),
          where("dokterId", "==", user.uid)
        );
      }

      const snap = await getDocs(q);
      if (snap.empty) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const items = [];
      for (const d of snap.docs) {
        const item = d.data();
        let tanggal = "-";
        let jam = "-";
        let serviceName = "Perawatan";

        if (item.janjiId) {
          try {
            const jSnap = await getDoc(doc(db, "janji_temu", item.janjiId));
            if (jSnap.exists()) {
              tanggal = jSnap.data().tanggal;
              jam = jSnap.data().jam;
              if (jSnap.data().layananId) {
                const lSnap = await getDoc(doc(db, "layanan", jSnap.data().layananId));
                if (lSnap.exists()) serviceName = lSnap.data().nama;
              }
            }
          } catch {}
        }

        items.push({
          id: d.id,
          ...item,
          tanggal,
          jam,
          serviceName,
        });
      }

      items.sort((a, b) => (b.tanggal || "").localeCompare(a.tanggal || ""));
      setRecords(items);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat riwayat pasien.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [id, user, userData]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button
        onClick={() => window.history.back()}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Pemeriksaan
      </button>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-14 text-center text-slate-500 shadow-xs">
          <Loader2 className="w-7 h-7 text-[#0E7490] animate-spin mx-auto mb-2" />
          <p className="text-xs font-medium">Memuat rekam riwayat pasien...</p>
        </div>
      ) : notFound ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
          <FileQuestion className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h2 className="text-base font-bold text-slate-900 mb-1">Riwayat Pasien Tidak Ditemukan</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5 leading-relaxed">
            Data pasien tidak ditemukan atau pasien ini belum pernah Anda tangani dalam riwayat perawatan sebelumnya sesuai batasan otorisasi PRD Bab 4.11.
          </p>
          <Link
            href="/dokter"
            className="px-5 py-2.5 rounded-full bg-[#0E7490] text-white text-xs font-bold shadow-xs hover:bg-[#155E75] transition"
          >
            Kembali ke Dasbor Dokter
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 font-bold text-sm flex items-center justify-center border border-purple-200">
                {(patientData?.nama || "P").charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                    Rekam Medis Terdahulu
                  </span>
                  <span className="text-xs text-slate-400">• Riwayat Penanganan Anda</span>
                </div>
                <h1 className="text-lg font-bold text-slate-900">
                  {patientData?.nama || "Pasien"}
                </h1>
                <p className="text-xs text-slate-500">Total riwayat tindakan medis: {records.length} kunjungan selesai</p>
              </div>
            </div>
            <div className="w-9 h-9 rounded-full bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-200">
              <History className="w-4 h-4" />
            </div>
          </div>

          <div className="space-y-3.5">
            {records.map((rec) => (
              <div
                key={rec.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5.5 space-y-3.5"
              >
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 text-xs">
                  <span className="font-bold text-slate-900 text-xs">{rec.serviceName}</span>
                  <span className="font-semibold text-slate-500 tabular-nums flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {rec.tanggal} ({rec.jam} WITA)
                  </span>
                </div>

                <div className="text-xs space-y-2.5">
                  <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80">
                    <span className="text-slate-500 font-bold uppercase text-[10px] block mb-1">Tindakan Medis yang Telah Diberikan:</span>
                    <p className="font-semibold text-slate-900">{rec.tindakan}</p>
                  </div>
                  <div className="bg-cyan-50/60 p-3.5 rounded-xl border border-cyan-100">
                    <span className="text-[#0E7490] font-bold uppercase text-[10px] block mb-1">Catatan & Anjuran Dokter:</span>
                    <p className="text-slate-800">{rec.catatan}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function RiwayatPasienDokterPage() {
  return (
    <RouteGuard allowedRoles={["dokter"]}>
      <AppLayout>
        <Suspense fallback={
          <div className="p-14 text-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#0E7490]" />
          </div>
        }>
          <RiwayatPasienDokterContent />
        </Suspense>
      </AppLayout>
    </RouteGuard>
  );
}
