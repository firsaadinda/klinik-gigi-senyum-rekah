"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import RouteGuard from "@/components/RouteGuard";
import AppLayout from "@/components/AppLayout";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import {
  BarChart3,
  Calendar,
  Stethoscope,
  ClipboardList,
  CheckCircle2,
  Loader2,
  AlertCircle,
  FileSpreadsheet,
} from "lucide-react";

function LaporanContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlMonth = searchParams.get("bulan") || "";
  const [selectedMonth, setSelectedMonth] = useState(urlMonth);

  useEffect(() => {
    if (!selectedMonth) {
      const now = new Date().toISOString().slice(0, 7);
      setSelectedMonth(now);
    }
  }, [selectedMonth]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [doctorReports, setDoctorReports] = useState([]);
  const [serviceReports, setServiceReports] = useState([]);
  const [totalVisits, setTotalVisits] = useState(0);

  const handleMonthChange = (newMonth) => {
    setSelectedMonth(newMonth);
    router.replace(`/admin/laporan?bulan=${newMonth}`);
  };

  const loadReportData = async () => {
    setLoading(true);
    setError("");

    try {
      // PRD 4.16: Kunjungan dihitung dari janji berstatus "selesai"
      const qDone = query(
        collection(db, "janji_temu"),
        where("status", "==", "selesai")
      );
      const snapDone = await getDocs(qDone);

      // Filter janji pada bulan yang dipilih
      const monthAppointments = [];
      snapDone.forEach((d) => {
        const item = d.data();
        if (item.tanggal && item.tanggal.startsWith(selectedMonth)) {
          monthAppointments.push({ id: d.id, ...item });
        }
      });

      setTotalVisits(monthAppointments.length);

      // 1. Rekap Per Dokter
      const doctorCountMap = {};
      monthAppointments.forEach((a) => {
        const dId = a.dokterId || "unknown";
        doctorCountMap[dId] = (doctorCountMap[dId] || 0) + 1;
      });

      const docReports = [];
      for (const dId of Object.keys(doctorCountMap)) {
        let doctorName = "Dokter Gigi";
        if (dId !== "unknown") {
          try {
            const dSnap = await getDoc(doc(db, "users", dId));
            if (dSnap.exists()) doctorName = dSnap.data().nama;
          } catch {}
        }
        docReports.push({
          id: dId,
          doctorName,
          count: doctorCountMap[dId],
        });
      }
      docReports.sort((a, b) => b.count - a.count);
      setDoctorReports(docReports);

      // 2. Rekap Per Layanan
      const serviceCountMap = {};
      monthAppointments.forEach((a) => {
        const lId = a.layananId || "unknown";
        serviceCountMap[lId] = (serviceCountMap[lId] || 0) + 1;
      });

      const sReports = [];
      for (const lId of Object.keys(serviceCountMap)) {
        let serviceName = "Layanan";
        let serviceDuration = 30;
        if (lId !== "unknown") {
          try {
            const lSnap = await getDoc(doc(db, "layanan", lId));
            if (lSnap.exists()) {
              serviceName = lSnap.data().nama;
              serviceDuration = lSnap.data().durasiMenit || 30;
            }
          } catch {}
        }
        sReports.push({
          id: lId,
          serviceName,
          serviceDuration,
          count: serviceCountMap[lId],
        });
      }
      sReports.sort((a, b) => b.count - a.count);
      setServiceReports(sReports);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat data laporan kunjungan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReportData();
  }, [selectedMonth]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Laporan Kunjungan Klinik</h1>
          <p className="text-xs text-slate-500 mt-1">
            Rekapitulasi jumlah pasien selesai per dokter dan per layanan per bulan (PRD 4.16).
          </p>
        </div>

        {/* Pemilih Bulan Tersimpan di URL */}
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm">
          <Calendar className="w-4 h-4 text-[#0E7490]" />
          <label className="text-xs font-semibold text-slate-700">Pilih Bulan:</label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => handleMonthChange(e.target.value)}
            className="text-xs font-bold text-slate-800 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200 focus:outline-none"
          />
        </div>
      </div>

      {/* Ringkasan Total Kunjungan */}
      <div className="bg-gradient-to-r from-[#0E7490] to-[#155E75] text-white p-6 rounded-2xl shadow-sm flex items-center justify-between">
        <div>
          <span className="text-xs text-cyan-200 uppercase font-semibold tracking-wider">
            Total Pasien Selesai Ditangani
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tabular-nums">
              {loading ? "..." : totalVisits}
            </span>
            <span className="text-xs text-cyan-100">kunjungan pada periode {selectedMonth}</span>
          </div>
        </div>
        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
          <BarChart3 className="w-6 h-6 text-white" />
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
          <Loader2 className="w-8 h-8 text-[#0E7490] animate-spin mx-auto mb-2" />
          <p className="text-sm">Menghitung laporan bulanan...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 text-red-600 rounded-xl text-center text-xs">
          <p>{error}</p>
        </div>
      ) : totalVisits === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
          <BarChart3 className="w-10 h-10 mx-auto mb-2 opacity-40 text-slate-500" />
          <p className="font-semibold text-slate-700">Belum ada kunjungan selesai pada bulan {selectedMonth}</p>
          <p className="text-xs text-slate-400 mt-1">
            Data rekapitulasi akan muncul otomatis saat dokter menandai janji selesai.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tabel 1: Kunjungan per Dokter (PRD 4.16) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-[#0E7490]" />
                1. Kunjungan Selesai per Dokter
              </h3>
              <span className="text-xs text-slate-400">{doctorReports.length} Dokter</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-2.5 px-3">Nama Dokter Gigi</th>
                    <th className="py-2.5 px-3 text-right">Jumlah Kunjungan</th>
                    <th className="py-2.5 px-3 text-right">Persentase</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {doctorReports.map((d) => {
                    const pct = totalVisits > 0 ? Math.round((d.count / totalVisits) * 100) : 0;
                    return (
                      <tr key={d.id} className="hover:bg-slate-50/60">
                        <td className="py-3 px-3 font-semibold text-slate-800">
                          {d.doctorName}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-slate-800 tabular-nums">
                          {d.count} pasien
                        </td>
                        <td className="py-3 px-3 text-right text-slate-500 tabular-nums">
                          {pct}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tabel 2: Kunjungan per Layanan (PRD 4.16) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-[#0E7490]" />
                2. Kunjungan Selesai per Layanan
              </h3>
              <span className="text-xs text-slate-400">{serviceReports.length} Jenis Layanan</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-2.5 px-3">Jenis Layanan</th>
                    <th className="py-2.5 px-3 text-right">Jumlah Kunjungan</th>
                    <th className="py-2.5 px-3 text-right">Persentase</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {serviceReports.map((s) => {
                    const pct = totalVisits > 0 ? Math.round((s.count / totalVisits) * 100) : 0;
                    return (
                      <tr key={s.id} className="hover:bg-slate-50/60">
                        <td className="py-3 px-3 font-semibold text-slate-800">
                          {s.serviceName}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-slate-800 tabular-nums">
                          {s.count} kali
                        </td>
                        <td className="py-3 px-3 text-right text-slate-500 tabular-nums">
                          {pct}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LaporanPage() {
  return (
    <RouteGuard allowedRoles={["super_admin"]}>
      <AppLayout>
        <Suspense fallback={
          <div className="p-12 text-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#0E7490]" />
          </div>
        }>
          <LaporanContent />
        </Suspense>
      </AppLayout>
    </RouteGuard>
  );
}
