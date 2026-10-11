"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import RouteGuard from "@/components/RouteGuard";
import AppLayout from "@/components/AppLayout";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import {
  Users,
  Search,
  Shield,
  ArrowRight,
  Loader2,
  AlertCircle,
  UserCheck,
  UserX,
  ChevronRight,
} from "lucide-react";

export default function KelolaPenggunaPage() {
  const { user } = useAuth();
  const [usersList, setUsersList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("semua");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadUsers = async () => {
    setLoading(true);
    setError("");

    try {
      const snap = await getDocs(collection(db, "users"));
      const items = [];
      snap.forEach((d) => items.push({ id: d.id, ...d.data() }));

      // Urutkan nama
      items.sort((a, b) => (a.nama || "").localeCompare(b.nama || ""));
      setUsersList(items);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat daftar pengguna.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const getRoleBadge = (role) => {
    switch (role) {
      case "super_admin":
        return <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-amber-300">Super Admin</span>;
      case "dokter":
        return <span className="bg-purple-100 text-purple-800 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-purple-300">Dokter</span>;
      case "resepsionis":
        return <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-blue-300">Resepsionis</span>;
      default:
        return <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-emerald-300">Pasien</span>;
    }
  };

  const filtered = usersList.filter((u) => {
    const s = searchTerm.toLowerCase();
    const nameMatch = (u.nama || "").toLowerCase().includes(s);
    const emailMatch = (u.email || "").toLowerCase().includes(s);
    const roleMatch = roleFilter === "semua" || u.role === roleFilter;
    return (nameMatch || emailMatch) && roleMatch;
  });

  return (
    <RouteGuard allowedRoles={["super_admin"]}>
      <AppLayout>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Kelola Pengguna & Peran</h1>
              <p className="text-xs text-slate-500 mt-1">
                Atur peran sistem (Pasien, Resepsionis, Dokter, Super Admin) dan status akun sesuai PRD 4.13.
              </p>
            </div>
            <button
              onClick={loadUsers}
              className="text-xs font-semibold px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-sm"
            >
              Segarkan Data
            </button>
          </div>

          {/* Saringan dan Pencarian */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari nama atau email pengguna..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
              <span className="text-xs font-semibold text-slate-400 mr-1">Peran:</span>
              {["semua", "super_admin", "dokter", "resepsionis", "pasien"].map((r) => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-3 py-1 rounded-xl text-xs font-medium capitalize whitespace-nowrap transition ${
                    roleFilter === r
                      ? "bg-[#0E7490] text-white"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {r === "super_admin" ? "Admin" : r}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
              <Loader2 className="w-8 h-8 text-[#0E7490] animate-spin mx-auto mb-2" />
              <p className="text-sm">Memuat daftar akun pengguna...</p>
            </div>
          ) : error ? (
            <div className="p-6 bg-red-50 text-red-600 rounded-xl text-center text-xs">
              <p>{error}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
              <Users className="w-10 h-10 mx-auto mb-2 opacity-40 text-slate-500" />
              <p className="font-semibold text-slate-700">Pengguna tidak ditemukan</p>
              <p className="text-xs text-slate-400 mt-1">Coba kata kunci pencarian yang lain.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4">Nama Pengguna</th>
                      <th className="py-3 px-4">Alamat Email</th>
                      <th className="py-3 px-4">Peran (Role)</th>
                      <th className="py-3 px-4">Status Akun</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.map((u) => {
                      const isSelf = u.id === user.uid;
                      return (
                        <tr key={u.id} className="hover:bg-slate-50/60 transition">
                          <td className="py-3.5 px-4">
                            <Link
                              href={`/admin/pengguna/${u.id}`}
                              className="font-bold text-slate-800 hover:text-[#0E7490] block"
                            >
                              {u.nama || "Tanpa Nama"} {isSelf && <span className="text-[10px] text-[#0E7490] font-normal">(Anda)</span>}
                            </Link>
                            <span className="text-[10px] text-slate-400 font-mono">UID: {u.id.slice(0, 12)}...</span>
                          </td>

                          <td className="py-3.5 px-4 text-slate-600">
                            {u.email}
                          </td>

                          <td className="py-3.5 px-4">
                            {getRoleBadge(u.role)}
                          </td>

                          <td className="py-3.5 px-4">
                            {u.aktif === false ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200">
                                <UserX className="w-3 h-3" />
                                Nonaktif
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <UserCheck className="w-3 h-3" />
                                Aktif
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <Link
                              href={`/admin/pengguna/${u.id}`}
                              className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-100 hover:bg-[#0E7490] hover:text-white text-slate-700 font-semibold text-[11px] transition"
                            >
                              Edit Peran
                              <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
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
