"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Mail, Lock, AlertCircle, Loader2, ArrowRight, Sparkles, CheckCircle2, Eye, EyeOff } from "lucide-react";
import Logo from "@/components/Logo";

function MasukForm() {
  const { user, userData, loading, loginEmail, loginGoogle } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const getTargetUrl = (role) => {
    if (redirectParam) return redirectParam;
    switch (role) {
      case "resepsionis": return "/resepsionis";
      case "dokter": return "/dokter";
      case "super_admin": return "/admin";
      default: return "/beranda";
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
    const cleanedEmail = email.replace(/[\u200B-\u200D\uFEFF]/g, "").trim();
    const cleanedPassword = password.replace(/[\u200B-\u200D\uFEFF]/g, "").trim();

    if (!cleanedEmail || !cleanedPassword) {
      setError("Silakan lengkapi email dan kata sandi.");
      return;
    }
    setSubmitting(true);
    try {
      const profile = await loginEmail(cleanedEmail, cleanedPassword);
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
        setError("Firebase Authentication belum diaktifkan di konsol Firebase.");
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
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#f8fcfe] font-sans selection:bg-cyan-100 selection:text-cyan-900">
      {/* Left Panel: Dantoa Clean Dental Brand Showcase */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-5/12 bg-[#e9f7fb] border-r border-cyan-100 flex-col p-10 xl:p-14 relative overflow-hidden">
        {/* Subtle dot pattern */}
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="relative z-10 shrink-0 mb-12 xl:mb-16">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <Logo size="lg" />
            <div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900 block group-hover:text-[#06b6d4] transition">
                Senyum Rekah
              </span>
              <span className="text-[10px] tracking-widest uppercase font-bold text-cyan-600 block">
                Dental Care & Clinic
              </span>
            </div>
          </Link>
        </div>

        {/* Center Visual Card: Naik Sejajar dengan Form */}
        <div className="relative z-10 space-y-6">
          <h2 className="text-3xl font-extrabold text-slate-900 leading-tight">
            Portal Janji Temu <br />
            <span className="text-[#06b6d4]">Klinik Senyum Rekah</span>
          </h2>

          <p className="text-slate-600 text-sm leading-relaxed max-w-md">
            Aplikasi resmi untuk membuat janji temu secara mandiri, memilih slot jam kosong tanpa jadwal bentrok, dan memantau riwayat tindakan perawatan.
          </p>

          <div className="space-y-3 pt-2">
            {[
              "Pilih dokter gigi & slot jam yang masih kosong",
              "Masuk cepat dengan Akun Google atau Email",
              "Riwayat tindakan dokter tersimpan rapi & aman",
            ].map((text, idx) => (
              <div key={idx} className="flex items-center gap-2.5 text-xs font-bold text-slate-700">
                <div className="w-5 h-5 rounded-full bg-cyan-100 text-[#06b6d4] flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom stats info */}
        <div className="relative z-10 mt-auto pt-8 border-t border-cyan-200/80 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span className="font-semibold text-slate-700">Makassar, Sulawesi Selatan</span>
          <span className="text-cyan-700 font-bold">09:00 – 15:00 WITA</span>
        </div>
      </div>

      {/* Right Panel: Clean White Login Card */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-12">
        {/* Mobile Logo */}
        <div className="lg:hidden mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-3">
            <Logo size="md" />
            <div className="text-left">
              <span className="font-bold text-slate-900 text-base block">Senyum Rekah</span>
              <span className="text-xs text-slate-500">Dental Clinic Portal</span>
            </div>
          </Link>
        </div>

        <div className="w-full max-w-md mx-auto bg-white p-8 sm:p-10 rounded-3xl shadow-[0_4px_25px_rgba(0,180,216,0.08)] border border-slate-100">
          <div className="mb-8">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#06b6d4]">
              • SELAMAT DATANG •
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Masuk ke Portal
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Gunakan akun pasien atau staf klinik Anda untuk melanjutkan.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Quick Google Login */}
          <button
            id="btn-masuk-google"
            type="button"
            onClick={handleGoogleLogin}
            disabled={submitting}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-slate-200 hover:border-cyan-300 rounded-full text-xs font-bold text-slate-700 bg-white hover:bg-cyan-50/50 disabled:opacity-60 transition shadow-xs active:scale-[0.98]"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
            </svg>
            Masuk Cepat dengan Google
          </button>

          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">atau email</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="login-email" className="block text-xs font-bold text-slate-700">
                Alamat Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full pl-11 pr-4 py-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-[#06b6d4] focus:ring-4 focus:ring-cyan-500/10 focus:outline-none transition font-medium text-slate-900"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="login-password" className="block text-xs font-bold text-slate-700">
                Kata Sandi
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 8 karakter kombinasi"
                  className="w-full pl-11 pr-11 py-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-[#06b6d4] focus:ring-4 focus:ring-cyan-500/10 focus:outline-none transition font-medium text-slate-900"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Sembunyikan kata sandi" : "Lihat kata sandi"}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 focus:outline-none transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                Kombinasi huruf besar, huruf kecil, angka, dan simbol khusus (min. 8 karakter).
              </p>
            </div>

            <button
              type="submit"
              id="btn-masuk-email"
              disabled={submitting}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3.5 px-6 rounded-full text-xs font-extrabold uppercase tracking-wider text-white bg-gradient-to-r from-[#00c5de] to-[#06b6d4] hover:from-[#06b6d4] hover:to-[#0891b2] shadow-md shadow-cyan-500/25 disabled:opacity-60 transition active:scale-[0.98]"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Memverifikasi...
                </>
              ) : (
                <>
                  Masuk ke Akun
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              Belum memiliki akun pasien?{" "}
              <Link href="/daftar" className="font-extrabold text-[#06b6d4] hover:underline">
                Daftar Pasien Baru
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
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <Loader2 className="w-6 h-6 text-[#06b6d4] animate-spin" />
        </div>
      }
    >
      <MasukForm />
    </Suspense>
  );
}
