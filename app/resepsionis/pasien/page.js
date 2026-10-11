"use client";

import React, { useEffect, useState } from "react";
import RouteGuard from "@/components/RouteGuard";
import AppLayout from "@/components/AppLayout";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import {
  Users,
  Search,
  Phone,
  Mail,
  Loader2,
  AlertCircle,
  ShieldAlert,
} from "lucide-react";

export default function DataPasienResepsionisPage() {
  const [pasienList, setPasienList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPatients = async () => {
    setLoading(true);
    setError("");

    try {
      // Ambil pengguna dengan role "pasien"
      const q = query(
        collection(db, "users"),
        where("role", "==", "pasien")
      );
      const snap = await getDocs(q);
      const items = [];
      snap.forEach((d) => items.push({ id: d.id, ...d.data() }));

      // Urutkan nama abjad
      items.sort((a, b) => (a.nama || "").localeCompare(b.nama || ""));
      setPasienList(items);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat daftar pasien.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const filtered = pasienList.filter((p) => {
    const s = searchTerm.toLowerCase();
    const nameMatch = (p.nama || "").toLowerCase().includes(s);
    const emailMatch = (p.email || "").toLowerCase().includes(s);
    const phoneMatch = (p.noHp || "").includes(s);
    return nameMatch || emailMatch || phoneMatch;
  });

  return (
    <RouteGuard allowedRoles={["resepsionis"]}>
      <AppLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#0E7490] bg-cyan-50/80 px-2.5 py-1 rounded-full border border-cyan-100/60">
                  Meja Depan & Resepsionis
                </span>
                <span className="text-xs text-slate-400">• Direktori Pasien</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Data Kontak Pasien Rawat Jalan</h1>
              <p className="text-xs text-slate-500 mt-1">
                Buku kontak pasien klinik untuk koordinasi jadwal reservasi, konfirmasi, dan tautan komunikasi WhatsApp.
              </p>
            </div>
          </div>

          {/* Banner Batasan Privasi (PRD 4.8) */}
          <div className="p-4 bg-cyan-50/70 border border-cyan-100 rounded-2xl flex items-start gap-3 text-xs text-[#0E7490]">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Otorisasi Data Pasien (PRD 4.8):</span>
              <p className="text-slate-600 mt-0.5 leading-relaxed">
                Resepsionis hanya memiliki hak untuk mengakses nomor kontak (Nama, Surel, Nomor Telepon/WhatsApp). Catatan diagnosis dan rekam tindakan medis bersifat rahasia dan dikunci oleh sistem.
              </p>
            </div>
          </div>

          {/* Search Bar (Mediora Search Bar) */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari pasien berdasarkan nama, email, atau no HP..."
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/70 border border-slate-200/80 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="text-xs text-slate-500 hover:text-slate-800 font-semibold px-2.5"
              >
                Hapus
              </button>
            )}
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-14 text-center text-slate-500 shadow-xs">
              <Loader2 className="w-7 h-7 text-[#0E7490] animate-spin mx-auto mb-2" />
              <p className="text-xs font-medium">Memuat direktori kontak pasien...</p>
            </div>
          ) : error ? (
            <div className="p-6 bg-red-50/80 rounded-2xl border border-red-200 text-center text-red-600 text-xs">
              <AlertCircle className="w-5 h-5 mx-auto mb-2" />
              <p>{error}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-14 text-center text-slate-400 shadow-xs">
              <Users className="w-9 h-9 mx-auto mb-2.5 opacity-40 text-slate-500" />
              <p className="font-bold text-slate-800 text-sm">Pasien tidak ditemukan</p>
              <p className="text-xs text-slate-400 mt-1">Coba kata kunci pencarian yang lain.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-3.5 px-4">Nama Pasien</th>
                      <th className="py-3.5 px-4">Nomor Handphone (WhatsApp)</th>
                      <th className="py-3.5 px-4">Alamat Email</th>
                      <th className="py-3.5 px-4 text-center">Status Akun</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-cyan-100 text-[#0E7490] font-bold text-xs flex items-center justify-center border border-cyan-200 shrink-0">
                              {(p.nama || "P").charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">{p.nama || "Pasien"}</div>
                              <span className="text-[10px] text-slate-400 font-mono">UID: {p.id.slice(0, 10)}...</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-semibold text-slate-800 tabular-nums">
                          {p.noHp ? (
                            <a
                              href={`https://wa.me/62${p.noHp.replace(/^0/, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/70 hover:bg-emerald-100 text-[11px] font-bold transition"
                            >
                              <Phone className="w-3 h-3 text-emerald-600" />
                              {p.noHp}
                            </a>
                          ) : (
                            <span className="text-slate-400 font-normal">Belum diisi</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-slate-600 font-medium">
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span>{p.email}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          {p.aktif === false ? (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200/80">
                              Nonaktif
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                              Aktif
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </AppLayout>
    </RouteGuard>
  );
}
