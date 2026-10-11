# Tabel Pengujian Empat Peran & Alur Inti Portal Janji Senyum Rekah

Dokumen ini berisi tabel skenario pengujian otorisasi, pengalihan, *route guard*, dan alur inti pada Portal Janji Senyum Rekah sesuai instruksi Tugas Mandiri Sesi 6 (Tahap 6 & Tahap 7).

---

## 1. Tabel Uji Otorisasi & Penjagaan Halaman (Minimal 16 Baris)

| No | Akun / Peran | Yang Dilakukan | Hasil yang Diharapkan | Hasil Pengujian | Lolos? |
| :---: | :--- | :--- | :--- | :--- | :---: |
| 1 | Pengunjung (Belum Masuk) | Buka `/beranda` langsung di address bar | Dialihkan ke `/masuk?redirect=%2Fberanda` | Dialihkan dengan mulus ke `/masuk` | ☑ |
| 2 | Pengunjung (Belum Masuk) | Buka `/resepsionis` langsung di address bar | Dialihkan ke `/masuk?redirect=%2Fresepsionis` | Dialihkan dengan mulus ke `/masuk` | ☑ |
| 3 | Pengunjung (Belum Masuk) | Buka `/dokter` langsung di address bar | Dialihkan ke `/masuk?redirect=%2Fdokter` | Dialihkan dengan mulus ke `/masuk` | ☑ |
| 4 | Pengunjung (Belum Masuk) | Buka `/admin` langsung di address bar | Dialihkan ke `/masuk?redirect=%2Fadmin` | Dialihkan dengan mulus ke `/masuk` | ☑ |
| 5 | Pasien (`pasien`: Andi Pratama) | Buka `/beranda` | Halaman terbuka, menampilkan kartu janji terdekat | Halaman terbuka sempurna | ☑ |
| 6 | Pasien (`pasien`: Andi Pratama) | Ketik `/resepsionis` di address bar | Tampil halaman **Akses Ditolak** dengan tombol kembali | Tampil Akses Ditolak tanpa error | ☑ |
| 7 | Pasien (`pasien`: Andi Pratama) | Ketik `/dokter` di address bar | Tampil halaman **Akses Ditolak** dengan tombol kembali | Tampil Akses Ditolak tanpa error | ☑ |
| 8 | Pasien (`pasien`: Andi Pratama) | Ketik `/admin` di address bar | Tampil halaman **Akses Ditolak** dengan tombol kembali | Tampil Akses Ditolak tanpa error | ☑ |
| 9 | Resepsionis (`resepsionis`: Laras) | Buka `/resepsionis` & `/resepsionis/janji` | Halaman terbuka, menampilkan data janji dan filter | Halaman terbuka sempurna | ☑ |
| 10 | Resepsionis (`resepsionis`: Laras) | Ketik `/beranda` di address bar | Tampil halaman **Akses Ditolak** | Tampil Akses Ditolak | ☑ |
| 11 | Resepsionis (`resepsionis`: Laras) | Ketik `/dokter` di address bar | Tampil halaman **Akses Ditolak** | Tampil Akses Ditolak | ☑ |
| 12 | Resepsionis (`resepsionis`: Laras) | Ketik `/admin` di address bar | Tampil halaman **Akses Ditolak** | Tampil Akses Ditolak | ☑ |
| 13 | Dokter (`dokter`: drg. Bima Pratama) | Buka `/dokter` | Halaman terbuka, jadwal janji dokter bersangkutan tampil | Halaman terbuka sempurna | ☑ |
| 14 | Dokter (`dokter`: drg. Bima Pratama) | Ketik `/beranda` di address bar | Tampil halaman **Akses Ditolak** | Tampil Akses Ditolak | ☑ |
| 15 | Dokter (`dokter`: drg. Bima Pratama) | Ketik `/resepsionis` di address bar | Tampil halaman **Akses Ditolak** | Tampil Akses Ditolak | ☑ |
| 16 | Dokter (`dokter`: drg. Bima Pratama) | Ketik `/admin` di address bar | Tampil halaman **Akses Ditolak** | Tampil Akses Ditolak | ☑ |
| 17 | Super Admin (`super_admin`: Bu Ratna) | Buka `/admin`, `/admin/pengguna`, `/admin/layanan` | Halaman terbuka penuh | Halaman terbuka sempurna | ☑ |
| 18 | Super Admin (`super_admin`: Bu Ratna) | Buka `/resepsionis` & `/resepsionis/janji` | Halaman terbuka (*bypass* otorisasi admin) | Halaman terbuka sempurna | ☑ |
| 19 | Super Admin (`super_admin`: Bu Ratna) | Buka `/dokter` | Halaman terbuka (*bypass* otorisasi admin) | Halaman terbuka sempurna | ☑ |
| 20 | Super Admin (`super_admin`: Bu Ratna) | Buka `/beranda`, `/janji`, `/riwayat` | Halaman terbuka (*bypass* otorisasi admin) | Halaman terbuka sempurna | ☑ |

---

## 2. Tabel Uji Muat Ulang (Reload) & Anti-Flash

| No | Akun | Halaman yang Diuji | Yang Dilakukan | Hasil yang Diharapkan | Lolos? |
| :---: | :--- | :--- | :--- | :--- | :---: |
| 21 | Pasien | `/beranda` | Tekan F5 (Muat ulang browser) | Menampilkan layar `Memuat...` sesaat, lalu tetap di `/beranda` tanpa berkedip Akses Ditolak | ☑ |
| 22 | Resepsionis | `/resepsionis/janji` | Tekan F5 (Muat ulang browser) | Menampilkan layar `Memuat...` sesaat, lalu tetap di `/resepsionis/janji` tanpa berkedip Akses Ditolak | ☑ |
| 23 | Dokter | `/dokter` | Tekan F5 (Muat ulang browser) | Menampilkan layar `Memuat...` sesaat, lalu tetap di `/dokter` tanpa berkedip Akses Ditolak | ☑ |
| 24 | Super Admin | `/admin/pengguna` | Tekan F5 (Muat ulang browser) | Menampilkan layar `Memuat...` sesaat, lalu tetap di `/admin/pengguna` tanpa berkedip Akses Ditolak | ☑ |

---

## 3. Tabel Uji Batasan Akses & Validasi Khusus (PRD Bab 2.4, 4.8, 4.10, 4.13)

| No | Modul / Skenario | Yang Dilakukan | Hasil yang Diharapkan | Lolos? |
| :---: | :--- | :--- | :--- | :---: |
| 25 | Data Pasien Resepsionis | Buka `/resepsionis/pasien` | Menampilkan buku kontak pasien (Nama, HP, Email) **tanpa** catatan perawatan medis dokter (PRD 4.8) | ☑ |
| 26 | Pemeriksaan Dokter Silang | drg. Bima membuka URL `/dokter/janji/[id]` milik drg. Sinta | Menampilkan **"Janji Tidak Ditemukan"** (PRD 4.10) | ☑ |
| 27 | Riwayat Pasien Silang | Dokter membuka URL `/dokter/pasien/[id]` pasien yang belum pernah ia tangani | Menampilkan **"Pasien Tidak Ditemukan"** (PRD 4.11) | ☑ |
| 28 | Kelola Pengguna | Super Admin mencoba menurunkan peran akunnya sendiri atau menonaktifkan diri sendiri | Ditolak oleh sistem dengan pesan peringatan (PRD 4.13) | ☑ |
| 29 | Akun Nonaktif | Masuk dengan akun yang memiliki `aktif: false` | Muncul pesan **"Akun Anda dinonaktifkan. Hubungi klinik."** (PRD 4.1) | ☑ |

---

## 4. Tabel Uji Alur Inti (Tahap 7)

| Langkah | Peran Pelaksana | Aksi yang Dilakukan | Data & Status di Firestore | Lolos? |
| :---: | :--- | :--- | :--- | :---: |
| **1** | Pasien (Andi Pratama) | Mengisi formulir Buat Janji di `/janji/baru` (memilih Layanan Scaling, drg. Sinta, tanggal besok, slot 10:00, keluhan) lalu klik Kirim | Dokumen baru di `janji_temu` dengan `status: "menunggu"`, dokumen di `slot_terisi` terbentuk | ☑ |
| **2** | Resepsionis (Laras) | Membuka `/resepsionis/janji`, melihat janji Andi dengan filter Menunggu, lalu mengklik tombol **Konfirmasi** | Status janji di `janji_temu` terupdate menjadi `"dikonfirmasi"` | ☑ |
| **3** | Resepsionis (Laras) | Saat hari janji tiba dan pasien datang, Laras mengklik tombol **Tandai Hadir** di `/resepsionis/janji` | Status janji di `janji_temu` terupdate menjadi `"hadir"`, janji ditandai *"Siap Diperiksa"* | ☑ |
| **4** | Dokter (drg. Sinta) | Masuk ke `/dokter`, melihat Andi di daftar *Siap Diperiksa*, membuka pemeriksaan di `/dokter/janji/[id]`, mengisi tindakan & catatan, lalu klik **Tandai Selesai** | Status janji di `janji_temu` terupdate menjadi `"selesai"`, dokumen baru tersimpan di `catatan_perawatan` | ☑ |
| **5** | Pasien (Andi Pratama) | Membuka menu `/riwayat` di akunnya | Catatan tindakan dan instruksi dokter tampil lengkap dan rapi di riwayat perawatannya | ☑ |

---

## 5. Daftar Akun Pengujian Resmi

| Peran | Nama Akun | Alamat Email | Kata Sandi Aktif | Halaman Awal Setelah Masuk |
| :--- | :--- | :--- | :--- | :--- |
| **Super Admin** | Bu Ratna (Pemilik) | `ratna@senyumrekah.id` | `RatnaBoss#24` | `/admin` |
| **Resepsionis** | Laras (Resepsionis) | `laras@senyumrekah.id` | `LarasFront@99` | `/resepsionis` |
| **Dokter 1** | drg. Bima Pratama | `bima@senyumrekah.id` | `DrgBima#88` | `/dokter` |
| **Dokter 2** | drg. Sinta Wijaya | `sinta@senyumrekah.id` | `DrgSinta%77` | `/dokter` |
| **Pasien** | Andi Pratama | `andi@senyumrekah.id` | `AndiSehat&26` | `/beranda` |
