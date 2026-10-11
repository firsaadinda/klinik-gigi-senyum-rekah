"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import RouteGuard from "@/components/RouteGuard";
import AppLayout from "@/components/AppLayout";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  setDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import {
  Calendar,
  Clock,
  User,
  Sparkles,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

export default function BuatJanjiPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Master Data
  const [layananList, setLayananList] = useState([]);
  const [dokterList, setDokterList] = useState([]);
  const [jadwalList, setJadwalList] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Form Selections
  const [selectedLayanan, setSelectedLayanan] = useState(null);
  const [selectedDokter, setSelectedDokter] = useState(null);
  const [selectedTanggal, setSelectedTanggal] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedJam, setSelectedJam] = useState("");
  const [keluhan, setKeluhan] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Hari dalam Bahasa Indonesia
  const hariMap = ["minggu", "senin", "selasa", "rabu", "kamis", "jumat", "sabtu"];

  // Ambil data layanan, dokter, dan jadwal dokter
  useEffect(() => {
    async function loadMasterData() {
      setLoadingData(true);
      try {
        // 1. Layanan aktif
        const qLayanan = query(collection(db, "layanan"), where("aktif", "==", true));
        const snapLayanan = await getDocs(qLayanan);
        const lList = [];
        snapLayanan.forEach((d) => lList.push({ id: d.id, ...d.data() }));
        setLayananList(lList);

        // 2. Dokter aktif
        const qDokter = query(collection(db, "users"), where("role", "==", "dokter"), where("aktif", "==", true));
        const snapDokter = await getDocs(qDokter);
        const dList = [];
        snapDokter.forEach((d) => dList.push({ id: d.id, ...d.data() }));
        setDokterList(dList);

        // 3. Jadwal dokter
        const snapJadwal = await getDocs(collection(db, "jadwal_dokter"));
        const jList = [];
        snapJadwal.forEach((d) => jList.push({ id: d.id, ...d.data() }));
        setJadwalList(jList);
      } catch (err) {
        console.error("Gagal memuat data master:", err);
        setError("Gagal memuat data formulir janji temu.");
      } finally {
        setLoadingData(false);
      }
    }

    loadMasterData();
  }, []);

  const [tomorrowStr, setTomorrowStr] = useState("");

  useEffect(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    setTomorrowStr(d.toISOString().split("T")[0]);
  }, []);

  // Cek apakah tanggal yang dipilih valid sesuai jadwal dokter
  const getDoctorScheduleForDate = (dateStr, doctorId) => {
    if (!dateStr || !doctorId) return null;
    const dateObj = new Date(dateStr + "T00:00:00");
    const dayName = hariMap[dateObj.getDay()];
    return jadwalList.find(
      (j) => j.dokterId === doctorId && j.hari.toLowerCase() === dayName
    );
  };

  // Hitung slot jam kosong saat dokter, tanggal, atau layanan berubah
  useEffect(() => {
    async function calculateSlots() {
      if (!selectedDokter || !selectedTanggal || !selectedLayanan) {
        setAvailableSlots([]);
        setSelectedJam("");
        return;
      }

      const schedule = getDoctorScheduleForDate(selectedTanggal, selectedDokter.id);
      if (!schedule) {
        setAvailableSlots([]);
        setSelectedJam("");
        return;
      }

      setLoadingSlots(true);
      setError("");

      try {
        // Ambil slot_terisi untuk dokter dan tanggal ini
        const qSlots = query(
          collection(db, "slot_terisi"),
          where("dokterId", "==", selectedDokter.id),
          where("tanggal", "==", selectedTanggal)
        );
        const snapSlots = await getDocs(qSlots);
        const booked = [];
        snapSlots.forEach((d) => booked.push(d.data()));

        // Generate semua slot jam (interval 30 menit) dari jamMulai sampai jamSelesai
        // format jam: "09:00", "15:00"
        const [startH, startM] = schedule.jamMulai.split(":").map(Number);
        const [endH, endM] = schedule.jamSelesai.split(":").map(Number);
        const startTotal = startH * 60 + startM;
        const endTotal = endH * 60 + endM;

        const serviceDuration = selectedLayanan.durasiMenit || 30;
        const generated = [];

        for (let t = startTotal; t + serviceDuration <= endTotal; t += 30) {
          const slotHour = String(Math.floor(t / 60)).padStart(2, "0");
          const slotMin = String(t % 60).padStart(2, "0");
          const slotTime = `${slotHour}:${slotMin}`;

          // Cek tabrakan dengan slot_terisi
          const isConflict = booked.some((b) => {
            const [bH, bM] = b.jam.split(":").map(Number);
            const bStart = bH * 60 + bM;
            const bEnd = bStart + (b.durasiMenit || 30);
            const slotEnd = t + serviceDuration;

            // overlap condition: (slotStart < bEnd) && (slotEnd > bStart)
            return t < bEnd && slotEnd > bStart;
          });

          if (!isConflict) {
            generated.push(slotTime);
          }
        }

        setAvailableSlots(generated);
        if (selectedJam && !generated.includes(selectedJam)) {
          setSelectedJam("");
        }
      } catch (err) {
        console.error("Gagal menghitung slot:", err);
        setError("Gagal memuat slot jam praktik dokter.");
      } finally {
        setLoadingSlots(false);
      }
    }

    calculateSlots();
  }, [selectedDokter, selectedTanggal, selectedLayanan]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!selectedLayanan) {
      setError("Silakan pilih layanan.");
      return;
    }
    if (!selectedDokter) {
      setError("Silakan pilih dokter.");
      return;
    }
    if (!selectedTanggal) {
      setError("Silakan pilih tanggal janji.");
      return;
    }
    if (!selectedJam) {
      setError("Silakan pilih slot jam yang tersedia.");
      return;
    }
    if (!keluhan.trim()) {
      setError("Silakan isi keluhan Anda.");
      return;
    }

    setSubmitting(true);
    try {
      // 1. Simpan janji_temu dengan status "menunggu"
      const janjiData = {
        pasienId: user.uid,
        dokterId: selectedDokter.id,
        layananId: selectedLayanan.id,
        tanggal: selectedTanggal,
        jam: selectedJam,
        keluhan: keluhan.trim(),
        status: "menunggu",
        alasanBatal: "",
        dibuatPada: serverTimestamp(),
      };

      const janjiRef = await addDoc(collection(db, "janji_temu"), janjiData);

      // 2. Simpan slot_terisi dengan ID yang sama persis sesuai PRD 4.3.1 & 7.1
      await setDoc(doc(db, "slot_terisi", janjiRef.id), {
        dokterId: selectedDokter.id,
        tanggal: selectedTanggal,
        jam: selectedJam,
        durasiMenit: selectedLayanan.durasiMenit || 30,
      });

      router.push(`/janji/${janjiRef.id}`);
    } catch (err) {
      console.error(err);
      setError("Gagal menyimpan janji temu. Silakan coba lagi.");
      setSubmitting(false);
    }
  };

  const scheduleForSelectedDate = selectedTanggal && selectedDokter
    ? getDoctorScheduleForDate(selectedTanggal, selectedDokter.id)
    : null;

  return (
    <RouteGuard allowedRoles={["pasien"]}>
      <AppLayout>
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/janji"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Kembali ke Daftar Janji
              </Link>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Formulir Reservasi Janji Temu</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Pilih paket tindakan medis, dokter pemeriksa, serta slot jam praktik yang tersedia.
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {loadingData ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-500">
              <Loader2 className="w-7 h-7 text-[#0E7490] animate-spin mx-auto mb-2" />
              <p className="text-xs">Menyiapkan data layanan & dokter...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-6">
              {/* Langkah 1: Pilih Layanan */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5">
                  1. Pilih Layanan Gigi <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {layananList.map((lay) => {
                    const isSelected = selectedLayanan?.id === lay.id;
                    return (
                      <div
                        key={lay.id}
                        onClick={() => setSelectedLayanan(lay)}
                        className={`cursor-pointer p-4 rounded-xl border transition ${
                          isSelected
                            ? "bg-cyan-50/80 border-[#0E7490] ring-1 ring-[#0E7490] shadow-xs"
                            : "border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/70"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <h4 className="font-bold text-xs text-slate-900">{lay.nama}</h4>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-[#0E7490]" />}
                        </div>
                        <div className="flex items-center gap-2.5 mt-2.5 text-xs text-slate-500">
                          <span className="flex items-center gap-1 font-medium">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {lay.durasiMenit} menit
                          </span>
                          <span>•</span>
                          <span className="font-bold text-slate-900 tabular-nums">
                            Rp {Number(lay.harga).toLocaleString("id-ID")}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Langkah 2: Pilih Dokter */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5">
                  2. Pilih Dokter Gigi Pemeriksa <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {dokterList.map((docItem) => {
                    const isSelected = selectedDokter?.id === docItem.id;
                    return (
                      <div
                        key={docItem.id}
                        onClick={() => setSelectedDokter(docItem)}
                        className={`cursor-pointer p-4 rounded-xl border transition ${
                          isSelected
                            ? "bg-cyan-50/80 border-[#0E7490] ring-1 ring-[#0E7490] shadow-xs"
                            : "border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/70"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-cyan-100 text-[#0E7490] flex items-center justify-center font-bold text-xs">
                              {docItem.nama.charAt(0)}
                            </div>
                            <div>
                              <h4 className="font-bold text-xs text-slate-900">{docItem.nama}</h4>
                              <p className="text-[11px] text-slate-400 font-medium">Dokter Gigi Senyum Rekah</p>
                            </div>
                          </div>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-[#0E7490]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Langkah 3: Pilih Tanggal */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  3. Pilih Tanggal Janji <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  min={tomorrowStr}
                  value={selectedTanggal}
                  onChange={(e) => setSelectedTanggal(e.target.value)}
                  className="w-full sm:w-64 px-4 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0E7490] focus:border-[#0E7490]"
                />
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Pemesanan mandiri dibuka paling cepat untuk besok ({tomorrowStr}) sesuai ketentuan operasional klinik.
                </p>

                {selectedTanggal && selectedDokter && !scheduleForSelectedDate && (
                  <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3 mt-2.5 font-medium">
                    {selectedDokter.nama} tidak memiliki jadwal praktik pada hari tersebut. Silakan pilih tanggal praktik lain.
                  </p>
                )}

                {scheduleForSelectedDate && (
                  <p className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl p-3 mt-2.5 font-medium">
                    Jadwal praktik {scheduleForSelectedDate.hari}: {scheduleForSelectedDate.jamMulai} - {scheduleForSelectedDate.jamSelesai} WITA
                  </p>
                )}
              </div>

              {/* Langkah 4: Pilih Slot Jam */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  4. Slot Jam Tersedia <span className="text-red-500">*</span>
                </label>

                {!selectedLayanan || !selectedDokter || !selectedTanggal ? (
                  <div className="p-5 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-xs text-slate-400 text-center">
                    Pilih layanan, dokter, dan tanggal terlebih dahulu untuk menampilkan slot jam yang masih lowong.
                  </div>
                ) : loadingSlots ? (
                  <div className="p-5 flex items-center justify-center gap-2 text-xs text-slate-500">
                    <Loader2 className="w-4 h-4 animate-spin text-[#0E7490]" />
                    Memeriksa ketersediaan slot waktu dokter...
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 text-center">
                    Tidak ada slot kosong yang tersedia untuk dokter dan tanggal ini. Silakan pilih tanggal atau dokter lain.
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {availableSlots.map((slot) => {
                      const isSelected = selectedJam === slot;
                      return (
                        <button
                          type="button"
                          key={slot}
                          onClick={() => setSelectedJam(slot)}
                          className={`py-2.5 px-3 rounded-xl text-xs font-bold tabular-nums border transition ${
                            isSelected
                              ? "bg-[#0E7490] text-white border-[#0E7490] shadow-xs"
                              : "bg-slate-50/80 hover:bg-slate-100 border-slate-200 text-slate-700"
                          }`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Langkah 5: Keluhan */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  5. Keluhan Gigi & Gejala <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={keluhan}
                  onChange={(e) => setKeluhan(e.target.value)}
                  placeholder="Uraikan keluhan Anda (contoh: ngilu pada gigi geraham bawah saat minum dingin, sudah 3 hari)..."
                  className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0E7490] focus:border-[#0E7490]"
                />
              </div>

              {/* Tombol Kirim */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <Link
                  href="/janji"
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Batal
                </Link>
                <button
                  type="submit"
                  disabled={submitting || !selectedJam}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#0E7490] text-white text-xs font-semibold hover:bg-[#155E75] disabled:opacity-50 transition shadow-xs"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Menyimpan Janji...
                    </>
                  ) : (
                    "Kirim Janji Temu"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </AppLayout>
    </RouteGuard>
  );
}
