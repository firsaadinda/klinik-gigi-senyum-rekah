"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import RouteGuard from "@/components/RouteGuard";
import AppLayout from "@/components/AppLayout";
import StatusBadge from "@/components/StatusBadge";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import {
  Calendar,
  Clock,
  User,
  Sparkles,
  ArrowLeft,
  AlertTriangle,
  XCircle,
  Loader2,
  CheckCircle2,
  FileText,
} from "lucide-react";

function RincianJanjiPasienContent() {
  const { id } = useParams();
  const { user, userData } = useAuth();
  const router = useRouter();

  const [janji, setJanji] = useState(null);
  const [doctorName, setDoctorName] = useState("");
  const [serviceData, setServiceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [error, setError] = useState("");

  const loadDetail = async () => {
    if (!id || !user) return;
    setLoading(true);
    setNotFound(false);
    setError("");

    try {
      const snap = await getDoc(doc(db, "janji_temu", id));
      if (!snap.exists()) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const data = snap.data();

      // PRD 4.3.2: Bila ID di alamat diganti dengan janji orang lain, tampil "Janji tidak ditemukan"
      // Kecuali super_admin yang berhak melihat semua
      if (userData?.role !== "super_admin" && data.pasienId !== user.uid) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setJanji({ id: snap.id, ...data });

      // Ambil nama dokter
      if (data.dokterId) {
        try {
          const docSnap = await getDoc(doc(db, "users", data.dokterId));
          if (docSnap.exists()) setDoctorName(docSnap.data().nama);
        } catch {}
      }

      // Ambil data layanan
      if (data.layananId) {
        try {
          const laySnap = await getDoc(doc(db, "layanan", data.layananId));
          if (laySnap.exists()) setServiceData(laySnap.data());
        } catch {}
      }
    } catch (err) {
      console.error(err);
      setError("Gagal memuat rincian janji temu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
  }, [id, user, userData]);

  const [todayStr, setTodayStr] = useState("");

  useEffect(() => {
    setTodayStr(new Date().toISOString().split("T")[0]);
  }, []);

  const canCancel = (() => {
    if (!janji || !todayStr) return false;
    if (!["menunggu", "dikonfirmasi"].includes(janji.status)) return false;

    return janji.tanggal > todayStr;
  })();

  const handleCancelAppointment = async () => {
    if (!janji) return;
    setCancelling(true);
    setError("");

    try {
      await updateDoc(doc(db, "janji_temu", janji.id), {
        status: "dibatalkan",
        alasanBatal: "Dibatalkan oleh pasien",
      });

      try {
        await deleteDoc(doc(db, "slot_terisi", janji.id));
      } catch (slotErr) {
        console.warn("Slot mungkin sudah tidak ada:", slotErr);
      }

      setShowCancelModal(false);
      await loadDetail();
    } catch (err) {
      console.error(err);
      setError("Gagal membatalkan janji temu. Silakan coba lagi.");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        href="/janji"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Kembali ke Daftar Janji
      </Link>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
          <Loader2 className="w-8 h-8 text-[#0E7490] animate-spin mx-auto mb-2" />
          <p className="text-sm">Memuat rincian janji...</p>
        </div>
      ) : notFound ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Janji Tidak Ditemukan</h2>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
            Data janji temu tidak ditemukan atau Anda tidak memiliki hak akses untuk membukanya.
          </p>
          <Link
            href="/janji"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0E7490] text-white text-xs font-semibold hover:bg-[#155E75]"
          >
            Kembali ke Janji Saya
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-6 bg-slate-50 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs text-slate-400 font-mono">Kode Janji: #{janji.id}</span>
              <h1 className="text-xl font-bold text-slate-800 mt-1">
                {serviceData?.nama || "Pemeriksaan Gigi"}
              </h1>
            </div>
            <StatusBadge status={janji.status} />
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {janji.status === "dibatalkan" && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs">
                <p className="font-bold flex items-center gap-1.5 mb-1">
                  <XCircle className="w-4 h-4 text-red-600" />
                  Janji Temu Ini Dibatalkan
                </p>
                <p>
                  Alasan: <span className="font-medium">{janji.alasanBatal || "Dibatalkan oleh pengguna"}</span>
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Dokter Pemeriksa
                </span>
                <p className="font-semibold text-slate-800 text-sm">{doctorName || "drg. Dokter Gigi"}</p>
                <p className="text-xs text-slate-400 mt-0.5">Klinik Gigi Senyum Rekah</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Jadwal Waktu
                </span>
                <p className="font-semibold text-slate-800 text-sm tabular-nums">
                  {janji.tanggal}
                </p>
                <p className="text-xs text-slate-500 tabular-nums mt-0.5">
                  Pukul {janji.jam} WITA
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Estimasi Biaya & Durasi
                </span>
                <p className="font-semibold text-slate-800 text-sm tabular-nums">
                  Rp {Number(serviceData?.harga || 0).toLocaleString("id-ID")}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Durasi tindakan: {serviceData?.durasiMenit || 30} menit
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Keluhan yang Dialami
                </span>
                <p className="text-xs text-slate-700 italic">
                  &ldquo;{janji.keluhan || "Tidak ada catatan keluhan khusus."}&rdquo;
                </p>
              </div>
            </div>

            <div className="bg-cyan-50/50 border border-cyan-100 rounded-xl p-4 text-xs text-slate-600 space-y-1">
              <p className="font-semibold text-[#0E7490]">Petunjuk Kunjungan:</p>
              <p>• Harap tiba 15 menit sebelum waktu janji untuk konfirmasi kehadiran di meja resepsionis.</p>
              <p>• Pembatalan mandiri hanya dapat dilakukan paling lambat H-1 sebelum tanggal janji temu.</p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <Link
                href="/janji"
                className="text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                ← Kembali
              </Link>

              {canCancel && (
                <button
                  type="button"
                  onClick={() => setShowCancelModal(true)}
                  className="px-4 py-2 rounded-xl bg-red-50 text-red-600 border border-red-200 text-xs font-semibold hover:bg-red-100 transition"
                >
                  Batalkan Janji Temu
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-bold text-slate-800">Konfirmasi Pembatalan</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Apakah Anda yakin ingin membatalkan janji temu pada tanggal{" "}
              <span className="font-semibold">{janji?.tanggal}</span> pukul{" "}
              <span className="font-semibold">{janji?.jam}</span>? Slot waktu yang sudah dipesan akan dilepas kembali.
            </p>

            {error && <p className="text-xs text-red-600">{error}</p>}

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Kembali
              </button>
              <button
                type="button"
                disabled={cancelling}
                onClick={handleCancelAppointment}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition flex items-center gap-1.5"
              >
                {cancelling ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Membatalkan...
                  </>
                ) : (
                  "Ya, Batalkan Janji"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RincianJanjiPasienPage() {
  return (
    <RouteGuard allowedRoles={["pasien"]}>
      <AppLayout>
        <Suspense fallback={
          <div className="p-12 text-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#0E7490]" />
          </div>
        }>
          <RincianJanjiPasienContent />
        </Suspense>
      </AppLayout>
    </RouteGuard>
  );
}
