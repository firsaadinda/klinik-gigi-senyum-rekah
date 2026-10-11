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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Data Kontak Pasien</h1>
              <p className="text-xs text-slate-500 mt-1">
                Buku kontak pasien klinik untuk keperluan konfirmasi kedatangan dan nomor WhatsApp.
              </p>
            </div>
          </div>

          {/* Banner Batasan v1 (PRD 4.8) */}
          <div className="p-4 bg-cyan-50/70 border border-cyan-200 rounded-2xl flex items-start gap-3 text-xs text-[#0E7490]">
            <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Privasi Rekam Medis (PRD 4.8):</span>
              <p className="text-slate-600 mt-0.5">
                Resepsionis hanya memiliki hak untuk melihat kontak (Nama, Email, Nomor HP). Catatan perawatan dan rekam medis pasien dirahasiakan dan tidak ditampilkan di modul ini.
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari pasien berdasarkan nama, email, atau no HP..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E7490]/20"
              />
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="text-xs text-slate-500 hover:text-slate-800 font-semibold px-2"
              >
                Hapus
              </button>
            )}
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
              <Loader2 className="w-8 h-8 text-[#0E7490] animate-spin mx-auto mb-2" />
              <p className="text-sm">Memuat buku pasien...</p>
            </div>
          ) : error ? (
            <div className="p-6 bg-red-50 rounded-2xl border border-red-200 text-center text-red-600 text-sm">
              <AlertCircle className="w-6 h-6 mx-auto mb-2" />
              <p>{error}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
              <Users className="w-10 h-10 mx-auto mb-2 opacity-40 text-slate-500" />
              <p className="font-semibold text-slate-700">Pasien tidak ditemukan</p>
              <p className="text-xs text-slate-400 mt-1">Coba kata kunci pencarian yang lain.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4">Nama Pasien</th>
                      <th className="py-3 px-4">Nomor Handphone (WhatsApp)</th>
                      <th className="py-3 px-4">Alamat Email</th>
                      <th className="py-3 px-4 text-center">Status Akun</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/60 transition">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-800">{p.nama || "Pasien"}</div>
                          <span className="text-[10px] text-slate-400 font-mono">UID: {p.id.slice(0, 10)}...</span>
                        </td>

                        <td className="py-3.5 px-4 font-semibold text-slate-700 tabular-nums">
                          {p.noHp ? (
                            <a
                              href={`https://wa.me/62${p.noHp.replace(/^0/, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-emerald-700 hover:underline"
                            >
                              <Phone className="w-3.5 h-3.5 text-emerald-600" />
                              {p.noHp}
                            </a>
                          ) : (
                            <span className="text-slate-400 font-normal">Belum diisi</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span>{p.email}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          {p.aktif === false ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-50 text-red-700 border border-red-200">
                              Nonaktif
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
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
