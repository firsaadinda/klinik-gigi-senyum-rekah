"use client";

import React, { useEffect, useState } from "react";
import RouteGuard from "@/components/RouteGuard";
import AppLayout from "@/components/AppLayout";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import {
  ClipboardList,
  PlusCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  Edit2,
  Save,
} from "lucide-react";

export default function KelolaLayananPage() {
  const [layananList, setLayananList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal / Form state
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [nama, setNama] = useState("");
  const [durasiMenit, setDurasiMenit] = useState(30);
  const [harga, setHarga] = useState("");
  const [aktif, setAktif] = useState(true);
  const [formError, setFormError] = useState("");

  const loadLayanan = async () => {
    setLoading(true);
    setError("");

    try {
      const snap = await getDocs(collection(db, "layanan"));
      const items = [];
      snap.forEach((d) => items.push({ id: d.id, ...d.data() }));

      items.sort((a, b) => (a.nama || "").localeCompare(b.nama || ""));
      setLayananList(items);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat katalog layanan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLayanan();
  }, []);

  const handleToggleAktif = async (item) => {
    try {
      await updateDoc(doc(db, "layanan", item.id), {
        aktif: !item.aktif,
      });
      await loadLayanan();
    } catch (err) {
      console.error(err);
      alert("Gagal mengubah status layanan.");
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!nama.trim()) {
      setFormError("Nama layanan wajib diisi.");
      return;
    }

    const dur = Number(durasiMenit);
    // Validasi PRD 4.14: durasi kelipatan 30 menit
    if (isNaN(dur) || dur <= 0 || dur % 30 !== 0) {
      setFormError("Durasi harus berupa kelipatan 30 menit (contoh: 30, 60, 90, 120).");
      return;
    }

    const prc = Number(harga);
    if (isNaN(prc) || prc < 0) {
      setFormError("Harga harus berupa angka nominal valid.");
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, "layanan"), {
        nama: nama.trim(),
        durasiMenit: dur,
        harga: prc,
        aktif: aktif,
      });

      setShowModal(false);
      setNama("");
      setDurasiMenit(30);
      setHarga("");
      setAktif(true);
      await loadLayanan();
    } catch (err) {
      console.error(err);
      setFormError("Gagal menambahkan layanan.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <RouteGuard allowedRoles={["super_admin"]}>
      <AppLayout>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50/80 px-2.5 py-0.5 rounded-full border border-purple-200/60">
                  Panel Pemilik Klinik
                </span>
                <span className="text-xs text-slate-400">• Paket Perawatan</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Katalog Layanan Klinik</h1>
              <p className="text-xs text-slate-500 mt-1">
                Kelola paket tindakan gigi, durasi estimasi (kelipatan 30 menit), dan tarif harga (PRD 4.14).
              </p>
            </div>
            <button
              onClick={() => {
                setFormError("");
                setShowModal(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0E7490] text-white text-xs font-bold hover:bg-[#155E75] shadow-xs hover:shadow shrink-0 transition"
            >
              <PlusCircle className="w-4 h-4" />
              Tambah Layanan Baru
            </button>
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-14 text-center text-slate-500 shadow-xs">
              <Loader2 className="w-8 h-8 text-[#0E7490] animate-spin mx-auto mb-2" />
              <p className="text-sm font-medium">Memuat daftar layanan...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50/80 text-red-600 rounded-2xl border border-red-200 text-center text-xs">
              <p>{error}</p>
            </div>
          ) : layananList.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-14 text-center text-slate-500 shadow-xs">
              <ClipboardList className="w-10 h-10 mx-auto mb-2 opacity-40 text-slate-500" />
              <p className="font-bold text-slate-800">Belum ada katalog layanan</p>
              <p className="text-xs text-slate-500 mt-1">Klik tombol Tambah Layanan Baru di atas.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-3.5 px-4">Nama Layanan</th>
                      <th className="py-3.5 px-4">Durasi Estimasi</th>
                      <th className="py-3.5 px-4">Tarif Harga (Rp)</th>
                      <th className="py-3.5 px-4 text-center">Status</th>
                      <th className="py-3.5 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {layananList.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {item.nama}
                        </td>

                        <td className="py-3.5 px-4 text-slate-600 tabular-nums">
                          <span className="inline-flex items-center gap-1.5 font-medium">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {item.durasiMenit} menit
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-bold text-slate-900 tabular-nums">
                          Rp {Number(item.harga || 0).toLocaleString("id-ID")}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          {item.aktif ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                              Aktif
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200/80">
                              Nonaktif
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleToggleAktif(item)}
                            className={`px-3.5 py-1 rounded-full text-[11px] font-bold border transition ${
                              item.aktif
                                ? "bg-white border-amber-300 text-amber-800 hover:bg-amber-50"
                                : "bg-white border-emerald-300 text-emerald-800 hover:bg-emerald-50"
                            }`}
                          >
                            {item.aktif ? "Nonaktifkan" : "Aktifkan"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Modal Tambah Layanan (Mediora Style) */}
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
              <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-xl border border-slate-200/80 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-[#0E7490]" />
                    Tambah Layanan Klinik Baru
                  </h3>
                </div>

                {formError && (
                  <div className="p-3.5 bg-red-50/80 text-red-700 border border-red-200 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <form onSubmit={handleAddSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Nama Layanan <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={nama}
                      onChange={(e) => setNama(e.target.value)}
                      placeholder="Contoh: Cabut Gigi Geraham Bungsu"
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0E7490] focus:ring-2 focus:ring-cyan-500/20 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Durasi (Menit - Kelipatan 30) <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={durasiMenit}
                      onChange={(e) => setDurasiMenit(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0E7490] focus:ring-2 focus:ring-cyan-500/20 focus:outline-none"
                    >
                      <option value={30}>30 Menit</option>
                      <option value={60}>60 Menit (1 Jam)</option>
                      <option value={90}>90 Menit (1.5 Jam)</option>
                      <option value={120}>120 Menit (2 Jam)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Tarif Harga (Rupiah) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      step={5000}
                      value={harga}
                      onChange={(e) => setHarga(e.target.value)}
                      placeholder="Contoh: 250000"
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0E7490] focus:ring-2 focus:ring-cyan-500/20 focus:outline-none tabular-nums"
                    />
                  </div>

                  <div className="flex items-center gap-2.5 pt-1">
                    <input
                      type="checkbox"
                      id="layananAktifCheck"
                      checked={aktif}
                      onChange={(e) => setAktif(e.target.checked)}
                      className="rounded text-[#0E7490]"
                    />
                    <label htmlFor="layananAktifCheck" className="text-xs font-medium text-slate-700 cursor-pointer">
                      Langsung Aktifkan untuk Pemesanan Janji Temu Pasien
                    </label>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-full transition"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-5 py-2 text-xs font-bold text-white bg-[#0E7490] hover:bg-[#155E75] rounded-full disabled:opacity-50 shadow-xs transition"
                    >
                      {submitting ? "Menyimpan..." : "Simpan Layanan"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </AppLayout>
    </RouteGuard>
  );
}
