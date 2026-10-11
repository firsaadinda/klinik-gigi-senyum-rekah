"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import RouteGuard from "@/components/RouteGuard";
import AppLayout from "@/components/AppLayout";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import {
  Users,
  Shield,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  AlertTriangle,
  UserCheck,
  UserX,
  Save,
} from "lucide-react";

function EditPenggunaContent() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();

  const [targetUser, setTargetUser] = useState(null);
  const [role, setRole] = useState("pasien");
  const [aktif, setAktif] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const isSelf = id === user?.uid;

  const loadUser = async () => {
    if (!id) return;
    setLoading(true);
    setErrorMsg("");

    try {
      const snap = await getDoc(doc(db, "users", id));
      if (!snap.exists()) {
        setErrorMsg("Pengguna tidak ditemukan di database.");
        setLoading(false);
        return;
      }

      const data = snap.data();
      setTargetUser({ id: snap.id, ...data });
      setRole(data.role || "pasien");
      setAktif(data.aktif !== false);
    } catch (err) {
      console.error(err);
      setErrorMsg("Gagal memuat data pengguna.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, [id]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    if (isSelf) {
      if (role !== "super_admin") {
        setErrorMsg("Anda tidak dapat menurunkan peran Super Admin untuk akun Anda sendiri!");
        return;
      }
      if (!aktif) {
        setErrorMsg("Anda tidak dapat menonaktifkan akun Anda sendiri!");
        return;
      }
    }

    const validRoles = ["pasien", "resepsionis", "dokter", "super_admin"];
    if (!validRoles.includes(role)) {
      setErrorMsg("Nilai peran tidak valid.");
      return;
    }

    setSaving(true);
    try {
      await updateDoc(doc(db, "users", id), {
        role: role,
        aktif: aktif,
      });

      setSuccessMsg(`Peran pengguna berhasil diubah menjadi "${role}" dan status diperbarui!`);
      await loadUser();
    } catch (err) {
      console.error(err);
      setErrorMsg("Gagal menyimpan perubahan pengguna.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <Link
        href="/admin/pengguna"
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Daftar Pengguna
      </Link>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-14 text-center text-slate-500 shadow-xs">
          <Loader2 className="w-8 h-8 text-[#0E7490] animate-spin mx-auto mb-2" />
          <p className="text-sm font-medium">Memuat profil pengguna...</p>
        </div>
      ) : !targetUser ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-10 text-center text-red-600 text-xs shadow-xs">
          {errorMsg || "Pengguna tidak ditemukan."}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-7 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Ubah Peran & Status Pengguna</h1>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">UID: {targetUser.id}</p>
            </div>
            {isSelf && (
              <span className="px-3 py-1 bg-amber-50 border border-amber-300 text-amber-800 text-[11px] font-bold rounded-full">
                Akun Anda Sendiri
              </span>
            )}
          </div>

          {successMsg && (
            <div className="p-4 bg-emerald-50/80 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 bg-red-50/80 border border-red-200 text-red-800 text-xs rounded-2xl flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="p-4.5 bg-slate-50/70 rounded-2xl border border-slate-200/80 text-xs space-y-2.5">
            <div>
              <span className="text-slate-500 block text-[11px] font-medium">Nama Pengguna:</span>
              <strong className="text-slate-900 text-sm block mt-0.5">{targetUser.nama || "Tanpa Nama"}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px] font-medium">Alamat Email:</span>
              <span className="text-slate-700 block mt-0.5">{targetUser.email}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px] font-medium">Nomor Handphone:</span>
              <span className="text-slate-700 tabular-nums block mt-0.5">{targetUser.noHp || "-"}</span>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5">
                Tetapkan Peran Sistem (Role) <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { val: "pasien", label: "Pasien", desc: "Pelanggan / peran awal" },
                  { val: "resepsionis", label: "Resepsionis", desc: "Staf meja depan" },
                  { val: "dokter", label: "Dokter", desc: "Tenaga ahli pemeriksa" },
                  { val: "super_admin", label: "Super Admin", desc: "Pemilik klinik (semua hak)" },
                ].map((opt) => (
                  <label
                    key={opt.val}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                      role === opt.val
                        ? "bg-cyan-50/50 border-[#0E7490] ring-1 ring-[#0E7490] shadow-xs"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">{opt.label}</span>
                      <input
                        type="radio"
                        name="roleSelection"
                        value={opt.val}
                        checked={role === opt.val}
                        onChange={(e) => setRole(e.target.value)}
                        disabled={isSelf && opt.val !== "super_admin"}
                        className="text-[#0E7490]"
                      />
                    </div>
                    <span className="text-[11px] text-slate-500 mt-1.5">{opt.desc}</span>
                  </label>
                ))}
              </div>
              {isSelf && (
                <div className="mt-2.5 flex items-start gap-1.5 text-[11px] text-amber-700">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
                  <span>Sesuai PRD 4.13, pemilik klinik tidak dapat menurunkan perannya sendiri.</span>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-2.5">
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Status Keaktifan Akun
              </span>
              <div className="flex items-center gap-4">
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="radio"
                    name="statusActive"
                    checked={aktif === true}
                    onChange={() => setAktif(true)}
                    className="text-[#0E7490]"
                  />
                  <span>Aktif (Dapat Mengakses Portal)</span>
                </label>

                <label className={`inline-flex items-center gap-2 text-xs font-semibold text-red-600 ${isSelf ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}>
                  <input
                    type="radio"
                    name="statusActive"
                    checked={aktif === false}
                    disabled={isSelf}
                    onChange={() => setAktif(false)}
                    className="text-red-600"
                  />
                  <span>Nonaktifkan Akun</span>
                </label>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Pengguna nonaktif akan langsung ditolak dan melihat pesan &ldquo;Akun Anda dinonaktifkan. Hubungi klinik.&rdquo;
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <Link
                href="/admin/pengguna"
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-full transition"
              >
                Batal
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0E7490] text-white text-xs font-bold hover:bg-[#155E75] shadow-xs disabled:opacity-50 transition"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Simpan Perubahan Peran
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default function EditPenggunaPage() {
  return (
    <RouteGuard allowedRoles={["super_admin"]}>
      <AppLayout>
        <Suspense fallback={
          <div className="p-14 text-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#0E7490]" />
          </div>
        }>
          <EditPenggunaContent />
        </Suspense>
      </AppLayout>
    </RouteGuard>
  );
}
