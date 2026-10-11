"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Smile, Mail, Lock, LogIn, AlertCircle, Loader2 } from "lucide-react";

function MasukForm() {
  const { user, userData, loading, loginEmail, loginGoogle } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const getTargetUrl = (role) => {
    if (redirectParam) return redirectParam;
    switch (role) {
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

  useEffect(() => {
    if (!loading && user && userData) {
      if (userData.aktif === false) {
        setError("Akun Anda dinonaktifkan. Hubungi klinik.");
      } else {
        router.replace(getTargetUrl(userData.role));
      }
    }
  }, [user, userData, loading, router]);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Silakan lengkapi email dan kata sandi.");
      return;
    }

    setSubmitting(true);
    try {
      const profile = await loginEmail(email, password);
      if (profile && profile.aktif === false) {
        setError("Akun Anda dinonaktifkan. Hubungi klinik.");
        setSubmitting(false);
        return;
      }
      router.replace(getTargetUrl(profile?.role || "pasien"));
    } catch (err) {
      console.error(err);
      if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        setError("Email atau kata sandi tidak sesuai.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Terlalu banyak percobaan gagal. Silakan coba lagi nanti.");
      } else if (err.message && err.message.includes("CONFIGURATION_NOT_FOUND")) {
        setError("Firebase Authentication belum diaktifkan di konsol Firebase. Silakan aktifkan Email/Password.");
      } else {
        setError(err.message || "Gagal masuk. Silakan periksa kembali akun Anda.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setSubmitting(true);
    try {
      const profile = await loginGoogle();
      if (profile && profile.aktif === false) {
        setError("Akun Anda dinonaktifkan. Hubungi klinik.");
        setSubmitting(false);
        return;
      }
      router.replace(getTargetUrl(profile?.role || "pasien"));
    } catch (err) {
      console.error(err);
      if (err.code !== "auth/popup-closed-by-user") {
        setError(err.message || "Gagal masuk dengan Google.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7F9] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-2">
          <div className="w-12 h-12 bg-[#0E7490] text-white rounded-2xl flex items-center justify-center shadow-md">
            <Smile className="w-7 h-7" />
          </div>
        </Link>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Masuk ke Portal</h2>
        <p className="text-sm text-slate-500 mt-1">Klinik Gigi Senyum Rekah</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200/80 rounded-2xl sm:px-10">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="block w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E7490]/20 focus:border-[#0E7490] transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="block w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E7490]/20 focus:border-[#0E7490] transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-[#0E7490] hover:bg-[#155E75] shadow-sm disabled:opacity-50 transition"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Masuk
                </>
              )}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-slate-400 font-medium">atau</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={submitting}
              className="mt-4 w-full flex items-center justify-center gap-2.5 py-2.5 px-4 border border-slate-300 rounded-xl shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 transition"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              Masuk dengan Google
            </button>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Belum punya akun pasien?{" "}
              <Link href="/daftar" className="font-semibold text-[#0E7490] hover:underline">
                Daftar sekarang
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MasukPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#F4F7F9]">
        <Loader2 className="w-8 h-8 text-[#0E7490] animate-spin" />
      </div>
    }>
      <MasukForm />
    </Suspense>
  );
}
