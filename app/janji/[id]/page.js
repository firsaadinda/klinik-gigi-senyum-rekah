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
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-500">
          <Loader2 className="w-7 h-7 text-[#0E7490] animate-spin mx-auto mb-2" />
          <p className="text-xs">Memuat rincian janji...</p>
        </div>
      ) : notFound ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-10 text-center">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-amber-200">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-slate-900 mb-1">Janji Tidak Ditemukan</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5 leading-relaxed">
            Data janji temu tidak ditemukan atau Anda tidak memiliki hak akses untuk membuka permohonan ini.
          </p>
          <Link
            href="/janji"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0E7490] text-white text-xs font-semibold hover:bg-[#155E75] shadow-xs"
          >
            Kembali ke Janji Saya
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {/* Slip Header */}
          <div className="p-6 bg-gradient-to-r from-slate-50/90 to-cyan-50/30 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider font-semibold">
                  No. Registrasi: #{janji.id}
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900">
                {serviceData?.nama || "Pemeriksaan Gigi"}
              </h1>
            </div>
            <StatusBadge status={janji.status} />
          </div>

          <div className="p-6 sm:p-7 space-y-6">
            {janji.status === "dibatalkan" && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs">
                <p className="font-bold flex items-center gap-1.5 mb-0.5">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  Janji Temu Ini Telah Dibatalkan
                </p>
                <p>
                  Keterangan: <span className="font-medium">{janji.alasanBatal || "Dibatalkan oleh pengguna"}</span>
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/70">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Dokter Pemeriksa
                </span>
                <p className="font-bold text-slate-900 text-xs">{doctorName || "drg. Dokter Gigi"}</p>
                <p className="text-[11px] text-slate-500 mt-0.5 font-medium">Klinik Gigi Senyum Rekah</p>
              </div>

              <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/70">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Jadwal Reservasi
                </span>
                <p className="font-bold text-slate-900 text-xs tabular-nums">
                  {janji.tanggal}
                </p>
                <p className="text-[11px] text-[#0E7490] font-semibold tabular-nums mt-0.5">
                  Pukul {janji.jam} WITA
                </p>
              </div>

              <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/70">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Tarif Layanan & Durasi
                </span>
                <p className="font-bold text-slate-900 text-xs tabular-nums">
                  Rp {Number(serviceData?.harga || 0).toLocaleString("id-ID")}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                  Estimasi durasi: {serviceData?.durasiMenit || 30} menit
                </p>
              </div>

              <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/70">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Uraian Keluhan
                </span>
                <p className="text-xs text-slate-700 italic">
                  &ldquo;{janji.keluhan || "Tidak ada catatan keluhan khusus."}&rdquo;
                </p>
              </div>
            </div>

            <div className="bg-cyan-50/80 border border-cyan-200 rounded-xl p-4 text-xs text-slate-700 space-y-1">
              <p className="font-bold text-[#0E7490]">Ketentuan Layanan Rawat Jalan:</p>
              <p>• Mohon hadir 15 menit sebelum jadwal reservasi untuk proses verifikasi di meja resepsionis.</p>
              <p>• Pembatalan mandiri dapat diproses paling lambat H-1 sebelum tanggal janji temu.</p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <Link
                href="/janji"
                className="text-xs font-semibold text-[#0E7490] hover:underline"
              >
                ← Kembali ke Daftar Janji
              </Link>

              {canCancel && (
                <button
                  type="button"
                  onClick={() => setShowCancelModal(true)}
                  className="px-4 py-2 rounded-xl bg-white text-rose-600 border border-rose-200 text-xs font-semibold hover:bg-rose-50 transition shadow-xs"
                >
                  Batalkan Janji Temu
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-2.5 text-rose-600">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="text-sm font-bold text-slate-900">Konfirmasi Pembatalan Janji</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Apakah Anda yakin ingin membatalkan jadwal janji temu pada tanggal{" "}
              <span className="font-bold text-slate-900">{janji?.tanggal}</span> pukul{" "}
              <span className="font-bold text-slate-900">{janji?.jam} WITA</span>? Slot waktu dokter akan dilepas kembali ke publik.
            </p>

            {error && <p className="text-xs text-rose-600">{error}</p>}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200"
              >
                Kembali
              </button>
              <button
                type="button"
                disabled={cancelling}
                onClick={handleCancelAppointment}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition flex items-center gap-1.5 shadow-xs"
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
