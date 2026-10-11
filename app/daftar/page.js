"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AlertCircle, Loader2, User, Mail, Phone, Lock, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import Logo from "@/components/Logo";

export default function DaftarPage() {
  const { registerEmail, loginGoogle } = useAuth();
  const router = useRouter();

  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [noHp, setNoHp] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!nama.trim()) { setError("Nama lengkap wajib diisi."); return; }
    if (!email.trim()) { setError("Alamat email wajib diisi."); return; }
    const cleanPhone = noHp.trim();
    if (!/^08[0-9]{8,12}$/.test(cleanPhone)) {
      setError("Nomor HP harus berupa angka dan diawali dengan '08' (10-14 digit).");
      return;
    }
    if (!password) { setError("Kata sandi wajib diisi."); return; }
    if (password.startsWith(" ") || password.endsWith(" ")) {
      setError("Kata sandi tidak boleh diawali atau diakhiri dengan spasi.");
      return;
    }
    if (password.length < 8) {
      setError("Kata sandi minimal 8 karakter (kurang dari 8 karakter ditolak oleh sistem).");
      return;
    }
    if (!/[a-z]/.test(password)) {
      setError("Kata sandi harus mengandung minimal satu huruf kecil (a-z).");
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setError("Kata sandi harus mengandung minimal satu huruf besar / kapital (A-Z).");
      return;
    }
    if (!/[0-9]/.test(password)) {
      setError("Kata sandi harus mengandung minimal satu angka (0-9).");
      return;
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      setError("Kata sandi harus mengandung minimal satu simbol khusus (contoh: !, @, #, $, %).");
      return;
    }

    setSubmitting(true);
    try {
      await registerEmail(nama.trim(), email.trim(), cleanPhone, password);
      router.replace("/beranda");
    } catch (err) {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        setError("Alamat email ini sudah terdaftar. Silakan gunakan email lain atau masuk.");
      } else if (err.code === "auth/invalid-email") {
        setError("Format alamat email tidak valid.");
      } else if (err.code === "auth/weak-password") {
        setError("Kata sandi terlalu lemah.");
      } else if (err.message && err.message.includes("CONFIGURATION_NOT_FOUND")) {
        setError("Firebase Authentication belum diaktifkan di konsol Firebase.");
      } else {
        setError(err.message || "Gagal mendaftar. Silakan coba beberapa saat lagi.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError("");
    setSubmitting(true);
    try {
      await loginGoogle();
      router.replace("/beranda");
    } catch (err) {
      console.error(err);
      if (err.code !== "auth/popup-closed-by-user") {
        setError(err.message || "Gagal mendaftar dengan Google.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = "w-full pl-11 pr-4 py-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-[#06b6d4] focus:ring-4 focus:ring-cyan-500/10 focus:outline-none transition font-medium text-slate-900";

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#f8fcfe] font-sans selection:bg-cyan-100 selection:text-cyan-900">
      {/* Left Panel: Dantoa Clean Dental Brand Showcase (Sticky Full Screen Height) */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-5/12 bg-[#e9f7fb] border-r border-cyan-100 flex-col justify-between p-8 xl:p-12 sticky top-0 h-screen overflow-hidden">
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="relative z-10 shrink-0">
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

        {/* Content: Terpusat Pas di Tengah Layar */}
        <div className="relative z-10 my-auto py-6 space-y-5">
          <h2 className="text-2xl xl:text-3xl font-extrabold text-slate-900 leading-tight">
            Pendaftaran Pasien <br />
            <span className="text-[#06b6d4]">Klinik Senyum Rekah</span>
          </h2>

          <p className="text-slate-600 text-xs xl:text-sm leading-relaxed max-w-md">
            Pendaftaran akun pasien untuk membuat janji temu online secara mandiri, melihat status konfirmasi, dan mengakses catatan perawatan dokter.
          </p>

          <div className="space-y-3 pt-1">
            {[
              "Pilih dokter gigi & slot jam yang masih tersedia",
              "Konfirmasi kehadiran diverifikasi oleh meja depan",
              "Riwayat tindakan dokter tersimpan di akun Anda",
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

        {/* Bottom stats info: Selalu Kelihatan di Bawah Layar */}
        <div className="relative z-10 pt-4 border-t border-cyan-200/80 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span className="font-semibold text-slate-700">Makassar, Sulawesi Selatan</span>
          <span className="text-cyan-700 font-bold">09:00 – 15:00 WITA</span>
        </div>
      </div>

      {/* Right Panel: White Register Card */}
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
              • REGISTRASI PASIEN •
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Buat Akun Baru
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Lengkapi informasi singkat berikut untuk mulai reservasi.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Google Signup */}
          <button
            id="btn-daftar-google"
            type="button"
            onClick={handleGoogleSignup}
            disabled={submitting}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-slate-200 hover:border-cyan-300 rounded-full text-xs font-bold text-slate-700 bg-white hover:bg-cyan-50/50 disabled:opacity-60 transition shadow-xs active:scale-[0.98]"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
            </svg>
            Daftar Cepat dengan Google
          </button>

          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">atau formulir</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="daftar-nama" className="block text-xs font-bold text-slate-700">
                Nama Lengkap Pasien <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input id="daftar-nama" type="text" required value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Nama sesuai KTP" className={inputCls} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="daftar-email" className="block text-xs font-bold text-slate-700">
                Alamat Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input id="daftar-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contoh@gmail.com" className={inputCls} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="daftar-hp" className="block text-xs font-bold text-slate-700">
                Nomor WhatsApp <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input id="daftar-hp" type="tel" required value={noHp} onChange={(e) => setNoHp(e.target.value)} placeholder="081234567890" className={`${inputCls} tabular-nums`} />
              </div>
              <p className="text-[11px] text-slate-400">Format: diawali 08 (minimal 10 digit)</p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="daftar-password" className="block text-xs font-bold text-slate-700">
                Kata Sandi <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  id="daftar-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 8 karakter kombinasi"
                  className={inputCls}
                />
              </div>

              {/* Panduan Karakter Kata Sandi */}
              <div className="p-3 bg-cyan-50/60 rounded-2xl border border-cyan-100 text-[11px] text-slate-600 space-y-1">
                <p className="font-extrabold text-cyan-800">Ketentuan Kata Sandi:</p>
                <ul className="space-y-0.5 list-disc list-inside text-slate-600">
                  <li><strong>Panjang:</strong> Minimal 8 karakter (huruf, angka, atau simbol).</li>
                  <li><strong>Kombinasi Wajib:</strong> Huruf kecil (a-z), huruf besar (A-Z), angka (0-9), dan simbol khusus (!, @, #, $, dll).</li>
                  <li><strong>Spasi:</strong> Dilarang berada di awal atau di akhir kata sandi.</li>
                </ul>
              </div>
            </div>

            <button
              id="btn-daftar-submit"
              type="submit"
              disabled={submitting}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3.5 px-6 rounded-full text-xs font-extrabold uppercase tracking-wider text-white bg-gradient-to-r from-[#00c5de] to-[#06b6d4] hover:from-[#06b6d4] hover:to-[#0891b2] shadow-md shadow-cyan-500/25 disabled:opacity-60 transition active:scale-[0.98]"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Mendaftarkan Akun...
                </>
              ) : (
                <>
                  Daftar Akun Pasien
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              Sudah memiliki akun?{" "}
              <Link href="/masuk" className="font-extrabold text-[#06b6d4] hover:underline">
                Masuk di sini
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
