"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import RouteGuard from "@/components/RouteGuard";
import AppLayout from "@/components/AppLayout";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import {
  User,
  Mail,
  Phone,
  Shield,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

export default function ProfilPage() {
  const { user, userData, refreshUserData } = useAuth();

  const [nama, setNama] = useState("");
  const [noHp, setNoHp] = useState("");
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (userData) {
      setNama(userData.nama || "");
      setNoHp(userData.noHp || "");
    }
  }, [userData]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    if (!nama.trim()) {
      setErrorMsg("Nama tidak boleh kosong.");
      return;
    }

    if (noHp.trim()) {
      if (!/^08[0-9]{8,12}$/.test(noHp.trim())) {
        setErrorMsg("Nomor HP harus berupa angka dan diawali dengan '08' (10-14 digit).");
        return;
      }
    }

    setSaving(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        nama: nama.trim(),
        noHp: noHp.trim(),
      });
      await refreshUserData();
      setSuccessMsg("Profil berhasil diperbarui!");
    } catch (err) {
      console.error(err);
      setErrorMsg("Gagal memperbarui profil.");
    } finally {
      setSaving(false);
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case "super_admin":
        return "Super Admin (Pemilik Klinik)";
      case "dokter":
        return "Dokter Gigi";
      case "resepsionis":
        return "Resepsionis Meja Depan";
      default:
        return "Pasien";
    }
  };

  return (
    <RouteGuard allowedRoles={["pasien", "resepsionis", "dokter", "super_admin"]}>
      <AppLayout>
        <div className="max-w-xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Profil Akun Saya</h1>
            <p className="text-xs text-slate-500 mt-1">
              Perbarui nama dan nomor kontak Anda. Email dan peran dikunci oleh sistem keamanan.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
            {successMsg && (
              <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    className="block w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E7490]/20 focus:border-[#0E7490]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Nomor Handphone (WhatsApp)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    value={noHp}
                    onChange={(e) => setNoHp(e.target.value)}
                    placeholder="081234567890"
                    className="block w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E7490]/20 focus:border-[#0E7490]"
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-400">Format: 081234567890</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Alamat Email (Tidak Dapat Diubah)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    disabled
                    value={userData?.email || ""}
                    className="block w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-100 text-slate-500 border border-slate-200 rounded-xl cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Peran Akun (Otoritas Sistem)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Shield className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    disabled
                    value={getRoleBadge(userData?.role)}
                    className="block w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-100 text-slate-700 font-semibold border border-slate-200 rounded-xl cursor-not-allowed"
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-400">
                  Perubahan peran hanya dapat diatur oleh Super Admin melalui menu Kelola Pengguna.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0E7490] text-white text-xs font-semibold hover:bg-[#155E75] shadow-sm disabled:opacity-50 transition"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Simpan Perubahan
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </AppLayout>
    </RouteGuard>
  );
}
