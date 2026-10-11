# **Tugas Mandiri Sesi 6: Membangun Aplikasi Empat Peran**

Bootcamp AI Web Programming · Sesi 6 · Oktober 2026

## **Konteks: Kenapa Ada Tugas Ini?**

Di kelas kamu memasang login, peran, pengalihan, dan *route guard* di App 3\. Tetapi *codebase*\-nya disiapkan mentor, dan perannya hanya dua: karyawan dan HRD.

Di tugas ini kamu mengulang seluruh alur itu **sendiri, dari nol, untuk empat peran**. Kamu membaca PRD dan menyusun matriks akses serta peta route. Setelah itu kamu membuat proyek baru, memasang login, membuat Super Admin pertama, menjaga empat kelompok halaman, menguji dengan empat akun, lalu menayangkan aplikasinya dan mengumpulkan hasilnya.

Empat peran membuat keputusannya lebih sulit daripada App 3\. Contohnya: apakah resepsionis boleh membuka halaman dokter? Apakah staf boleh mengubah nilai siswa? Jawabannya ada di PRD, dan kamu yang harus menuliskannya menjadi aturan.

## **Pilih Satu PRD**

Pilih **salah satu** dari dua PRD ini. Keduanya punya pola peran yang sama, jadi tingkat kesulitannya setara.

|  | Portal Janji Senyum Rekah | Portal Belajar Langkah Juara |
| :---- | :---- | :---- |
| Usaha | Klinik Gigi Senyum Rekah | Bimbel Langkah Juara |
| Alamat | janji.senyumrekah.id | belajar.langkahjuara.id |
| Pemilik (super\_admin) | Bu Ratna | Pak Arif |
| Staf depan | resepsionis: Laras | staf: Kak Fira |
| Tenaga ahli | dokter: drg. Bima, drg. Sinta | tutor: Kak Dimas, Kak Nadia |
| Pelanggan, peran awal | pasien: Andi, Maya | siswa: Raka, Salsa |
| Halaman awal setelah masuk | /beranda, /resepsionis, /dokter, /admin | /beranda, /staf, /tutor, /admin |
| Koleksi Firestore | 6 koleksi | 7 koleksi |
| Berkas PRD | [PRD\_Tugas\_Portal\_Janji\_Senyum\_Rekah.docx](https://docs.google.com/document/d/1igeIq08-djQxGJkmev56TGTrcqdoJtqz/edit?usp=drive_link&ouid=117487934105322587482&rtpof=true&sd=true) | [PRD\_Tugas\_Portal\_Belajar\_Langkah\_Juara.docx](https://docs.google.com/document/d/1wtkJjtmAQKqHiLIDIPmI6zQ4UzHQWI-i/edit?usp=drive_link&ouid=117487934105322587482&rtpof=true&sd=true) |

Tulis pilihanmu saat mengumpulkan tugas. Pilihan tidak bisa diganti di tengah jalan.

## **Hasil Akhir yang Diharapkan**

1. Matriks akses dan peta route empat peran, disimpan di folder proyek sebagai docs/rancangan.md.

2. Aplikasi Next.js dan proyek Firebase milikmu sendiri, dibuat dari folder kosong di laptopmu.

3. Login dengan email dan Google. Setiap pengguna punya dokumen users/{uid} dengan peran.

4. Super Admin pertama, dan halaman Kelola Pengguna untuk memberi peran lain.

5. Setiap peran tiba di halamannya sendiri. Halaman di luar perannya ditolak.

6. Satu alur inti dari PRD berjalan dari awal sampai akhir.

7. Tabel uji dengan empat akun, semua lolos.

8. Aplikasi tayang di Netlify, lalu dikumpulkan lewat formulir dari mentor.

## **Aturan Tugas**

1. **Dikerjakan sendiri.** Boleh berdiskusi, tetapi kode, rancangan, dan prompt harus milikmu.

2. **Proyek baru.** Jangan memakai folder App 3\. Buat folder dan proyek Firebase baru.

3. **Ikuti PRD.** Nama koleksi, nama *field*, nilai role, dan alamat halaman tidak boleh diganti.

4. **Satu prompt, satu pekerjaan.** Baca *diff*, uji, lalu *commit*.

5. **Kata sandi tidak pernah disimpan di Firestore.**

6. **Batas waktu** diumumkan mentor di kelas.

## **Tahap 1: Rancang Dulu**

Tahap ini mengulang alur Sesi 5\. Jangan membuka Antigravity sebelum tahap ini selesai.

**Langkah:**

1. Baca Bab 2, 3, dan 4 PRD pilihanmu.

2. Tulis daftar fitur dari Bab 4\. Setiap fitur diberi nomor subbab, misalnya “Membuat janji temu (4.3)”.

3. Susun **matriks akses**. Baris berisi fitur, kolom berisi lima pengguna: Pengunjung dan keempat peran. Isi setiap sel dengan ✓, ✕, atau ✓ milik sendiri.

4. Susun **peta route**. Satu baris per halaman di Bab 4\.

5. Tulis keduanya di docs/rancangan.md, lalu *commit* bersama kerangka proyek di Tahap 2\.

**Bentuk matriks akses:**

| Fitur (subbab PRD) | Pengunjung | Pelanggan | Staf depan | Tenaga ahli | Super Admin |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Contoh: Membuat janji temu (4.3) | ✕ | ✓ milik sendiri | … | … | … |

**Bentuk peta route:**

| Halaman | Alamat | Peran yang boleh membuka | Belum masuk | Peran lain |
| :---- | :---- | :---- | :---- | :---- |
| Contoh: Kelola Janji | /resepsionis/janji | resepsionis, super\_admin | ke /masuk | Akses Ditolak |

**Keputusan yang wajib kamu jawab di rancangan.** Tulis jawabannya beserta subbab PRD yang menjadi dasarnya.

| Klinik Gigi | Bimbel |
| :---- | :---- |
| Bolehkah resepsionis membaca catatan perawatan? | Bolehkah staf mengubah nilai tugas? |
| Bolehkah drg. Bima membuka pemeriksaan janji drg. Sinta? | Bolehkah Kak Dimas membuka kelas Kak Nadia? |
| Bolehkah pasien melihat jam yang sudah terisi pasien lain? | Bolehkah Raka melihat nilai Salsa? |
| Halaman mana saja yang boleh dibuka Bu Ratna? | Halaman mana saja yang boleh dibuka Pak Arif? |

**Cek hasil:**

☐ Setiap subbab di Bab 4 punya minimal satu fitur di matriks.

☐ Setiap halaman di Bab 4 punya satu baris di peta route.

☐ Keempat keputusan di atas sudah dijawab dengan rujukan PRD.

## **Tahap 2: Siapkan Proyek**

Urutannya sama dengan Praktik 1 di kelas: sambungkan ke Firebase dulu, baru pasang login.

**Langkah:**

1. Buat folder baru di Local Disk D, misalnya D:\\Bootcamp\\portal-senyum-rekah atau D:\\Bootcamp\\portal-langkah-juara, lalu buka di Antigravity.

2. Simpan PRD dalam bentuk teks di docs/PRD.md supaya agen bisa membacanya.

3. Kirim prompt kerangka di bawah. Periksa hasilnya dengan npm run dev.

4. Buat proyek baru di Firebase console, lalu salin link proyeknya.

5. Kirim prompt Firebase di bawah: sambungkan proyek, buat database, dan isi *seed data*.

6. Di **Authentication › Sign-in method**, aktifkan **Email/Password** dan **Google**. Di **Authorized domains**, pastikan localhost ada. Bila belum ada, tambahkan.

**Contoh prompt kerangka.** Ganti bagian dalam kurung siku.

Baca docs/PRD.md. Buat proyek Next.js (App Router, JavaScript, Tailwind) untuk \[nama aplikasi\] di folder ini. Buat semua halaman di Bab 4 dengan tampilan sesuai Bab 5, tetapi tanpa login dan tanpa penjagaan halaman. Nama halaman dan alamat harus sama persis dengan PRD.

**Contoh prompt Firebase.** Kirim satu per satu, sama seperti Prompt 1 dan 2 di kelas.

Ini proyek Firebase untuk aplikasi ini: \[link proyek Firebase\]. Pakai Firebase MCP dan fokus hanya ke proyek ini. Daftarkan aplikasi web, isi .env.local, lalu buat lib/firebase.js.

Buat database Cloud Firestore di proyek ini dengan aturan mode uji sementara. Isi seed data untuk setiap koleksi di PRD 7.1. Nama koleksi dan field harus sama persis dengan PRD.

## **Tahap 3: Login dan Dokumen Users**

Pola prompt-nya sama dengan Prompt 1 dan 2 di Sesi 6\. Bedanya, peran awalnya mengikuti PRD pilihanmu.

**Langkah:**

1. Pasang login email dan Google di /daftar dan /masuk. Uji: daftar dengan email, keluar, lalu masuk lagi.

2. Buat dokumen users/{uid} saat pertama masuk, dengan peran awal sesuai PRD 2.2. Uji: masuk dengan Google dua kali, dan pastikan dokumen tidak tertimpa.

3. Tampilkan nama dan peran di bilah atas, dibaca dari users/{uid}.

**Contoh prompt dokumen users:**

Setelah pengguna berhasil masuk dengan cara apa pun, cek dokumen users/{uid}. Bila belum ada, buat dokumen dengan field sesuai PRD 7.1 dan role "\[peran awal\]". Bila sudah ada, jangan diubah. Jangan simpan kata sandi di dokumen ini.

## **Tahap 4: Super Admin Pertama dan Kelola Pengguna**

Ikuti PRD 2.2: pemilik mendaftar seperti pengguna biasa, lalu perannya dinaikkan.

**Langkah:**

1. Daftar lewat /daftar sebagai pemilik, misalnya ratna@senyumrekah.id atau arif@langkahjuara.id.

2. Kirim prompt Super Admin di bawah. Periksa hasilnya di konsol Firebase.

3. Keluar, lalu masuk lagi sebagai pemilik.

4. Buat halaman Kelola Pengguna sesuai PRD. Super Admin bisa mengubah peran pengguna lain.

5. Buat tiga akun uji lain, lalu beri mereka peran staf depan dan tenaga ahli lewat halaman Kelola Pengguna. Akun pelanggan tidak perlu diubah.

**Contoh prompt Super Admin:**

Pakai Firebase MCP. Cari pengguna di Firebase Authentication dengan email \[email pemilik\], lalu ambil uid-nya. Ubah field role di dokumen users/{uid} menjadi "super\_admin". Jangan mengubah field lain dan jangan membuat akun baru. Tunjukkan isi dokumen setelah diubah.

**Cek hasil:**

☐ Dokumen pemilik berperan super\_admin, tanpa *field* kata sandi.

☐ Keempat peran sudah punya minimal satu akun uji.

☐ Hanya Super Admin yang bisa membuka Kelola Pengguna.

## **Tahap 5: Pengalihan dan Route Guard**

Ini inti tugas. Isi prompt diambil dari peta route di Tahap 1, bukan ditebak.

**Langkah:**

1. Pasang pengalihan setelah masuk untuk keempat peran, sesuai PRD.

2. Pasang *route guard* untuk setiap kelompok halaman. Super Admin boleh membuka semuanya.

3. Pastikan *route guard* menampilkan layar memuat sampai peran selesai dibaca.

4. Jalankan tabel uji di Tahap 6\.

**Contoh prompt *route guard* satu kelompok halaman:**

Pasang route guard untuk semua alamat \[/resepsionis atau /staf\]. Yang boleh membuka hanya role "\[staf depan\]" dan "super\_admin". Pengguna yang belum masuk diarahkan ke /masuk. Peran lain melihat halaman Akses Ditolak. Selama role belum selesai dibaca dari users/{uid}, tampilkan layar Memuat... dan jangan memutuskan apa pun.

Ulangi pola ini untuk kelompok halaman tenaga ahli, pelanggan, dan /admin. Kirim satu prompt untuk setiap kelompok.

## **Tahap 6: Uji dengan Empat Akun**

Tulis tabel ujimu sendiri, minimal **16 baris**: empat akun dikali empat kelompok halaman, ditambah uji pengunjung. Ketik alamatnya langsung di kolom alamat browser.

**Bentuk tabel uji:**

| No | Akun | Yang dilakukan | Hasil yang benar | Lolos? |
| :---- | :---- | :---- | :---- | :---- |
| 1 | Belum masuk | Buka /beranda | Dialihkan ke /masuk | ☐ |
| 2 | Pelanggan | Ketik /admin | Muncul Akses Ditolak | ☐ |
| 3 | Super Admin | Buka halaman tenaga ahli | Halaman terbuka | ☐ |
| … | … | … | … | ☐ |

Tambahkan juga uji muat ulang halaman untuk setiap peran. Simpan tabel ini di docs/uji.md.

## **Tahap 7: Alur Inti**

Bangun satu alur inti sampai berjalan dengan data sungguhan di Firestore. Pola prompt-nya sama dengan Prompt 3 di kelas: minta agen memastikan setiap langkah membaca dan menulis ke Firestore.

| PRD | Alur inti yang wajib berjalan |
| :---- | :---- |
| Klinik Gigi | Pasien membuat janji (4.3) → resepsionis mengonfirmasi lalu menandai hadir (4.7) → dokter mengisi pemeriksaan dan menandai selesai (4.10) → pasien membaca riwayat perawatan (4.4) |
| Bimbel | Siswa mendaftar program (4.3) → staf menyetujui lalu memasukkan siswa ke kelas (4.8, 4.9) → tutor membuat tugas (4.13) → siswa mengumpulkan (4.5) → tutor memberi nilai → siswa membaca nilai |

Modul lain di PRD menjadi **nilai tambah**. Kerjakan bila alur inti sudah berjalan.

## **Tahap 8: Tayang dan Kumpulkan**

**Langkah:**

1. Tayangkan ke Netlify. Ikuti **Panduan Menayangkan App 3 ke Netlify**, Cara A, dengan nama situs sesuai aplikasimu.

2. Daftarkan alamat Netlify di **Authorized domains**.

3. Ulangi uji masuk keempat peran di alamat publik.

4. Kumpulkan lewat formulir dari mentor.

**Isi formulir pengumpulan:**

| Bagian | Isi |
| :---- | :---- |
| PRD yang dipilih | Klinik Gigi atau Bimbel |
| Alamat publik | Alamat Netlify |
| Rancangan | File docs/rancangan.md |
| Hasil uji | File docs/uji.md |
| Yang dikerjakan | Daftar tahap dan modul yang selesai |
| Akun uji | Email keempat akun uji. Kata sandi dikirim lewat pesan pribadi ke trainer |

## **Yang Dikumpulkan**

☐ Alamat Netlify yang bisa dibuka.

☐ docs/rancangan.md berisi matriks akses, peta route, dan jawaban keputusan.

☐ docs/uji.md berisi tabel uji yang sudah dicentang.

☐ Email keempat akun uji.

## **Kriteria Penilaian**

| Aspek | Yang dilihat trainer | Bobot |
| :---- | :---- | :---- |
| Rancangan | Matriks dan peta route lengkap, keputusan dijawab dengan rujukan PRD | 15 |
| Login dan dokumen users | Email dan Google berjalan, peran awal benar, dokumen tidak tertimpa, tanpa kata sandi | 15 |
| Peran dan Kelola Pengguna | Super Admin pertama ada, peran lain diberikan lewat aplikasi | 15 |
| Pengalihan dan *route guard* | Keempat peran tiba di halamannya, halaman di luar peran ditolak, tidak berkedip saat dimuat ulang | 20 |
| Pengujian | Minimal 16 baris, semua lolos, sesuai kenyataan saat trainer mencoba | 10 |
| Alur inti | Berjalan dari awal sampai akhir dengan data di Firestore | 15 |
| Tayang dan pengumpulan | Tayang, login Google jalan di alamat publik, berkas lengkap | 10 |
| **Jumlah** |  | **100** |

Modul tambahan di luar alur inti bisa menambah nilai sampai 10 poin.

## **Batas Tugas**

* **Data belum dikunci.** *Route guard* menjaga halaman, tetapi data di Firestore belum dijaga *security rules*. Itu dibahas di sesi berikutnya, jadi uji tembus di Bab 8 PRD belum dinilai.

* **Tidak ada pembayaran.** Bagian di Bab 9 PRD tidak perlu dibangun.

* **Tampilan boleh sederhana.** Yang dinilai adalah login, peran, penjagaan, dan alur inti.

## **Masalah yang Sering Terjadi**

| Gejala | Cara memperbaiki |
| :---- | :---- |
| Login Google gagal di laptop | Tambahkan localhost di Authorized domains |
| Login Google gagal di Netlify | Tambahkan alamat Netlify di Authorized domains |
| Super Admin masih diarahkan ke /beranda | Keluar, lalu masuk lagi |
| Peran yang sudah diubah kembali ke peran awal | Pembuatan dokumen menimpa yang sudah ada. Minta agen memeriksa dulu sebelum membuat |
| Super Admin ikut ditolak di halaman staf | Peta route belum memasukkan super\_admin ke peran yang boleh membuka |
| Halaman sempat menampilkan Akses Ditolak saat dimuat ulang | *Route guard* belum menunggu peran selesai dibaca |
| Agen membuat nama koleksi sendiri | Tolak *diff*\-nya, sebut nama koleksi dari PRD 7.1 di prompt |

