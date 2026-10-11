"use client";

import React, { useEffect, Suspense } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import AksesDitolak from "./AksesDitolak";
import { Loader2, AlertTriangle } from "lucide-react";

function RouteGuardContent({ allowedRoles = [], children }) {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/masuk?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [user, loading, pathname, router]);

  // 1. Tampilkan layar Memuat... selama auth dan profil role belum selesai dibaca
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F4F7F9]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-[#0E7490] animate-spin" />
          <p className="text-slate-600 font-medium text-sm animate-pulse">
            Memuat profil & izin akses...
          </p>
        </div>
      </div>
    );
  }

  // 2. Jika belum login, tunggu pengalihan
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F7F9]">
        <p className="text-slate-500 text-sm">Mengarahkan ke halaman masuk...</p>
      </div>
    );
  }

  // 3. Jika profil belum terbaca
  if (!userData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F4F7F9]">
        <Loader2 className="w-8 h-8 text-[#0E7490] animate-spin mb-2" />
        <p className="text-slate-600 text-sm">Menyiapkan profil akun...</p>
      </div>
    );
  }

  // 4. Jika akun dinonaktifkan
  if (userData.aktif === false) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#F4F7F9]">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-amber-200 p-7 text-center">
          <div className="w-12 h-12 bg-amber-50 text-amber-700 border border-amber-200 rounded-md flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">Akun Dinonaktifkan</h2>
          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-6">
            Akun Anda dinonaktifkan. Hubungi klinik jika Anda merasa ini adalah kekeliruan.
          </p>
          <button
            onClick={() => window.location.href = "/masuk"}
            className="px-4 py-2 rounded-md bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition"
          >
            Keluar & Kembali
          </button>
        </div>
      </div>
    );
  }

  // 5. Cek otorisasi peran (super_admin bypass)
  const isSuperAdmin = userData.role === "super_admin";
  const hasAllowedRole = allowedRoles.length === 0 || allowedRoles.includes(userData.role);

  if (!isSuperAdmin && !hasAllowedRole) {
    return <AksesDitolak />;
  }

  return <>{children}</>;
}

export default function RouteGuard({ allowedRoles = [], children }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#F4F7F9]">
          <Loader2 className="w-10 h-10 text-[#0E7490] animate-spin" />
        </div>
      }
    >
      <RouteGuardContent allowedRoles={allowedRoles}>
        {children}
      </RouteGuardContent>
    </Suspense>
  );
}
