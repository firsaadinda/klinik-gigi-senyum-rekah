# Rancangan Portal Janji Senyum Rekah

Dokumen ini disusun sebagai acuan matriks akses, peta route, dan keputusan otorisasi untuk implementasi empat peran pada Portal Janji Senyum Rekah sesuai Bab 2, 3, dan 4 Product Requirements Document (PRD).

---

## 1. Daftar Fitur Berdasarkan Bab 4 PRD

1. **4.1 Daftar dan Masuk**
   - 4.1.1 Mendaftar akun baru dengan Email & Kata Sandi (peran awal otomatis `pasien`)
   - 4.1.2 Mendaftar dan Masuk dengan Akun Google (peran awal otomatis `pasien`)
   - 4.1.3 Masuk dengan Email & Kata Sandi
   - 4.1.4 Keluar (Logout) dari sesi akun
   - 4.1.5 Pengalihan otomatis sesuai peran setelah masuk

2. **4.2 Beranda**
   - 4.2.1 Melihat ringkasan janji terdekat milik sendiri (tanggal, jam, dokter, layanan, status)
   - 4.2.2 Tombol pintasan Buat Janji

3. **4.3 Janji Saya**
   - 4.3.1 Memilih layanan aktif, dokter praktik, dan tanggal praktik dokter
   - 4.3.2 Melihat slot jam yang masih kosong (berdasarkan data `slot_terisi`)
   - 4.3.3 Mengirim pemesanan janji temu baru (status awal: `menunggu`)
   - 4.3.4 Melihat daftar janji temu milik sendiri
   - 4.3.5 Melihat rincian janji temu milik sendiri
   - 4.3.6 Membatalkan janji temu milik sendiri (maksimal H-1 untuk status Menunggu atau Dikonfirmasi)

4. **4.4 Riwayat Perawatan**
   - 4.4.1 Melihat daftar riwayat perawatan selesai milik sendiri (tanggal, dokter, layanan, tindakan, catatan dokter)

5. **4.5 Profil**
   - 4.5.1 Melihat data profil (nama, email, nomor HP, peran)
   - 4.5.2 Mengubah nama dan nomor HP profil sendiri

6. **4.6 Dasbor Resepsionis**
   - 4.6.1 Melihat ringkasan janji hari ini per dokter
   - 4.6.2 Melihat jumlah janji yang berstatus menunggu konfirmasi beserta pintasan ke filter Kelola Janji

7. **4.7 Kelola Janji**
   - 4.7.1 Melihat seluruh janji klinik dengan filter status dan tanggal
   - 4.7.2 Mengonfirmasi janji pasien (status `menunggu` → `dikonfirmasi`)
   - 4.7.3 Menjadwal ulang waktu janji pasien ke slot kosong yang baru
   - 4.7.4 Membatalkan janji dengan mengisi alasan pembatalan
   - 4.7.5 Menandai kedatangan pasien (status `dikonfirmasi` → `hadir` pada hari janji)

8. **4.8 Data Pasien**
   - 4.8.1 Melihat daftar kontak pasien (nama, email, nomor HP) dengan fitur pencarian (tanpa catatan perawatan)

9. **4.9 Dasbor Dokter**
   - 4.9.1 Melihat daftar jadwal janji hari ini khusus dokter yang sedang login
   - 4.9.2 Melihat penanda pasien yang siap diperiksa (status: `hadir`)

10. **4.10 Pemeriksaan**
    - 4.10.1 Membuka halaman pemeriksaan pasien berstatus Hadir untuk janji dokter bersangkutan
    - 4.10.2 Mengisi data tindakan medis dan catatan dokter
    - 4.10.3 Menandai janji selesai (status `hadir` → `selesai`) dan menyimpan catatan perawatan

11. **4.11 Riwayat Pasien**
    - 4.11.1 Melihat riwayat catatan perawatan pasien terdahulu yang pernah ditangani oleh dokter bersangkutan

12. **4.12 Dasbor Admin**
    - 4.12.1 Melihat statistik kartu ringkasan: Kunjungan hari ini, Kunjungan bulan ini, dan Menunggu konfirmasi
    - 4.12.2 Navigasi cepat ke laporan bulan berjalan

13. **4.13 Kelola Pengguna**
    - 4.13.1 Melihat daftar seluruh pengguna sistem dengan filter/pencarian
    - 4.13.2 Mengubah peran pengguna (`pasien`, `resepsionis`, `dokter`, `super_admin`)
    - 4.13.3 Mengaktifkan atau menonaktifkan akun pengguna

14. **4.14 Layanan**
    - 4.14.1 Melihat daftar katalog layanan klinik gigi
    - 4.14.2 Menambah layanan baru (nama, durasi menit kelipatan 30, harga)
    - 4.14.3 Mengaktifkan atau menonaktifkan status layanan

15. **4.15 Jadwal Dokter**
    - 4.15.1 Melihat daftar jadwal praktik dokter gigi
    - 4.15.2 Menambah/mengatur jadwal praktik per dokter (hari Senin–Sabtu, jam mulai, jam selesai)

16. **4.16 Laporan**
    - 4.16.1 Memilih bulan laporan kunjungan
    - 4.16.2 Melihat tabel laporan rekap kunjungan selesai per dokter
    - 4.16.3 Melihat tabel laporan rekap kunjungan selesai per layanan

---

## 2. Matriks Akses

Keterangan:
- **✓**: Boleh mengakses penuh
- **✓ milik sendiri**: Boleh mengakses hanya data yang terkait dengan akun miliknya
- **✓ janji/pasiennya**: Boleh mengakses hanya janji atau pasien yang ditangani dokter tersebut
- **✕**: Tidak boleh mengakses

| Fitur (Subbab PRD) | Pengunjung | Pelanggan (`pasien`) | Staf Depan (`resepsionis`) | Tenaga Ahli (`dokter`) | Super Admin (`super_admin`) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| Mendaftar & Masuk (4.1) | ✓ | ✕ (diarahkan) | ✕ (diarahkan) | ✕ (diarahkan) | ✕ (diarahkan) |
| Melihat Janji Terdekat & Beranda (4.2) | ✕ | ✓ milik sendiri | ✕ | ✕ | ✓ |
| Buat Janji Temu (4.3.1) | ✕ | ✓ milik sendiri | ✕ | ✕ | ✓ |
| Melihat Daftar & Rincian Janji (4.3.2) | ✕ | ✓ milik sendiri | ✕ | ✕ | ✓ |
| Membatalkan Janji Sendiri Maks. H-1 (4.3.2) | ✕ | ✓ milik sendiri | ✕ | ✕ | ✓ |
| Membaca Riwayat Perawatan (4.4) | ✕ | ✓ milik sendiri | ✕ | ✕ | ✓ |
| Membaca & Memperbarui Profil Diri (4.5) | ✕ | ✓ milik sendiri | ✓ milik sendiri | ✓ milik sendiri | ✓ milik sendiri |
| Melihat Dasbor Resepsionis (4.6) | ✕ | ✕ | ✓ | ✕ | ✓ |
| Mengonfirmasi, Menjadwal Ulang, Membatalkan Janji (4.7) | ✕ | ✕ | ✓ | ✕ | ✓ |
| Menandai Pasien Hadir (4.7) | ✕ | ✕ | ✓ | ✕ | ✓ |
| Melihat Data Kontak Pasien (4.8) | ✕ | ✕ | ✓ (kontak saja) | ✕ | ✓ |
| Melihat Dasbor Jadwal Dokter (4.9) | ✕ | ✕ | ✕ | ✓ janji/jadwalnya | ✓ |
| Mengisi Pemeriksaan & Menandai Selesai (4.10) | ✕ | ✕ | ✕ | ✓ janjinya | ✓ |
| Melihat Riwayat Pasien Dokter (4.11) | ✕ | ✕ | ✕ | ✓ pasiennya | ✓ |
| Melihat Dasbor Admin (4.12) | ✕ | ✕ | ✕ | ✕ | ✓ |
| Kelola Pengguna & Ubah Peran / Status (4.13) | ✕ | ✕ | ✕ | ✕ | ✓ |
| Mengelola Layanan Klinik (4.14) | ✕ | ✕ | ✕ | ✕ | ✓ |
| Mengelola Jadwal Praktik Dokter (4.15) | ✕ | ✕ | ✕ | ✕ | ✓ |
| Melihat Laporan Kunjungan Bulanan (4.16) | ✕ | ✕ | ✕ | ✕ | ✓ |

---

## 3. Peta Route

| Halaman | Alamat URL | Peran yang Boleh Membuka | Bila Belum Masuk | Peran Lain |
| :--- | :--- | :--- | :--- | :--- |
| Pendaftaran | `/daftar` | Pengunjung | Terbuka | Dialihkan ke halaman peran masing-masing |
| Masuk Akun | `/masuk` | Pengunjung | Terbuka | Dialihkan ke halaman peran masing-masing |
| Beranda Pasien | `/beranda` | `pasien`, `super_admin` | Dialihkan ke `/masuk` | Akses Ditolak |
| Daftar Janji Pasien | `/janji` | `pasien`, `super_admin` | Dialihkan ke `/masuk` | Akses Ditolak |
| Buat Janji Baru | `/janji/baru` | `pasien`, `super_admin` | Dialihkan ke `/masuk` | Akses Ditolak |
| Rincian Janji Pasien | `/janji/[id]` | `pasien` (milik sendiri), `super_admin` | Dialihkan ke `/masuk` | Akses Ditolak / Janji tidak ditemukan |
| Riwayat Perawatan | `/riwayat` | `pasien`, `super_admin` | Dialihkan ke `/masuk` | Akses Ditolak |
| Profil Pengguna | `/profil` | `pasien`, `resepsionis`, `dokter`, `super_admin` | Dialihkan ke `/masuk` | Tidak ada (semua peran berhak) |
| Dasbor Resepsionis | `/resepsionis` | `resepsionis`, `super_admin` | Dialihkan ke `/masuk` | Akses Ditolak |
| Kelola Janji Resepsionis | `/resepsionis/janji` | `resepsionis`, `super_admin` | Dialihkan ke `/masuk` | Akses Ditolak |
| Rincian Janji Resepsionis | `/resepsionis/janji/[id]` | `resepsionis`, `super_admin` | Dialihkan ke `/masuk` | Akses Ditolak |
| Data Pasien | `/resepsionis/pasien` | `resepsionis`, `super_admin` | Dialihkan ke `/masuk` | Akses Ditolak |
| Dasbor Dokter | `/dokter` | `dokter`, `super_admin` | Dialihkan ke `/masuk` | Akses Ditolak |
| Pemeriksaan Dokter | `/dokter/janji/[id]` | `dokter` (janji miliknya), `super_admin` | Dialihkan ke `/masuk` | Akses Ditolak / Janji tidak ditemukan |
| Riwayat Pasien Dokter | `/dokter/pasien/[id]` | `dokter` (pasien yang pernah ditangani), `super_admin` | Dialihkan ke `/masuk` | Akses Ditolak / Pasien tidak ditemukan |
| Dasbor Admin | `/admin` | `super_admin` | Dialihkan ke `/masuk` | Akses Ditolak |
| Kelola Pengguna | `/admin/pengguna` | `super_admin` | Dialihkan ke `/masuk` | Akses Ditolak |
| Rincian & Edit Pengguna | `/admin/pengguna/[id]` | `super_admin` | Dialihkan ke `/masuk` | Akses Ditolak |
| Kelola Layanan | `/admin/layanan` | `super_admin` | Dialihkan ke `/masuk` | Akses Ditolak |
| Kelola Jadwal Dokter | `/admin/jadwal-dokter` | `super_admin` | Dialihkan ke `/masuk` | Akses Ditolak |
| Laporan Kunjungan | `/admin/laporan` | `super_admin` | Dialihkan ke `/masuk` | Akses Ditolak |

---

## 4. Jawaban Keputusan Wajib Otorisasi

Berikut adalah jawaban atas empat pertanyaan wajib yang ditetapkan pada instruksi tugas dengan rujukan bab PRD terkait:

### 1. Bolehkah resepsionis membaca catatan perawatan?
> **TIDAK BOLEH.**  
> **Dasar PRD:**  
> - **Bab 1 (Ringkasan Eksekutif):** *"Catatan perawatan tetap rahasia. Resepsionis tidak bisa membacanya, dan dokter hanya membaca catatan pasien yang ia tangani."*  
> - **Bab 2.3 (Hak Akses Per Modul):** Pada baris modul *Riwayat Perawatan*, kolom Resepsionis tertulis **"Tidak tampil"**.  
> - **Bab 2.4 (Yang Tidak Boleh Dilihat Tiap Peran):** Pada baris *Catatan perawatan*, kolom Resepsionis secara tegas dinyatakan **"Tidak tampil"**.  
> - **Bab 4.7 (Kelola Janji):** *"Rincian untuk resepsionis tidak menampilkan catatan perawatan."*  
> - **Bab 4.8 (Data Pasien):** *"Batasan v1: resepsionis tidak bisa membaca catatan perawatan dari halaman mana pun."*

---

### 2. Bolehkah drg. Bima membuka pemeriksaan janji drg. Sinta?
> **TIDAK BOLEH.**  
> **Dasar PRD:**  
> - **Bab 2.4 (Yang Tidak Boleh Dilihat Tiap Peran):** Dokter hanya boleh melihat janji dan catatan perawatan untuk pasien/janji yang ia tangani sendiri. Janji dokter lain **"Hanya janji yang ia tangani"**.  
> - **Bab 4.9 (Dasbor Dokter):** *"Hanya janji dengan dokterId miliknya yang tampil. Janji drg. Sinta tidak terlihat oleh drg. Bima."*  
> - **Bab 4.10 (Pemeriksaan):** *"Validasi: hanya janji milik dokter itu yang berstatus Hadir yang bisa diisi. Bila ID diganti dengan janji dokter lain, tampil 'Janji tidak ditemukan'."*  
> - **Bab 8 (Pengujian):** Menyebutkan uji tembus drg. Bima membuka Pemeriksaan untuk janji drg. Sinta harus ditolak.

---

### 3. Bolehkah pasien melihat jam yang sudah terisi pasien lain?
> **TIDAK BOLEH.**  
> **Dasar PRD:**  
> - **Bab 1 (Ringkasan Eksekutif):** *"Pasien hanya bisa memilih slot jam yang masih kosong."*  
> - **Bab 2.4 (Yang Tidak Boleh Dilihat Tiap Peran):** Janji pasien lain bagi Pasien berstatus **"Tidak tampil"**. Kontak pasien lain bagi Pasien berstatus **"Tidak tampil"**.  
> - **Bab 4.3.1 (Buat Janji):** *"Slot yang bertabrakan dengan janji lain dokter itu yang belum dibatalkan tidak ditampilkan. Untuk mengetahuinya, aplikasi membaca koleksi slot_terisi yang hanya berisi dokter, tanggal, jam, dan durasi, tanpa nama atau keluhan pasien."*  
> Pasien sama sekali tidak dapat melihat identitas, nama, atau jam janji pasien lain, melainkan sistem hanya menyaring dan menyajikan daftar slot jam kosong yang tersedia.

---

### 4. Halaman mana saja yang boleh dibuka Bu Ratna?
> **SEMUA HALAMAN APLIKASI (Seluruh Kelompok Halaman).**  
> **Dasar PRD:**  
> - **Bab 2.1 (Empat Pemegang Akun):** Super Admin (Bu Ratna, pemilik klinik) memiliki *"Semua hak tiga peran lain, ditambah mengelola pengguna, layanan, jadwal dokter, dan laporan."*  
> - **Bab 2.3 (Hak Akses Per Modul):** Di seluruh baris modul (Beranda, Janji Saya, Riwayat Perawatan, Profil, Dasbor Resepsionis, Kelola Janji, Data Pasien, Dasbor Dokter, Pemeriksaan, Riwayat Pasien, Dasbor Admin, Layanan, Jadwal Dokter, Laporan, Kelola Pengguna), hak Super Admin adalah **Penuh** atau **Lihat**.  
> - **Bab 3.1 (Peta Modul):** *"Super Admin (semua menu peran lain, ditambah) Dasbor Admin, Kelola Pengguna, Layanan, Jadwal Dokter, Laporan."*  
> - **Bab 4.12 (Dasbor Admin):** *"Menu samping Super Admin juga memuat semua menu peran lain."*  
> **Daftar Halaman Lengkap:**  
> `/beranda`, `/janji`, `/janji/baru`, `/janji/[id]`, `/riwayat`, `/profil`, `/resepsionis`, `/resepsionis/janji`, `/resepsionis/janji/[id]`, `/resepsionis/pasien`, `/dokter`, `/dokter/janji/[id]`, `/dokter/pasien/[id]`, `/admin`, `/admin/pengguna`, `/admin/pengguna/[id]`, `/admin/layanan`, `/admin/jadwal-dokter`, `/admin/laporan`.
