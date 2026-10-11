"use client";

import React, { useEffect, useState } from "react";
import RouteGuard from "@/components/RouteGuard";
import AppLayout from "@/components/AppLayout";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import {
  CalendarDays,
  PlusCircle,
  Clock,
  Trash2,
  AlertCircle,
  Loader2,
  Stethoscope,
  CheckCircle2,
} from "lucide-react";

export default function KelolaJadwalDokterPage() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal / Form Tambah Hari
  const [showModal, setShowModal] = useState(false);
  const [formHari, setFormHari] = useState("senin");
  const [formJamMulai, setFormJamMulai] = useState("09:00");
  const [formJamSelesai, setFormJamSelesai] = useState("15:00");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const hariOptions = ["senin", "selasa", "rabu", "kamis", "jumat", "sabtu"];

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      // 1. Ambil daftar dokter
      const qDoc = query(
        collection(db, "users"),
        where("role", "==", "dokter"),
        where("aktif", "==", true)
      );
      const snapDoc = await getDocs(qDoc);
      const docList = [];
      snapDoc.forEach((d) => docList.push({ id: d.id, ...d.data() }));
      setDoctors(docList);

      if (docList.length > 0 && !selectedDoctorId) {
        setSelectedDoctorId(docList[0].id);
      }

      // 2. Ambil semua jadwal dokter
      const snapJadwal = await getDocs(collection(db, "jadwal_dokter"));
      const jList = [];
      snapJadwal.forEach((d) => jList.push({ id: d.id, ...d.data() }));
      setSchedules(jList);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat jadwal dokter.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeDoctorSchedules = schedules.filter(
    (s) => s.dokterId === selectedDoctorId
  );

  const handleDeleteSchedule = async (scheduleId) => {
    if (!confirm("Hapus jadwal praktik pada hari ini?")) return;
    try {
      await deleteDoc(doc(db, "jadwal_dokter", scheduleId));
      await loadData();
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus jadwal.");
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!selectedDoctorId) {
      setFormError("Silakan pilih dokter terlebih dahulu.");
      return;
    }

    // Validasi PRD 4.15: Satu dokter satu jadwal per hari
    const existing = activeDoctorSchedules.find(
      (s) => s.hari.toLowerCase() === formHari.toLowerCase()
    );
    if (existing) {
      setFormError(`Dokter ini sudah memiliki jadwal praktik pada hari ${formHari.toUpperCase()}. Hapus jadwal lama jika ingin memperbarui.`);
      return;
    }

    // Validasi PRD 4.15: Jam selesai setelah jam mulai
    if (formJamSelesai <= formJamMulai) {
      setFormError("Jam selesai praktik harus setelah jam mulai.");
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, "jadwal_dokter"), {
        dokterId: selectedDoctorId,
        hari: formHari.toLowerCase(),
        jamMulai: formJamMulai,
        jamSelesai: formJamSelesai,
      });

      setShowModal(false);
      setFormHari("senin");
      setFormJamMulai("09:00");
      setFormJamSelesai("15:00");
      await loadData();
    } catch (err) {
      console.error(err);
      setFormError("Gagal menambahkan jadwal dokter.");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedDoctorObj = doctors.find((d) => d.id === selectedDoctorId);

  return (
    <RouteGuard allowedRoles={["super_admin"]}>
      <AppLayout>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50/80 px-2.5 py-0.5 rounded-full border border-amber-200/60">
                  Panel Pemilik Klinik
                </span>
                <span className="text-xs text-slate-400">• Kalender Bertugas</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Kelola Jadwal Praktik Dokter</h1>
              <p className="text-xs text-slate-500 mt-1">
                Atur hari operasional klinik (Senin - Sabtu) dan rentang jam tugas dokter (PRD 4.15).
              </p>
            </div>
            <button
              onClick={() => {
                setFormError("");
                setShowModal(true);
              }}
              disabled={doctors.length === 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0E7490] text-white text-xs font-bold hover:bg-[#155E75] shadow-xs hover:shadow disabled:opacity-50 shrink-0 transition"
            >
              <PlusCircle className="w-4 h-4" />
              Tambah Hari Praktik
            </button>
          </div>

          {/* Pilih Dokter Gigi - Mediora Pill Selector */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-[#0E7490]" />
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Pilih Dokter Gigi:
              </label>
            </div>
            <div className="flex flex-wrap gap-2">
              {doctors.map((docItem) => {
                const isSelected = selectedDoctorId === docItem.id;
                return (
                  <button
                    key={docItem.id}
                    onClick={() => setSelectedDoctorId(docItem.id)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                      isSelected
                        ? "bg-[#0E7490] text-white shadow-2xs"
                        : "bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {docItem.nama}
                  </button>
                );
              })}
            </div>
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-14 text-center text-slate-500 shadow-xs">
              <Loader2 className="w-8 h-8 text-[#0E7490] animate-spin mx-auto mb-2" />
              <p className="text-sm font-medium">Memuat data jadwal dokter...</p>
            </div>
          ) : doctors.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-14 text-center text-slate-500 shadow-xs">
              <p className="font-bold text-slate-800">Belum ada akun dokter terdaftar</p>
              <p className="text-xs text-slate-500 mt-1">
                Silakan buat akun dokter terlebih dahulu di menu Kelola Pengguna.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden p-6 sm:p-7 space-y-4">
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-cyan-100 text-[#0E7490] font-bold text-xs flex items-center justify-center border border-cyan-200">
                    {selectedDoctorObj?.nama ? selectedDoctorObj.nama.replace("drg. ", "").charAt(0) : "D"}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      Jadwal Praktik: <span className="text-[#0E7490]">{selectedDoctorObj?.nama}</span>
                    </h3>
                    <p className="text-[11px] text-slate-400">Jadwal mingguan aktif di klinik</p>
                  </div>
                </div>
                <span className="text-xs font-bold px-3 py-1 bg-cyan-50 text-[#0E7490] rounded-full border border-cyan-100">
                  {activeDoctorSchedules.length} Hari Terjadwal
                </span>
              </div>

              {activeDoctorSchedules.length === 0 ? (
                <div className="py-14 text-center text-slate-500">
                  <CalendarDays className="w-10 h-10 mx-auto mb-2 opacity-40 text-slate-500" />
                  <p className="font-bold text-slate-800">Belum ada hari praktik untuk dokter ini</p>
                  <p className="text-xs text-slate-500 mt-1 mb-4">
                    Pasien tidak dapat memilih dokter ini saat memesan janji temu sebelum jadwal diatur.
                  </p>
                  <button
                    onClick={() => {
                      setFormError("");
                      setShowModal(true);
                    }}
                    className="px-5 py-2.5 bg-[#0E7490] text-white rounded-full text-xs font-bold hover:bg-[#155E75] shadow-xs transition"
                  >
                    Atur Hari Praktik Sekarang
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 pt-2">
                  {activeDoctorSchedules.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/70 hover:bg-white hover:border-[#0E7490] hover:shadow-xs transition-all flex flex-col justify-between space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900 uppercase tracking-wide">
                          {item.hari}
                        </span>
                        <button
                          onClick={() => handleDeleteSchedule(item.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-full hover:bg-red-50 transition"
                          title="Hapus Hari Praktik"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-700 tabular-nums">
                        <Clock className="w-3.5 h-3.5 text-[#0E7490]" />
                        <span className="font-semibold">Pukul {item.jamMulai} - {item.jamSelesai} WITA</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Modal Tambah Hari Praktik (Mediora Style) */}
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
              <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-xl border border-slate-200/80 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-[#0E7490]" />
                    Tambah Hari Praktik ({selectedDoctorObj?.nama})
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
                      Hari Praktik (Senin - Sabtu) <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formHari}
                      onChange={(e) => setFormHari(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:border-[#0E7490] focus:ring-2 focus:ring-cyan-500/20 focus:bg-white focus:outline-none capitalize"
                    >
                      {hariOptions.map((h) => (
                        <option key={h} value={h} className="capitalize">
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Jam Mulai <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="time"
                        required
                        value={formJamMulai}
                        onChange={(e) => setFormJamMulai(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:border-[#0E7490] focus:ring-2 focus:ring-cyan-500/20 focus:bg-white focus:outline-none tabular-nums"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Jam Selesai <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="time"
                        required
                        value={formJamSelesai}
                        onChange={(e) => setFormJamSelesai(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:border-[#0E7490] focus:ring-2 focus:ring-cyan-500/20 focus:bg-white focus:outline-none tabular-nums"
                      />
                    </div>
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
                      {submitting ? "Menyimpan..." : "Simpan Jadwal"}
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
