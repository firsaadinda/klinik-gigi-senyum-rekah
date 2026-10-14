# Portal Janji Temu Klinik Gigi Senyum Rekah

Aplikasi web portal reservasi janji temu dan pencatatan riwayat medis perawatan gigi berbasis Next.js dan Firebase.

**Alamat Web Publik (Live Demo):**  
[https://portal-klinik-gigi-senyum-rekah.netlify.app/](https://portal-klinik-gigi-senyum-rekah.netlify.app/)

---

## Dokumen Tugas dan Spesifikasi Lengkap

Seluruh berkas spesifikasi, perancangan, dan hasil pengujian tersimpan di dalam folder [`docs/`](./docs/):

1. **[docs/PRD.md](./docs/PRD.md)**  
   Product Requirement Document resmi Klinik Gigi Senyum Rekah (Bab 1 s/d Bab 9).
2. **[docs/rancangan.md](./docs/rancangan.md)**  
   Matriks hak akses lima pengguna, peta rute halaman, dan jawaban 4 keputusan kunci arsitektur hak akses (Tahap 1).
3. **[docs/uji.md](./docs/uji.md)**  
   Tabel skenario pengujian otorisasi, route guard, anti-flash saat muat ulang, isolasi data medis, dan alur inti (29 baris skenario lolos uji).
4. **[docs/DOKUMEN_ROLE.md](./docs/DOKUMEN_ROLE.md)**  
   Dokumen rincian hak akses 4 peran pengguna, batasan data medis, dan pembuktian pemenuhan kombinasi kata sandi.

---

## Empat Peran Pengguna (Role) dan Akun Uji

Sistem menerapkan proteksi Route Guard ketat dengan 4 peran pengguna:

| Peran (Role) | Nama Akun | Email Login | Kata Sandi | Rute Halaman | Hak Akses Utama |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Super Admin** | Bu Ratna (Pemilik) | `ratna@senyumrekah.id` | `RatnaBoss#24` | `/admin` | Manajemen pengguna & ubah peran, katalog layanan, jam operasional, laporan kunjungan bulanan. |
| **Resepsionis** | Laras (Resepsionis) | `laras@senyumrekah.id` | `LarasFront@99` | `/resepsionis` | Verifikasi janji temu pasien (konfirmasi / tolak), presensi kehadiran di meja depan, buku kontak pasien. |
| **Dokter Praktik 1** | drg. Bima Pratama | `bima@senyumrekah.id` | `DrgBima#88` | `/dokter` | Jadwal praktik, antrean pasien hari ini, input rekam medis digital (tindakan & diagnosis), selesaikan janji. |
| **Dokter Praktik 2** | drg. Sinta Wijaya | `sinta@senyumrekah.id` | `DrgSinta%77` | `/dokter` | Jadwal praktik, antrean pasien hari ini, input rekam medis digital (tindakan & diagnosis), selesaikan janji. |
| **Pasien 1** | Andi Pratama | `andi@senyumrekah.id` | `AndiSehat&26` | `/beranda` | Reservasi mandiri slot waktu dokter, cek status janji temu, riwayat rekam medis pribadi. |
| **Pasien 2** | Budi Santoso | `budi@senyumrekah.id` | `BudiGigi#31` | `/beranda` | Reservasi mandiri slot waktu dokter, cek status janji temu, riwayat rekam medis pribadi. |
| **Pasien 3** | Citra Lestari | `citra@senyumrekah.id` | `CitraSenyum@45` | `/beranda` | Reservasi mandiri slot waktu dokter, cek status janji temu, riwayat rekam medis pribadi. |
| **Pasien 4** | Dewi Anggraini | `dewi@senyumrekah.id` | `DewiSehat%62` | `/beranda` | Reservasi mandiri slot waktu dokter, cek status janji temu, riwayat rekam medis pribadi. |
| **Pasien 5** | Eko Prasetyo | `eko@senyumrekah.id` | `EkoKlinik&73` | `/beranda` | Reservasi mandiri slot waktu dokter, cek status janji temu, riwayat rekam medis pribadi. |
| **Pasien 6** | Fani Rahmawati | `fani@senyumrekah.id` | `FaniCantik#84` | `/beranda` | Reservasi mandiri slot waktu dokter, cek status janji temu, riwayat rekam medis pribadi. |
| **Pasien 7** | Gilang Ramadhan | `gilang@senyumrekah.id` | `GilangPutih@95` | `/beranda` | Reservasi mandiri slot waktu dokter, cek status janji temu, riwayat rekam medis pribadi. |

> **Ketentuan Kata Sandi:** Seluruh kata sandi di atas memenuhi ketentuan wajib: panjang minimal 8 karakter (10–13 karakter), kombinasi huruf kapital, huruf kecil, angka, dan simbol khusus (`#`, `@`, `%`, `&`), serta tanpa spasi di awal/akhir.

---

## Alur Inti Pelayanan (Tahap 7)

Alur operasional berjalan otomatis dan terhubung langsung ke Firebase Firestore:
1. **Pasien Reservasi:** Pasien memilih dokter, layanan, tanggal, dan slot jam kosong di `/janji/baru`.
2. **Resepsionis Konfirmasi & Hadir:** Resepsionis memverifikasi janji temu di `/resepsionis/janji` (`dikonfirmasi`) lalu menandai kehadiran saat pasien tiba di klinik (`hadir`).
3. **Dokter Periksa:** Dokter membuka antrean pemeriksaan miliknya di `/dokter/janji/[id]`, mengisi diagnosa medis, tindakan, instruksi dokter, lalu menandai selesai (`selesai`).
4. **Pasien Riwayat:** Pasien melihat catatan medis kunjungan yang selesai di `/riwayat` dan kartu detail janji.

---

## Teknologi yang Digunakan

- **Frontend Framework:** Next.js (App Router) & React
- **Styling:** Tailwind CSS & Lucide React Icons
- **Backend & Database:** Firebase Authentication & Cloud Firestore
- **Deployment:** Netlify Continuous Deployment via GitHub
