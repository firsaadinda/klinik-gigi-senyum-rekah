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
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Kembali ke Pemeriksaan
      </button>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
          <Loader2 className="w-8 h-8 text-[#0E7490] animate-spin mx-auto mb-2" />
          <p className="text-sm">Memuat rekam riwayat pasien...</p>
        </div>
      ) : notFound ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <FileQuestion className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Pasien Tidak Ditemukan</h2>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
            Data pasien tidak ditemukan atau pasien ini belum pernah Anda tangani sebelumnya sesuai otorisasi PRD Bab 4.11.
          </p>
          <Link
            href="/dokter"
            className="px-5 py-2.5 rounded-xl bg-[#0E7490] text-white text-xs font-semibold"
          >
            Kembali ke Dasbor Dokter
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-purple-700 uppercase tracking-wider">Rekam Medis Terdahulu</span>
              <h1 className="text-xl font-bold text-slate-800 mt-0.5">
                {patientData?.nama || "Pasien"}
              </h1>
              <p className="text-xs text-slate-400">Total riwayat tindakan oleh Anda: {records.length} kunjungan</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-4">
            {records.map((rec) => (
              <div
                key={rec.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
                  <span className="font-bold text-slate-800 text-sm">{rec.serviceName}</span>
                  <span className="font-semibold text-slate-600 tabular-nums">
                    {rec.tanggal} ({rec.jam} WITA)
                  </span>
                </div>

                <div className="text-xs space-y-2">
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[10px] block">Tindakan Medis:</span>
                    <p className="font-semibold text-slate-800 mt-0.5">{rec.tindakan}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[10px] block">Catatan Dokter:</span>
                    <p className="text-slate-600 mt-0.5">{rec.catatan}</p>
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
          <div className="p-12 text-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#0E7490]" />
          </div>
        }>
          <RiwayatPasienDokterContent />
        </Suspense>
      </AppLayout>
    </RouteGuard>
  );
}
