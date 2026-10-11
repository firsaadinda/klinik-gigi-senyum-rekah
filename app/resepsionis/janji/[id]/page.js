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
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Kembali ke Kelola Janji
      </Link>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
          <Loader2 className="w-8 h-8 text-[#0E7490] animate-spin mx-auto mb-2" />
          <p className="text-sm">Memuat data rincian...</p>
        </div>
      ) : notFound ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <FileQuestion className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-800">Janji Tidak Ditemukan</h2>
          <p className="text-xs text-slate-500 mt-1 mb-5">
            Dokumen janji temu dengan kode ini tidak tersedia di database klinik.
          </p>
          <Link
            href="/resepsionis/janji"
            className="px-4 py-2 bg-[#0E7490] text-white rounded-xl text-xs font-semibold"
          >
            Kembali ke Daftar Janji
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-6 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between">
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
                  Status Janji Dibatalkan
                </p>
                <p>Alasan: <span className="font-medium">{janji.alasanBatal || "Tidak ada alasan spesifik."}</span></p>
              </div>
            )}

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Informasi Kontak Pasien (PRD 4.8)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Nama Lengkap:</span>
                  <strong className="text-slate-800 text-sm">{patientData?.nama || "Pasien"}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Nomor WhatsApp:</span>
                  <strong className="text-slate-800 tabular-nums">{patientData?.noHp || "-"}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Email:</span>
                  <span className="text-slate-700">{patientData?.email || "-"}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Dokter yang Bertugas
                </span>
                <strong className="text-slate-800 text-sm">{doctorName || "drg. Dokter Gigi"}</strong>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Waktu Janji Temu
                </span>
                <strong className="text-slate-800 text-sm tabular-nums">
                  {janji.tanggal} pukul {janji.jam} WITA
                </strong>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Keluhan Pasien
              </span>
              <p className="text-xs text-slate-700 italic">
                &ldquo;{janji.keluhan || "Tidak ada catatan keluhan."}&rdquo;
              </p>
            </div>

            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-[11px] text-amber-800">
              🔒 <strong>Privasi Medis:</strong> Sesuai PRD Bab 2.4 dan 4.8, resepsionis tidak memiliki akses untuk melihat catatan perawatan maupun tindakan medis dokter.
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <Link
                href="/resepsionis/janji"
                className="text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                ← Kembali ke Tabel
              </Link>

              <div className="flex items-center gap-2">
                {janji.status === "menunggu" && (
                  <button
                    onClick={handleConfirm}
                    disabled={actionLoading}
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 shadow-sm transition"
                  >
                    Konfirmasi Janji
                  </button>
                )}

                {janji.status === "dikonfirmasi" && janji.tanggal === todayStr && (
                  <button
                    onClick={handleMarkPresent}
                    disabled={actionLoading}
                    className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 shadow-sm transition"
                  >
                    Tandai Pasien Hadir
                  </button>
                )}

                {["menunggu", "dikonfirmasi"].includes(janji.status) && (
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="px-4 py-2 rounded-xl bg-red-50 text-red-600 border border-red-200 text-xs font-semibold hover:bg-red-100 transition"
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
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 text-red-600">
              <XCircle className="w-5 h-5" />
              Batalkan Janji Temu
            </h3>
            <form onSubmit={handleCancelSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alasan Pembatalan <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={alasanBatal}
                  onChange={(e) => setAlasanBatal(e.target.value)}
                  placeholder="Tuliskan alasan pembatalan..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || !alasanBatal.trim()}
                  className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl"
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
          <div className="p-12 text-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#0E7490]" />
          </div>
        }>
          <RincianJanjiResepsionisContent />
        </Suspense>
      </AppLayout>
    </RouteGuard>
  );
}
