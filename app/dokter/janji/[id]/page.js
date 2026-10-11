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
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import {
  Stethoscope,
  Calendar,
  Clock,
  User,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileText,
  History,
  AlertTriangle,
} from "lucide-react";

function PemeriksaanDokterContent() {
  const { id } = useParams();
  const { user, userData } = useAuth();
  const router = useRouter();

  const [janji, setJanji] = useState(null);
  const [patientData, setPatientData] = useState(null);
  const [serviceData, setServiceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [tindakan, setTindakan] = useState("");
  const [catatan, setCatatan] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const loadJanji = async () => {
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

      // PRD 4.10: Validasi hanya janji milik dokter itu yang bisa dibuka!
      if (userData?.role !== "super_admin" && data.dokterId !== user.uid) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setJanji({ id: snap.id, ...data });

      if (data.pasienId) {
        try {
          const pSnap = await getDoc(doc(db, "users", data.pasienId));
          if (pSnap.exists()) setPatientData(pSnap.data());
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
      setError("Gagal memuat janji pemeriksaan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJanji();
  }, [id, user, userData]);

  const handleSubmitPemeriksaan = async (e) => {
    e.preventDefault();
    setError("");

    if (!tindakan.trim()) {
      setError("Tindakan medis wajib diisi.");
      return;
    }
    if (!catatan.trim()) {
      setError("Catatan dokter wajib diisi.");
      return;
    }

    if (janji.status !== "hadir") {
      setError(`Hanya janji berstatus Hadir yang dapat diperiksa (status saat ini: ${janji.status}).`);
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, "catatan_perawatan"), {
        janjiId: janji.id,
        pasienId: janji.pasienId,
        dokterId: janji.dokterId,
        tindakan: tindakan.trim(),
        catatan: catatan.trim(),
        dibuatPada: serverTimestamp(),
      });

      await updateDoc(doc(db, "janji_temu", janji.id), {
        status: "selesai",
      });

      setSuccess(true);
      setTimeout(() => {
        router.push("/dokter");
      }, 2000);
    } catch (err) {
      console.error(err);
      setError("Gagal menyimpan rekam medis. Silakan coba lagi.");
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        href="/dokter"
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Dasbor Dokter
      </Link>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-14 text-center text-slate-500 shadow-xs">
          <Loader2 className="w-7 h-7 text-[#0E7490] animate-spin mx-auto mb-2" />
          <p className="text-xs font-medium">Memuat formulir pemeriksaan...</p>
        </div>
      ) : notFound ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-3 border border-amber-200">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-slate-900 mb-1">Janji Pemeriksaan Tidak Ditemukan</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5 leading-relaxed">
            Janji ini bukan jadwal yang dialokasikan untuk Anda atau nomor registrasi tidak valid sesuai aturan otorisasi PRD Bab 4.10.
          </p>
          <Link
            href="/dokter"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#0E7490] text-white text-xs font-bold hover:bg-[#155E75] shadow-xs transition"
          >
            Kembali ke Dasbor Dokter
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-6 sm:p-7 bg-slate-50/80 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center border border-purple-200/80">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 block">
                  Formulir Rekam Tindakan Medis
                </span>
                <h1 className="text-lg font-bold text-slate-900 mt-0.5">
                  {patientData?.nama || "Pasien"}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <StatusBadge status={janji.status} />
              {janji.pasienId && (
                <Link
                  href={`/dokter/pasien/${janji.pasienId}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200/80 text-slate-700 text-xs font-bold hover:bg-slate-50 transition shadow-2xs"
                  title="Lihat rekam medis terdahulu pasien ini"
                >
                  <History className="w-3.5 h-3.5 text-slate-400" />
                  Riwayat Pasien
                </Link>
              )}
            </div>
          </div>

          <div className="p-6 sm:p-7 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200/80">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Layanan yang Dimohon
                </span>
                <strong className="text-slate-900 text-xs block">{serviceData?.nama || "Pemeriksaan Gigi"}</strong>
              </div>

              <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200/80">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Jadwal Praktik
                </span>
                <strong className="text-slate-900 text-xs tabular-nums block">
                  {janji.tanggal} pukul {janji.jam} WITA
                </strong>
              </div>
            </div>

            <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200/80">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Keluhan Pasien Saat Reservasi
              </span>
              <p className="text-xs text-slate-700 italic">
                &ldquo;{janji.keluhan || "Tidak ada catatan keluhan khusus."}&rdquo;
              </p>
            </div>

            {success && (
              <div className="p-4 bg-emerald-50/80 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Pemeriksaan berhasil diselesaikan. Rekam medis telah tercatat permanen di data klinik. Mengalihkan...
                </span>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50/80 border border-red-200 text-red-700 rounded-2xl text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {janji.status !== "hadir" && !success ? (
              <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl text-xs text-amber-800 leading-relaxed">
                Status saat ini: <strong className="uppercase">{janji.status}</strong>. Pengisian catatan tindakan hanya dapat diproses bila status pasien telah diverifikasi <strong>HADIR</strong> oleh resepsionis meja depan (PRD Bab 4.10).
              </div>
            ) : (
              <form onSubmit={handleSubmitPemeriksaan} className="space-y-4 pt-1">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Tindakan Medis yang Dilakukan <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={tindakan}
                    onChange={(e) => setTindakan(e.target.value)}
                    placeholder="Contoh: Pembersihan karang gigi (scaling) rahang atas dan bawah, aplikasi fluorida..."
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Catatan & Instruksi Perawatan Pasca-Tindakan <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                    placeholder="Contoh: Hindari makanan terlalu keras/dingin 24 jam ke depan, kontrol berkala dalam 6 bulan..."
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                  <Link
                    href="/dokter"
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-full border border-slate-200 transition"
                  >
                    Batal
                  </Link>
                  <button
                    type="submit"
                    disabled={submitting || success}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-purple-700 text-white text-xs font-bold hover:bg-purple-800 disabled:opacity-50 transition shadow-xs"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Menyimpan Rekam Medis...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Tandai Selesai & Simpan Rekam Medis
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function PemeriksaanDokterPage() {
  return (
    <RouteGuard allowedRoles={["dokter"]}>
      <AppLayout>
        <Suspense fallback={
          <div className="p-14 text-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#0E7490]" />
          </div>
        }>
          <PemeriksaanDokterContent />
        </Suspense>
      </AppLayout>
    </RouteGuard>
  );
}
