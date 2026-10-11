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
      // Bila ID diganti dengan janji dokter lain, tampil "Janji tidak ditemukan"
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
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Kembali ke Dasbor Dokter
      </Link>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
          <Loader2 className="w-8 h-8 text-[#0E7490] animate-spin mx-auto mb-2" />
          <p className="text-sm">Memuat data pemeriksaan...</p>
        </div>
      ) : notFound ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Janji Tidak Ditemukan</h2>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
            Janji ini bukan jadwal milik Anda atau ID janji tidak valid sesuai otorisasi PRD Bab 4.10.
          </p>
          <Link
            href="/dokter"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0E7490] text-white text-xs font-semibold"
          >
            Kembali ke Dasbor Dokter
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-6 bg-purple-50/60 border-b border-purple-100 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-purple-700 uppercase tracking-wider">Formulir Pemeriksaan Medis</span>
                <h1 className="text-xl font-bold text-slate-800">
                  {patientData?.nama || "Pasien"}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <StatusBadge status={janji.status} />
              {janji.pasienId && (
                <Link
                  href={`/dokter/pasien/${janji.pasienId}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-purple-200 text-purple-700 text-xs font-semibold hover:bg-purple-50 transition shadow-sm"
                  title="Lihat rekam medis terdahulu pasien ini"
                >
                  <History className="w-3.5 h-3.5" />
                  Riwayat Pasien
                </Link>
              )}
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Layanan yang Diminta
                </span>
                <strong className="text-slate-800 text-sm">{serviceData?.nama || "Pemeriksaan Gigi"}</strong>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Jadwal Pemeriksaan
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
                &ldquo;{janji.keluhan || "Tidak ada catatan keluhan khusus."}&rdquo;
              </p>
            </div>

            {success && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>
                  Pemeriksaan berhasil diselesaikan! Catatan perawatan tersimpan dan pasien dapat membacanya di Riwayat Perawatan. Mengalihkan...
                </span>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {janji.status !== "hadir" && !success ? (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                ⚠️ Janji ini berstatus <strong className="uppercase">{janji.status}</strong>. Pengisian pemeriksaan hanya dapat dilakukan saat pasien sudah ditandai <strong>HADIR</strong> oleh resepsionis meja depan (PRD 4.10).
              </div>
            ) : (
              <form onSubmit={handleSubmitPemeriksaan} className="space-y-5 pt-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Tindakan Medis yang Dilakukan <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={tindakan}
                    onChange={(e) => setTindakan(e.target.value)}
                    placeholder="Contoh: Tambal gigi geraham bawah dengan bahan komposit nanofill..."
                    className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Catatan & Instruksi Perawatan Dokter <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                    placeholder="Contoh: Hindari makanan dan minuman keras atau terlalu dingin selama 24 jam pertama..."
                    className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <Link
                    href="/dokter"
                    className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Batal
                  </Link>
                  <button
                    type="submit"
                    disabled={submitting || success}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 shadow-sm disabled:opacity-50 transition"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Menyimpan Rekam Medis...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Tandai Selesai & Simpan Catatan
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
          <div className="p-12 text-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#0E7490]" />
          </div>
        }>
          <PemeriksaanDokterContent />
        </Suspense>
      </AppLayout>
    </RouteGuard>
  );
}
