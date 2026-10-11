"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Logo from "@/components/Logo";
import {
  Calendar,
  Clock,
  ShieldCheck,
  MapPin,
  Loader2,
  ArrowRight,
  CheckCircle,
  Phone,
  Sparkles,
  ChevronRight,
  Smile,
  Users,
  FileText,
  Stethoscope,
} from "lucide-react";

export default function Home() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user && userData) {
      if (userData.role === "resepsionis") router.replace("/resepsionis");
      else if (userData.role === "dokter") router.replace("/dokter");
      else if (userData.role === "super_admin") router.replace("/admin");
      else router.replace("/beranda");
    }
  }, [user, userData, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 text-[#06B6D4] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-800 font-sans selection:bg-cyan-100 selection:text-cyan-900">
      {/* 1. Baris Info Atas (Sesuai PRD Bab 1: Jam Buka & Lokasi Makassar) */}
      <div className="bg-[#0b1325] text-slate-300 text-xs py-2.5 px-4 sm:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-6 text-[11px] sm:text-xs">
            <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
              <Phone className="w-3.5 h-3.5 text-cyan-400" />
              0812-3456-7890
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              Makassar, Sulawesi Selatan
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px] sm:text-xs">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              Senin – Sabtu: 09:00 – 15:00 WITA
            </span>
          </div>
        </div>
      </div>

      {/* 2. Navigasi Utama (Dantoa Dental Theme) */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
          {/* Logo Klinik */}
          <Link href="/" className="flex items-center gap-3 group">
            <Logo size="lg" />
            <div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-[#06b6d4] transition block">
                Senyum Rekah
              </span>
              <span className="text-[10px] tracking-widest uppercase font-bold text-cyan-600 block">
                Portal Janji Temu Klinik Gigi
              </span>
            </div>
          </Link>

          {/* Menu Navigasi Bahasa Indonesia Sesuai PRD */}
          <nav className="hidden lg:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-slate-700">
            <Link href="#hero" className="text-[#06b6d4] hover:text-[#0891b2] transition">Beranda</Link>
            <Link href="#alur" className="hover:text-[#06b6d4] transition">Alur Pelayanan</Link>
          </nav>

          {/* Tombol Aksi */}
          <div className="flex items-center gap-3">
            <Link
              href="/masuk"
              className="px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-slate-700 hover:text-[#06b6d4] transition rounded-full hover:bg-slate-50"
            >
              MASUK
            </Link>
            <Link
              href="/daftar"
              className="px-6 py-2.5 text-xs font-extrabold uppercase tracking-wider text-white rounded-full bg-gradient-to-r from-[#00c5de] to-[#06b6d4] hover:from-[#06b6d4] hover:to-[#0891b2] shadow-md shadow-cyan-500/25 transition active:scale-95 flex items-center gap-2"
            >
              <span>Buat Janji Temu</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* 3. Hero Section Baru: Satu Kesatuan Kanvas Bersih & Menyatu */}
        <section id="hero" className="relative bg-gradient-to-b from-[#f0f9fc] via-[#f7fcfe] to-white py-16 lg:py-20 border-b border-cyan-100/70 scroll-mt-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
            {/* Bagian Atas: Headline Utama, Paragraf, dan Tombol CTA Berada di Tengah (Centered) */}
            <div className="max-w-3xl mx-auto text-center space-y-6 pb-10 border-b border-cyan-100/80">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.18]">
                Jadwal Perawatan Gigi <br />
                <span className="text-[#06b6d4]">Anda yang Tentukan</span>
              </h1>
              
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
                Selamat datang di portal Klinik Gigi Senyum Rekah Makassar. Nikmati kemudahan mengatur jadwal kunjungan secara mandiri. Cek ketersediaan jam praktik dan pilih dokter Anda langsung dari layar, kapan pun Anda butuhkan.
              </p>

              {/* Tombol CTA di Tengah */}
              <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
                <Link
                  href="/daftar"
                  id="hero-btn-readmore"
                  className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[#00c5de] to-[#06b6d4] hover:from-[#06b6d4] hover:to-[#0891b2] text-white text-xs sm:text-sm font-extrabold uppercase tracking-wider shadow-lg shadow-cyan-500/25 transition-all hover:shadow-cyan-500/40 active:scale-95 flex items-center gap-2"
                >
                  <span>Daftar Pasien Baru</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/masuk"
                  className="px-8 py-3.5 rounded-full bg-white hover:bg-slate-50 text-slate-800 hover:text-cyan-600 text-xs sm:text-sm font-extrabold uppercase tracking-wider border border-slate-200 shadow-2xs transition active:scale-95"
                >
                  MASUK KE AKUN
                </Link>
              </div>
            </div>

            {/* Bagian Bawah: 4 Langkah Alur Pelayanan Pasien yang Menyatu Lebar & Proporsional */}
            <div id="alur" className="space-y-4 scroll-mt-28">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-black tracking-widest text-[#06b6d4] uppercase block">
                    Alur Pelayanan Pasien
                  </span>
                  <p className="text-sm sm:text-base font-extrabold text-slate-900 mt-0.5">
                    4 Langkah Kunjungan dari Reservasi hingga Selesai
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-6 text-xs text-slate-500 font-semibold">
                  <span>drg. Bima & drg. Sinta</span>
                  <span className="text-slate-300">|</span>
                  <span>Senin – Sabtu (09:00 – 15:00 WITA)</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  {
                    step: "01",
                    title: "Reservasi Mandiri",
                    sub: "Pilih Dokter & Slot",
                    desc: "Pasien menentukan jadwal dan dokter gigi langsung dari ponsel secara real-time.",
                    image: "/reservasi-online.jpg",
                  },
                  {
                    step: "02",
                    title: "Konfirmasi Resepsionis",
                    sub: "Verifikasi Jadwal",
                    desc: "Resepsionis memvalidasi data dan mengunci slot agar tidak terjadi jadwal ganda.",
                    image: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=600&q=80",
                  },
                  {
                    step: "03",
                    title: "Kedatangan Pasien",
                    sub: "Check-in Meja Depan",
                    desc: "Tiba tepat waktu di klinik, lapor kehadiran, dan langsung diarahkan ke ruang periksa.",
                    image: "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&w=600&q=80",
                  },
                  {
                    step: "04",
                    title: "Pemeriksaan Dokter",
                    sub: "Tindakan Medis Tuntas",
                    desc: "Dokter melakukan tindakan profesional dan rekam medis tersimpan otomatis di sistem.",
                    image: "/tangan-dokter-gigi.jpg",
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="group bg-white rounded-2xl overflow-hidden border border-slate-200/80 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300 flex flex-col"
                  >
                    {/* Foto Rasio Lebar 16:10 */}
                    <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-70 group-hover:opacity-50 transition-opacity" />
                      
                      <div className="absolute top-3 left-3 bg-[#06b6d4] text-white text-[11px] font-black px-2.5 py-0.5 rounded-md shadow-xs">
                        Langkah {item.step}
                      </div>

                      <div className="absolute bottom-2.5 left-3 right-3 text-white">
                        <p className="text-[11px] font-bold tracking-wide uppercase text-cyan-200">
                          {item.sub}
                        </p>
                      </div>
                    </div>

                    {/* Deskripsi Lengkap */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                      <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-[#06b6d4] transition">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 9. Footer (Bahasa Indonesia & Informasi Lengkap) */}
      <footer className="bg-[#09111e] text-slate-300 pt-16 pb-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
          <div className="pb-10 border-b border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <Logo size="md" />
              <div>
                <span className="text-xl font-bold text-white block">Klinik Gigi Senyum Rekah</span>
                <span className="text-xs text-slate-400">Portal Janji Temu dan Catatan Perawatan</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/masuk"
                className="px-6 py-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold uppercase tracking-wider transition"
              >
                MASUK
              </Link>
              <Link
                href="/daftar"
                className="px-6 py-2.5 rounded-full bg-[#06b6d4] hover:bg-[#0891b2] text-white text-xs font-bold uppercase tracking-wider transition"
              >
                Daftar Pasien
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-xs">
            <div className="space-y-3">
              <p className="text-white font-bold text-sm tracking-wide">Tentang Klinik</p>
              <p className="text-slate-400 leading-relaxed">
                Klinik gigi di Makassar dengan 2 dokter gigi dan 1 resepsionis. Memberikan pelayanan perawatan gigi terencana dengan sistem reservasi digital tanpa bentrok.
              </p>
              <p className="text-cyan-400 font-semibold">0812-3456-7890</p>
            </div>

            <div className="space-y-2.5">
              <p className="text-white font-bold text-sm tracking-wide">Layanan Utama</p>
              <ul className="space-y-1.5 text-slate-400">
                <li>Pembersihan Karang (Scaling)</li>
                <li>Tambal Gigi Komposit</li>
                <li>Pencabutan Gigi</li>
                <li>Perawatan Saluran Akar</li>
                <li>Konsultasi Gigi Menyeluruh</li>
              </ul>
            </div>

            <div className="space-y-2.5">
              <p className="text-white font-bold text-sm tracking-wide">Akses Portal Peran</p>
              <ul className="space-y-1.5 text-slate-400">
                <li><Link href="/masuk" className="hover:text-cyan-400">Masuk Akun Pasien</Link></li>
                <li><Link href="/daftar" className="hover:text-cyan-400">Pendaftaran Pasien Baru</Link></li>
                <li><Link href="/masuk?redirect=/resepsionis" className="hover:text-cyan-400">Meja Depan (Resepsionis)</Link></li>
                <li><Link href="/masuk?redirect=/dokter" className="hover:text-cyan-400">Ruang Dokter Gigi</Link></li>
                <li><Link href="/masuk?redirect=/admin" className="hover:text-cyan-400">Administrasi Pemilik Klinik</Link></li>
              </ul>
            </div>

            <div className="space-y-2.5">
              <p className="text-white font-bold text-sm tracking-wide">Lokasi & Jam Praktik</p>
              <p className="text-slate-400 leading-relaxed">
                Kota Makassar, Sulawesi Selatan
              </p>
              <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-[11px] text-cyan-300">
                Senin – Sabtu: 09:00 – 15:00 WITA<br />
                Minggu & Hari Libur: Tutup
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-4">
            <p>&copy; 2026 Klinik Gigi Senyum Rekah. Seluruh hak cipta dilindungi.</p>
            <p>janji.senyumrekah.id · Makassar, Sulawesi Selatan</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

