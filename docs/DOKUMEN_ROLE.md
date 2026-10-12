# Dokumen Spesifikasi Hak Akses & Peran (Role Document)
## Portal Janji Temu Klinik Gigi Senyum Rekah

Dokumen ini menjelaskan struktur hak akses empat peran pengguna, pembagian modul, batasan kerahasiaan data medis, serta akun uji yang digunakan pada sistem **Portal Janji Temu Klinik Gigi Senyum Rekah** sesuai dengan ketentuan PRD Bab 2 & Bab 4.

---

## 1. Ringkasan 4 Peran Pengguna

Sistem memiliki 4 peran utama dan 1 status pengunjung umum:
1. **Pengunjung (Belum Masuk):** Masyarakat umum yang membuka web untuk melihat informasi alur pelayanan klinik dan mengakses halaman login/daftar.
2. **Pasien (`pasien`):** Pasien yang melakukan reservasi mandiri, memantau status janji temu, dan melihat riwayat medis pribadinya.
3. **Resepsionis (`resepsionis`):** Staf meja depan yang bertugas memverifikasi reservasi, mengelola jadwal kedatangan, dan mencatat presensi kehadiran pasien.
4. **Dokter (`dokter`):** Tenaga medis yang melihat antrean pasien periksa miliknya, mencatat diagnosis, tindakan, instruksi medis, dan menandai janji selesai.
5. **Super Admin (`super_admin`):** Pemilik klinik (Bu Ratna) yang memiliki otoritas penuh ke seluruh modul operasional, manajemen pengguna, pengaturan layanan, dan laporan klinik.

---

## 2. Matriks Hak Akses per Modul (PRD Bab 2.3)

| Modul & Fitur | Pengunjung | Pasien | Resepsionis | Dokter | Super Admin |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Landing Page & Alur Pelayanan (`/`)** | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Pendaftaran & Masuk (`/masuk`, `/daftar`)** | ✓ | Dialihkan | Dialihkan | Dialihkan | Dialihkan |
| **Beranda Pasien (`/beranda`)** | ✕ | ✓ Penuh | ✕ | ✕ | ✓ (*Bypass*) |
| **Janji Temu Saya (`/janji`, `/janji/baru`)** | ✕ | ✓ Milik sendiri | ✕ | ✕ | ✓ (*Bypass*) |
| **Riwayat Perawatan Pasien (`/riwayat`)** | ✕ | ✓ Milik sendiri | ✕ | ✕ | ✓ (*Bypass*) |
| **Profil Pengguna (`/profil`)** | ✕ | ✓ Ubah kontak | ✓ Ubah kontak | ✓ Ubah kontak | ✓ Ubah kontak |
| **Dasbor Resepsionis (`/resepsionis`)** | ✕ | ✕ | ✓ Penuh | ✕ | ✓ Penuh |
| **Kelola Janji Temu (`/resepsionis/janji`)** | ✕ | ✕ | ✓ Penuh | ✕ | ✓ Penuh |
| **Buku Kontak Pasien (`/resepsionis/pasien`)** | ✕ | ✕ | ✓ Lihat kontak | ✕ | ✓ Penuh |
| **Dasbor Dokter (`/dokter`)** | ✕ | ✕ | ✕ | ✓ Milik sendiri | ✓ Penuh |
| **Pemeriksaan Medis (`/dokter/janji/[id]`)** | ✕ | ✕ | ✕ | ✓ Pasien sendiri | ✓ Penuh |
| **Riwayat Pasien Medis (`/dokter/pasien/[id]`)** | ✕ | ✕ | ✕ | ✓ Pernah ditangani | ✓ Penuh |
| **Dasbor Admin (`/admin`)** | ✕ | ✕ | ✕ | ✕ | ✓ Penuh |
| **Kelola Pengguna & Role (`/admin/pengguna`)** | ✕ | ✕ | ✕ | ✕ | ✓ Penuh |
| **Katalog Layanan (`/admin/layanan`)** | ✕ | ✕ | ✕ | ✕ | ✓ Penuh |
| **Jadwal Dokter (`/admin/jadwal-dokter`)** | ✕ | ✕ | ✕ | ✕ | ✓ Penuh |
| **Laporan Kunjungan (`/admin/laporan`)** | ✕ | ✕ | ✕ | ✕ | ✓ Penuh |

*Keterangan:*
- `✓ Penuh` : Memiliki akses melihat dan mengelola seluruh data pada modul tersebut.
- `✓ Milik sendiri` : Hanya dapat mengakses data yang terikat dengan ID pengguna akun yang bersangkutan.
- `✕` : Akses diblokir oleh *Route Guard* (menampilkan halaman **Akses Ditolak**).

---

## 3. Batasan Kerahasiaan Data per Peran (PRD Bab 2.4)

Untuk menjaga privasi medis dan etika kedokteran, sistem memberlakukan batasan ketat:

| Jenis Data | Pasien | Resepsionis | Dokter | Super Admin |
| :--- | :--- | :--- | :--- | :--- |
| **Janji Pasien Lain** | **Tidak Tampil** (hanya melihat slot jam terisi tanpa identitas) | Tampil dan dapat diubah statusnya | Hanya janji dokter bersangkutan | Tampil semua |
| **Catatan Rekam Medis** | Hanya miliknya | **Tidak Tampil Sama Sekali** (privasi medis terjaga) | Hanya pasien yang ia tangani | Tampil semua |
| **Kontak Pasien Lain** | **Tidak Tampil** | Tampil (Nama, No. HP, Email) untuk konfirmasi | Hanya pasien yang ia tangani | Tampil semua |
| **Pengubahan Peran (`role`)** | Tidak bisa diubah | Tidak bisa diubah | Tidak bisa diubah | **Hanya Super Admin** |

---

## 4. Mekanisme Keamanan & Route Guard

1. **Penjagaan Rute Klien (*Route Guard*):**
   - Setiap rute privat dibungkus oleh komponen pelindung yang mengevaluasi status autentikasi dan peran aktif dari Firestore `users/{uid}`.
   - Pengguna belum masuk yang mencoba mengakses rute internal akan dialihkan ke `/masuk?redirect=<rute>`.
   - Pengguna yang masuk dengan peran yang tidak berhak akan menampilkan layar **Akses Ditolak** dengan tombol kembali ke modulnya.

2. **Bebas Kedipan (*Anti-Flash on Reload*):**
   - Saat pengguna menekan tombol muat ulang (F5), sistem menahan rendering halaman sampai status peran selesai dibaca dari Firestore, sehingga tidak pernah terjadi kedipan layar *Akses Ditolak*.

3. **Perlindungan Dokumen Pengguna:**
   - Saat pengguna mendaftar atau masuk dengan Google, sistem memeriksa keberadaan dokumen pengguna terlebih dahulu.
   - Peran pengguna yang telah diubah oleh Admin **tidak akan tertimpa** menjadi pasien kembali saat login ulang.
   - Kata sandi **tidak pernah disimpan** di database Firestore.

---

## 5. Akun Uji Resmi per Peran

| Peran (Role) | Nama Akun | Email Login | Kata Sandi | Rute Masuk Default |
| :--- | :--- | :--- | :--- | :--- |
| **Super Admin** | Bu Ratna (Pemilik) | `ratna@senyumrekah.id` | `RatnaBoss#24` | `/admin` |
| **Resepsionis** | Laras (Resepsionis) | `laras@senyumrekah.id` | `LarasFront@99` | `/resepsionis` |
| **Dokter Praktik 1** | drg. Bima Pratama | `bima@senyumrekah.id` | `DrgBima#88` | `/dokter` |
| **Dokter Praktik 2** | drg. Sinta Wijaya | `sinta@senyumrekah.id` | `DrgSinta%77` | `/dokter` |
| **Pasien Mandiri** | Andi Pratama | `andi@senyumrekah.id` | `AndiSehat&26` | `/beranda` |

---

## 6. Skenario Pengujian Lintas Peran

1. **Uji Isolasi Resepsionis:**
   - Resepsionis membuka `/resepsionis/pasien` &rarr; melihat buku kontak pasien (nama dan nomor telepon) tanpa rincian riwayat diagnosa atau rekam medis dokter (PRD 4.8).
   - Resepsionis mengetik `/dokter` atau `/admin` di URL &rarr; muncul **Akses Ditolak**.

2. **Uji Isolasi Dokter Silang:**
   - drg. Bima mencoba membuka URL pemeriksaan pasien drg. Sinta (`/dokter/janji/[id-sinta]`) &rarr; sistem menampilkan pesan **Janji Tidak Ditemukan** (PRD 4.10).
   - Dokter mengetik `/admin` atau `/resepsionis` di URL &rarr; muncul **Akses Ditolak**.

3. **Uji Isolasi Pasien:**
   - Pasien mengetik `/admin`, `/resepsionis`, atau `/dokter` &rarr; muncul **Akses Ditolak**.
   - Pasien hanya dapat melihat riwayat dan janji miliknya sendiri di `/janji` dan `/riwayat`.

4. **Uji Super Admin:**
   - Super Admin dapat membuka seluruh rute (`/admin`, `/resepsionis`, `/dokter`, `/beranda`).
   - Super Admin tidak dapat menurunkan peran akunnya sendiri atau menonaktifkan dirinya sendiri demi integritas sistem (PRD 4.13).
