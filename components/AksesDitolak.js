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
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-slate-200 p-7 text-center">
        <div className="w-12 h-12 bg-red-50 text-red-700 border border-red-200 rounded-md flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">Akses Dibatasi</h1>
        <p className="text-slate-600 mb-5 text-xs sm:text-sm leading-relaxed">
          {pesan}
        </p>

        {userData && (
          <div className="bg-slate-50 border border-slate-200 rounded-md p-3 mb-6 text-xs text-slate-600 text-left">
            <span className="text-slate-400 block text-[11px] mb-0.5">Peran akun aktif saat ini:</span>
            <span className="font-semibold text-slate-900">{getRoleLabel(userData.role)}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Link
            href={getHomeUrl()}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-[#0E7490] text-white font-medium text-xs hover:bg-[#155E75] transition shadow-sm"
          >
            <Home className="w-4 h-4" />
            Kembali ke Dasbor Saya
          </Link>
        </div>
      </div>
    </div>
  );
}
