"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import RouteGuard from "@/components/RouteGuard";
import AppLayout from "@/components/AppLayout";
import StatusBadge from "@/components/StatusBadge";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  query,
  where,
} from "firebase/firestore";
import {
  Calendar,
  Clock,
  User,
  Filter,
  CheckCircle,
  XCircle,
  Clock3,
  CalendarDays,
  AlertCircle,
  Loader2,
  ChevronRight,
  Stethoscope,
} from "lucide-react";

function KelolaJanjiContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL search params sync
  const initialStatus = searchParams.get("status") || "semua";
  const initialDate = searchParams.get("tanggal") || "";

  const [filterStatus, setFilterStatus] = useState(initialStatus);
  const [filterDate, setFilterDate] = useState(initialDate);

  const [janjiList, setJanjiList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Modal Batalkan
  const [cancelModalItem, setCancelModalItem] = useState(null);
  const [alasanBatal, setAlasanBatal] = useState("");

  // Modal Jadwal Ulang
  const [rescheduleModalItem, setRescheduleModalItem] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [rescheduleSlot, setRescheduleSlot] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);

  const syncUrl = (st, dt) => {
    const params = new URLSearchParams();
    if (st && st !== "semua") params.set("status", st);
    if (dt) params.set("tanggal", dt);
    const qs = params.toString();
    router.replace(`/resepsionis/janji${qs ? `?${qs}` : ""}`);
  };

  const loadAppointments = async () => {
    setLoading(true);
    setError("");

    try {
      const snap = await getDocs(collection(db, "janji_temu"));
      const items = [];

      for (const d of snap.docs) {
        const data = d.data();
        let patientName = "Pasien";
        let doctorName = "Dokter";
        let serviceName = "Layanan";
        let serviceDurasi = 30;

        if (data.pasienId) {
          try {
            const pSnap = await getDoc(doc(db, "users", data.pasienId));
            if (pSnap.exists()) patientName = pSnap.data().nama;
          } catch {}
        }

        if (data.dokterId) {
          try {
            const docSnap = await getDoc(doc(db, "users", data.dokterId));
            if (docSnap.exists()) doctorName = docSnap.data().nama;
          } catch {}
        }

        if (data.layananId) {
          try {
            const lSnap = await getDoc(doc(db, "layanan", data.layananId));
            if (lSnap.exists()) {
              serviceName = lSnap.data().nama;
              serviceDurasi = lSnap.data().durasiMenit || 30;
            }
          } catch {}
        }

        items.push({
          id: d.id,
          ...data,
          patientName,
          doctorName,
          serviceName,
          serviceDurasi,
        });
      }

      // Urutkan tanggal dan jam terdekat
      items.sort((a, b) => {
        const dtA = `${a.tanggal} ${a.jam}`;
        const dtB = `${b.tanggal} ${b.jam}`;
        return dtA.localeCompare(dtB);
      });

      setJanjiList(items);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat data janji klinik.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const handleStatusFilterChange = (st) => {
    setFilterStatus(st);
    syncUrl(st, filterDate);
  };

  const handleDateFilterChange = (dt) => {
    setFilterDate(dt);
    syncUrl(filterStatus, dt);
  };

  // 1. Konfirmasi Janji (PRD 4.7: Menunggu -> Dikonfirmasi)
  const handleConfirm = async (item) => {
    if (item.status !== "menunggu") return;
    setActionLoading(true);
    try {
      await updateDoc(doc(db, "janji_temu", item.id), {
        status: "dikonfirmasi",
      });
      await loadAppointments();
    } catch (err) {
      console.error(err);
      alert("Gagal mengonfirmasi janji.");
    } finally {
      setActionLoading(false);
    }
  };

  // 2. Tandai Hadir (PRD 4.7: Dikonfirmasi -> Hadir pada hari ini)
  const handleMarkPresent = async (item) => {
    const todayStr = new Date().toISOString().split("T")[0];
    if (item.tanggal !== todayStr) {
      alert(`Tandai Hadir hanya dapat dilakukan pada hari H janji temu (${item.tanggal}).`);
      return;
    }
    setActionLoading(true);
    try {
      await updateDoc(doc(db, "janji_temu", item.id), {
        status: "hadir",
      });
      await loadAppointments();
    } catch (err) {
      console.error(err);
      alert("Gagal menandai hadir.");
    } finally {
      setActionLoading(false);
    }
  };

  // 3. Batalkan Janji (PRD 4.7: Mengisi Alasan -> Dibatalkan & slot dilepas)
  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    if (!cancelModalItem || !alasanBatal.trim()) {
      alert("Alasan pembatalan wajib diisi.");
      return;
    }
    setActionLoading(true);
    try {
      await updateDoc(doc(db, "janji_temu", cancelModalItem.id), {
        status: "dibatalkan",
        alasanBatal: alasanBatal.trim(),
      });
      // Hapus slot_terisi agar slot kembali kosong
      try {
        await deleteDoc(doc(db, "slot_terisi", cancelModalItem.id));
      } catch (err) {}

      setCancelModalItem(null);
      setAlasanBatal("");
      await loadAppointments();
    } catch (err) {
      console.error(err);
      alert("Gagal membatalkan janji.");
    } finally {
      setActionLoading(false);
    }
  };

  // 4. Jadwal Ulang (PRD 4.7: Memilih tanggal dan slot baru)
  const openRescheduleModal = (item) => {
    setRescheduleModalItem(item);
    setRescheduleDate(item.tanggal || "");
    setRescheduleSlot("");
    setAvailableSlots([]);
  };

  const hariMap = ["minggu", "senin", "selasa", "rabu", "kamis", "jumat", "sabtu"];

  const handleRescheduleDateChange = async (newDate) => {
    setRescheduleDate(newDate);
    setRescheduleSlot("");
    if (!newDate || !rescheduleModalItem) {
      setAvailableSlots([]);
      return;
    }

    setLoadingSlots(true);
    try {
      // Ambil jadwal dokter
      const snapJadwal = await getDocs(
        query(collection(db, "jadwal_dokter"), where("dokterId", "==", rescheduleModalItem.dokterId))
      );
      const dayName = hariMap[new Date(newDate + "T00:00:00").getDay()];
      let schedule = null;
      snapJadwal.forEach((d) => {
        if (d.data().hari.toLowerCase() === dayName) schedule = d.data();
      });

      if (!schedule) {
        setAvailableSlots([]);
        setLoadingSlots(false);
        return;
      }

      // Ambil slot_terisi untuk tanggal ini (kecuali slot janji saat ini)
      const snapSlots = await getDocs(
        query(
          collection(db, "slot_terisi"),
          where("dokterId", "==", rescheduleModalItem.dokterId),
          where("tanggal", "==", newDate)
        )
      );
      const booked = [];
      snapSlots.forEach((d) => {
        if (d.id !== rescheduleModalItem.id) booked.push(d.data());
      });

      const [startH, startM] = schedule.jamMulai.split(":").map(Number);
      const [endH, endM] = schedule.jamSelesai.split(":").map(Number);
      const startTotal = startH * 60 + startM;
      const endTotal = endH * 60 + endM;

      const dur = rescheduleModalItem.serviceDurasi || 30;
      const slots = [];

      for (let t = startTotal; t + dur <= endTotal; t += 30) {
        const slotHour = String(Math.floor(t / 60)).padStart(2, "0");
        const slotMin = String(t % 60).padStart(2, "0");
        const slotTime = `${slotHour}:${slotMin}`;

        const isConflict = booked.some((b) => {
          const [bH, bM] = b.jam.split(":").map(Number);
          const bStart = bH * 60 + bM;
          const bEnd = bStart + (b.durasiMenit || 30);
          return t < bEnd && t + dur > bStart;
        });

        if (!isConflict) slots.push(slotTime);
      }

      setAvailableSlots(slots);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!rescheduleModalItem || !rescheduleDate || !rescheduleSlot) {
      alert("Silakan pilih tanggal dan slot jam baru.");
      return;
    }
    setActionLoading(true);
    try {
      // Update janji_temu
      await updateDoc(doc(db, "janji_temu", rescheduleModalItem.id), {
        tanggal: rescheduleDate,
        jam: rescheduleSlot,
      });

      // Update slot_terisi
      await setDoc(doc(db, "slot_terisi", rescheduleModalItem.id), {
        dokterId: rescheduleModalItem.dokterId,
        tanggal: rescheduleDate,
        jam: rescheduleSlot,
        durasiMenit: rescheduleModalItem.serviceDurasi || 30,
      });

      setRescheduleModalItem(null);
      await loadAppointments();
    } catch (err) {
      console.error(err);
      alert("Gagal menjadwal ulang janji.");
    } finally {
      setActionLoading(false);
    }
  };

  // Filter list
  const filtered = janjiList.filter((item) => {
    const matchStatus = filterStatus === "semua" || item.status === filterStatus;
    const matchDate = !filterDate || item.tanggal === filterDate;
    return matchStatus && matchDate;
  });

  const [todayStr, setTodayStr] = useState("");

  useEffect(() => {
    setTodayStr(new Date().toISOString().split("T")[0]);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Kelola Janji Temu</h1>
          <p className="text-xs text-slate-500 mt-1">
            Konfirmasi jadwal, tandai kedatangan pasien, atau jadwalkan ulang sesuai PRD 4.7.
          </p>
        </div>
        <button
          onClick={loadAppointments}
          className="text-xs font-semibold px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm"
        >
          Muat Ulang Data
        </button>
      </div>

      {/* Saringan Status dan Tanggal (PRD 4.7) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap items-center gap-4 justify-between">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-semibold text-slate-400 mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Status:
          </span>
          {["semua", "menunggu", "dikonfirmasi", "hadir", "selesai", "dibatalkan"].map((st) => (
            <button
              key={st}
              onClick={() => handleStatusFilterChange(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize whitespace-nowrap transition ${
                filterStatus === st
                  ? "bg-[#0E7490] text-white shadow-sm"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate-500">Tanggal:</label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => handleDateFilterChange(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:bg-white focus:outline-none"
          />
          {filterDate && (
            <button
              onClick={() => handleDateFilterChange("")}
              className="text-[11px] text-red-600 font-semibold hover:underline"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
          <Loader2 className="w-8 h-8 text-[#0E7490] animate-spin mx-auto mb-2" />
          <p className="text-sm">Memuat data janji...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 rounded-2xl border border-red-200 text-center text-red-600 text-sm">
          <p>{error}</p>
          <button
            onClick={loadAppointments}
            className="mt-3 px-4 py-1.5 bg-white border border-red-200 rounded-lg text-xs font-semibold"
          >
            Coba lagi
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
          <Calendar className="w-10 h-10 mx-auto mb-3 opacity-40 text-slate-500" />
          <p className="font-semibold text-slate-700">Tidak ada janji yang cocok dengan saringan</p>
          <p className="text-xs text-slate-400 mt-1">Coba ubah status atau tanggal pencarian.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Tanggal & Jam</th>
                  <th className="py-3 px-4">Pasien</th>
                  <th className="py-3 px-4">Dokter</th>
                  <th className="py-3 px-4">Layanan</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Aksi Meja Depan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => {
                  const isToday = item.tanggal === todayStr;
                  const canConfirm = item.status === "menunggu";
                  const canMarkPresent = item.status === "dikonfirmasi" && isToday;
                  const canReschedule = ["menunggu", "dikonfirmasi"].includes(item.status);
                  const canCancel = ["menunggu", "dikonfirmasi"].includes(item.status);

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 px-4 tabular-nums">
                        <Link href={`/resepsionis/janji/${item.id}`} className="font-semibold text-slate-800 hover:text-[#0E7490] block">
                          {item.tanggal}
                        </Link>
                        <span className="text-slate-400">{item.jam} WITA</span>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {item.patientName}
                      </td>

                      <td className="py-3.5 px-4 text-slate-700">
                        {item.doctorName}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        {item.serviceName}
                      </td>

                      <td className="py-3.5 px-4">
                        <StatusBadge status={item.status} />
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {canConfirm && (
                            <button
                              onClick={() => handleConfirm(item)}
                              disabled={actionLoading}
                              className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-[11px] transition"
                              title="Konfirmasi Janji"
                            >
                              Konfirmasi
                            </button>
                          )}

                          {canMarkPresent && (
                            <button
                              onClick={() => handleMarkPresent(item)}
                              disabled={actionLoading}
                              className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 font-semibold text-[11px] transition"
                              title="Tandai Pasien Hadir di Klinik"
                            >
                              Tandai Hadir
                            </button>
                          )}

                          {canReschedule && (
                            <button
                              onClick={() => openRescheduleModal(item)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold text-[11px] transition"
                            >
                              Jadwal Ulang
                            </button>
                          )}

                          {canCancel && (
                            <button
                              onClick={() => setCancelModalItem(item)}
                              className="px-2.5 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-semibold text-[11px] transition"
                            >
                              Batalkan
                            </button>
                          )}

                          <Link
                            href={`/resepsionis/janji/${item.id}`}
                            className="p-1 text-slate-400 hover:text-slate-700 rounded-md"
                            title="Lihat Rincian"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Batalkan Janji dengan Alasan (PRD 4.7) */}
      {cancelModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 text-red-600">
              <XCircle className="w-5 h-5" />
              Batalkan Janji Temu
            </h3>
            <p className="text-xs text-slate-600">
              Membatalkan janji <strong className="text-slate-800">{cancelModalItem.patientName}</strong> tanggal{" "}
              {cancelModalItem.tanggal} pukul {cancelModalItem.jam}.
            </p>

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
                  placeholder="Contoh: Pasien berhalangan hadir karena mendadak ada tugas kantor..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E7490]/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setCancelModalItem(null);
                    setAlasanBatal("");
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Kembali
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || !alasanBatal.trim()}
                  className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl disabled:opacity-50"
                >
                  {actionLoading ? "Memproses..." : "Simpan Pembatalan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Jadwal Ulang (PRD 4.7) */}
      {rescheduleModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 text-[#0E7490]">
              <CalendarDays className="w-5 h-5" />
              Jadwal Ulang Janji Temu
            </h3>
            <p className="text-xs text-slate-600">
              Pilih tanggal baru dan slot jam kosong untuk <strong className="text-slate-800">{rescheduleModalItem.patientName}</strong> bersama{" "}
              {rescheduleModalItem.doctorName}.
            </p>

            <form onSubmit={handleRescheduleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tanggal Baru
                </label>
                <input
                  type="date"
                  required
                  value={rescheduleDate}
                  onChange={(e) => handleRescheduleDateChange(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pilih Slot Jam Baru
                </label>
                {loadingSlots ? (
                  <p className="text-xs text-slate-400 py-3 text-center">Memeriksa slot dokter...</p>
                ) : availableSlots.length === 0 ? (
                  <p className="text-xs text-amber-600 py-2">
                    {rescheduleDate ? "Tidak ada slot kosong pada tanggal ini." : "Pilih tanggal terlebih dahulu."}
                  </p>
                ) : (
                  <div className="grid grid-cols-4 gap-2">
                    {availableSlots.map((slot) => (
                      <button
                        type="button"
                        key={slot}
                        onClick={() => setRescheduleSlot(slot)}
                        className={`py-1.5 px-2 rounded-lg text-xs font-semibold border tabular-nums ${
                          rescheduleSlot === slot
                            ? "bg-[#0E7490] text-white border-[#0E7490]"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRescheduleModalItem(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || !rescheduleSlot}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#0E7490] hover:bg-[#155E75] rounded-xl disabled:opacity-50"
                >
                  {actionLoading ? "Menyimpan..." : "Simpan Jadwal Baru"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function KelolaJanjiPage() {
  return (
    <RouteGuard allowedRoles={["resepsionis"]}>
      <AppLayout>
        <Suspense fallback={
          <div className="p-12 text-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#0E7490]" />
          </div>
        }>
          <KelolaJanjiContent />
        </Suspense>
      </AppLayout>
    </RouteGuard>
  );
}
