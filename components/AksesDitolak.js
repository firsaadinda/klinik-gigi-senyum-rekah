"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AksesDitolak({ pesan = "Anda tidak memiliki izin untuk mengakses halaman ini." }) {
  const { userData } = useAuth();

  const getHomeUrl = () => {
    if (!userData) return "/masuk";
    switch (userData.role) {
      case "resepsionis":
        return "/resepsionis";
      case "dokter":
        return "/dokter";
      case "super_admin":
        return "/admin";
      default:
        return "/beranda";
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case "resepsionis":
        return "Resepsionis";
      case "dokter":
        return "Dokter";
      case "super_admin":
        return "Super Admin";
      default:
        return "Pasien";
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-5">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Akses Ditolak</h1>
        <p className="text-slate-600 mb-6 text-sm leading-relaxed">
          {pesan}
        </p>

        {userData && (
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 mb-6 text-xs text-slate-500">
            Peran akun Anda saat ini: <span className="font-semibold text-slate-700">{getRoleLabel(userData.role)}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={getHomeUrl()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#0E7490] text-white font-medium text-sm hover:bg-[#155E75] transition"
          >
            <Home className="w-4 h-4" />
            Kembali ke Dasbor Saya
          </Link>
        </div>
      </div>
    </div>
  );
}
