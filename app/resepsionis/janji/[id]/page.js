"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
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
  Phone,
  Mail,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock3,
  AlertCircle,
  Loader2,
  Stethoscope,
  FileQuestion,
  ShieldCheck,
} from "lucide-react";

function RincianJanjiResepsionisContent() {
  const { id } = useParams();
  const router = useRouter();

  const [janji, setJanji] = useState(null);
  const [patientData, setPatientData] = useState(null);
  const [doctorName, setDoctorName] = useState("");
  const [serviceData, setServiceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [alasanBatal, setAlasanBatal] = useState("");

  const loadDetail = async () => {
    if (!id) return;
    setLoading(true);
    setError("");

    try {
      const snap = await getDoc(doc(db, "janji_temu", id));
      if (!snap.exists()) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const data = snap.data();
      setJanji({ id: snap.id, ...data });

      if (data.pasienId) {
        try {
          const pSnap = await getDoc(doc(db, "users", data.pasienId));
          if (pSnap.exists()) setPatientData(pSnap.data());
        } catch {}
      }

      if (data.dokterId) {
        try {
          const docSnap = await getDoc(doc(db, "users", data.dokterId));
          if (docSnap.exists()) setDoctorName(docSnap.data().nama);
        } catch {}
      }

      if (data.layananId) {
        try {
          const lSnap = await getDoc(doc(db, "layanan", data.layananId));
          if (lSnap.exists()) setServiceData(lSnap.data());
        } catch {}
      }
    } catch (err) {
      console.error(err);
      setError("Gagal memuat rincian janji.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
  }, [id]);

  const [todayStr, setTodayStr] = useState("");

  useEffect(() => {
    setTodayStr(new Date().toISOString().split("T")[0]);
  }, []);

  const handleConfirm = async () => {
    if (!janji) return;
    setActionLoading(true);
    try {
      await updateDoc(doc(db, "janji_temu", janji.id), {
        status: "dikonfirmasi",
      });
      await loadDetail();
    } catch (err) {
      console.error(err);
      alert("Gagal mengonfirmasi janji.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkPresent = async () => {
    if (!janji) return;
    if (janji.tanggal !== todayStr) {
      alert(`Tandai Hadir hanya dapat dilakukan pada hari H janji temu (${janji.tanggal}).`);
      return;
    }
    setActionLoading(true);
    try {
      await updateDoc(doc(db, "janji_temu", janji.id), {
        status: "hadir",
      });
      await loadDetail();
    } catch (err) {
      console.error(err);
      alert("Gagal menandai hadir.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    if (!janji || !alasanBatal.trim()) return;
    setActionLoading(true);
    try {
      await updateDoc(doc(db, "janji_temu", janji.id), {
        status: "dibatalkan",
        alasanBatal: alasanBatal.trim(),
      });
      try {
        await deleteDoc(doc(db, "slot_terisi", janji.id));
      } catch (err) {}

      setShowCancelModal(false);
      await loadDetail();
    } catch (err) {
      console.error(err);
      alert("Gagal membatalkan janji.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        href="/resepsionis/janji"
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Kelola Janji
      </Link>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-14 text-center text-slate-500 shadow-xs">
          <Loader2 className="w-7 h-7 text-[#0E7490] animate-spin mx-auto mb-2" />
          <p className="text-xs font-medium">Memuat data rincian janji...</p>
        </div>
      ) : notFound ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
          <FileQuestion className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h2 className="text-base font-bold text-slate-900">Janji Tidak Ditemukan</h2>
          <p className="text-xs text-slate-500 mt-1 mb-5">
            Dokumen reservasi janji temu dengan kode ini tidak tercatat di pangkalan data klinik.
          </p>
          <Link
            href="/resepsionis/janji"
            className="px-5 py-2.5 bg-[#0E7490] text-white rounded-full text-xs font-bold shadow-xs hover:bg-[#155E75] transition"
          >
            Kembali ke Daftar Janji
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {/* Header Card Voucher Style */}
          <div className="p-6 sm:p-7 bg-gradient-to-r from-cyan-900 to-[#0E7490] text-white flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-200 block">
                Kode Janji: #{janji.id}
              </span>
              <h1 className="text-xl font-bold mt-1 tracking-tight">
                {serviceData?.nama || "Pemeriksaan Gigi"}
              </h1>
            </div>
            <StatusBadge status={janji.status} />
          </div>

          <div className="p-6 sm:p-7 space-y-5">
            {janji.status === "dibatalkan" && (
              <div className="p-4 bg-red-50/80 border border-red-200/80 rounded-2xl text-red-800 text-xs">
                <p className="font-bold flex items-center gap-1.5 mb-1 text-red-700">
                  <XCircle className="w-4 h-4" />
                  Status Janji Telah Dibatalkan
                </p>
                <p>Keterangan Alasan: <span className="font-semibold text-red-900">{janji.alasanBatal || "Tidak ada alasan spesifik."}</span></p>
              </div>
            )}

            {/* Kontak Pasien (PRD 4.8) */}
            <div className="p-4.5 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Informasi Kontak Pasien (PRD 4.8)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Nama Pasien:</span>
                  <strong className="text-slate-900 text-xs block mt-0.5">{patientData?.nama || "Pasien"}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Nomor WhatsApp:</span>
                  <strong className="text-slate-900 tabular-nums text-xs block mt-0.5">{patientData?.noHp || "-"}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Email:</span>
                  <span className="text-slate-700 text-xs block mt-0.5">{patientData?.email || "-"}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200/80">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Dokter Pemeriksa Bertugas
                </span>
                <strong className="text-slate-900 text-xs block">{doctorName || "drg. Dokter Gigi"}</strong>
              </div>

              <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200/80">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Waktu Reservasi Praktik
                </span>
                <strong className="text-slate-900 text-xs tabular-nums block">
                  {janji.tanggal} pukul {janji.jam} WITA
                </strong>
              </div>
            </div>

            <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200/80">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Uraian Keluhan Pasien
              </span>
              <p className="text-xs text-slate-700 italic">
                &ldquo;{janji.keluhan || "Tidak ada catatan keluhan khusus."}&rdquo;
              </p>
            </div>

            <div className="p-3.5 bg-cyan-50/70 border border-cyan-100 rounded-2xl text-[11px] text-slate-700 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#0E7490] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#0E7490]">Protokol Privasi Rekam Medis:</span> Sesuai ketentuan PRD Bab 2.4 & 4.8, modul resepsionis dibatasi pada koordinasi kedatangan & kontak. Tindakan serta catatan rekam medis dokter dirahasiakan dan dikunci oleh sistem.
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <Link
                href="/resepsionis/janji"
                className="text-xs font-bold text-slate-500 hover:text-slate-800"
              >
                ← Kembali ke Antrean
              </Link>

              <div className="flex items-center gap-2">
                {janji.status === "menunggu" && (
                  <button
                    onClick={handleConfirm}
                    disabled={actionLoading}
                    className="px-4 py-2 rounded-full bg-[#0E7490] text-white text-xs font-bold hover:bg-[#155E75] shadow-xs transition"
                  >
                    Konfirmasi Janji
                  </button>
                )}

                {janji.status === "dikonfirmasi" && janji.tanggal === todayStr && (
                  <button
                    onClick={handleMarkPresent}
                    disabled={actionLoading}
                    className="px-4 py-2 rounded-full bg-purple-700 text-white text-xs font-bold hover:bg-purple-800 shadow-xs transition"
                  >
                    Tandai Pasien Hadir
                  </button>
                )}

                {["menunggu", "dikonfirmasi"].includes(janji.status) && (
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="px-4 py-2 rounded-full bg-white text-red-600 border border-red-200 text-xs font-bold hover:bg-red-50 transition"
                  >
                    Batalkan Janji
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200/80 space-y-4">
            <h3 className="text-base font-bold text-red-600 flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              Batalkan Janji Temu
            </h3>
            <form onSubmit={handleCancelSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Alasan Pembatalan <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={alasanBatal}
                  onChange={(e) => setAlasanBatal(e.target.value)}
                  placeholder="Tuliskan alasan pembatalan..."
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-full border border-slate-200 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || !alasanBatal.trim()}
                  className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-full shadow-xs transition"
                >
                  {actionLoading ? "Menyimpan..." : "Simpan Pembatalan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RincianJanjiResepsionisPage() {
  return (
    <RouteGuard allowedRoles={["resepsionis"]}>
      <AppLayout>
        <Suspense fallback={
          <div className="p-14 text-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#0E7490]" />
          </div>
        }>
          <RincianJanjiResepsionisContent />
        </Suspense>
      </AppLayout>
    </RouteGuard>
  );
}
