**PRODUCT REQUIREMENTS DOCUMENT**

Aplikasi Janji Temu dan Catatan Perawatan Klinik Gigi

**PORTAL JANJI SENYUM REKAH**

# **1\. Ringkasan Eksekutif**

**Klinik Gigi Senyum Rekah** adalah klinik gigi kecil di Makassar dengan 2 dokter gigi dan 1 resepsionis, buka Senin sampai Sabtu. Janji temu diterima lewat telepon dan WhatsApp, lalu dicatat di buku. Akibatnya jam janji sering bentrok, pasien lupa jadwalnya, dan catatan perawatan tersimpan di kertas yang sulit dicari.

Portal Janji Senyum Rekah menggantikan buku janji dan catatan kertas dengan satu aplikasi web di janji.senyumrekah.id. Aplikasi dipakai lewat peramban, dari ponsel maupun laptop.

**Yang membuat aplikasi ini pas untuk Senyum Rekah:**

* Janji tidak bentrok lagi. Pasien hanya bisa memilih slot jam yang masih kosong.

* Pasien membuat janji sendiri, tanpa menunggu balasan WhatsApp.

* Masuk tanpa membuat kata sandi baru. Pasien bisa masuk dengan akun Google.

* Setiap peran langsung tiba di halamannya.

* Catatan perawatan tetap rahasia. Resepsionis tidak bisa membacanya, dan dokter hanya membaca catatan pasien yang ia tangani.

* Laporan kunjungan tersusun sendiri dari data janji.

**Yang tidak dibangun di v1:** pembayaran dan kasir online, pengingat WhatsApp atau email, rekam medis lengkap dan odontogram, stok bahan, aplikasi seluler, BPJS dan asuransi, serta unggah foto rontgen. Detail di Bab 9\.

# **2\. Pengguna & Peran**

## **2.1 Empat pemegang akun**

Aplikasi dipegang empat peran. Peran disimpan di profil setiap pengguna, bukan di akun login.

| Peran | Nilai role | Siapa | Tugas utama |
| :---- | :---- | :---- | :---- |
| **Pasien** | pasien | Andi dan Maya | Membuat dan membatalkan janji miliknya, membaca riwayat perawatannya |
| **Resepsionis** | resepsionis | Laras | Mengonfirmasi, menjadwal ulang, membatalkan janji, menandai pasien hadir |
| **Dokter** | dokter | drg. Bima dan drg. Sinta | Melihat jadwalnya, mengisi tindakan dan catatan perawatan |
| **Super Admin** | super\_admin | Bu Ratna, pemilik klinik | Semua hak tiga peran lain, ditambah mengelola pengguna, layanan, jadwal dokter, dan laporan |

Alur kerjanya: pasien membuat janji berstatus Menunggu. Resepsionis mengonfirmasinya. Saat pasien tiba, resepsionis menandainya Hadir. Dokter memeriksa, mengisi catatan, lalu menandai Selesai. Pasien membaca hasilnya di Riwayat Perawatan.

## **2.2 Pengunjung dan cara mendapat peran**

Pengunjung adalah siapa pun yang membuka janji.senyumrekah.id tetapi belum masuk. Pengunjung hanya bisa membuka halaman Daftar dan Masuk.

* Setiap akun baru, baik lewat email maupun Google, otomatis berperan **pasien**, peran awal dengan hak paling sedikit.

* Peran **resepsionis**, **dokter**, dan **super\_admin** hanya bisa diberikan Super Admin lewat menu Kelola Pengguna.

* Akun Super Admin pertama: Bu Ratna mendaftar lewat /daftar seperti biasa, lalu pengembang mengubah field role dokumennya menjadi super\_admin lewat konsol Firebase, atau meminta agen AI lewat Firebase MCP mencari uid berdasarkan email lalu mengubah role.

* Kata sandi tidak pernah disimpan di Firestore.

## **2.3 Hak akses per modul**

| Modul | Pasien | Resepsionis | Dokter | Super Admin |
| :---- | :---- | :---- | :---- | :---- |
| Beranda, Janji Saya | Penuh, hanya miliknya | Tidak tampil | Tidak tampil | Penuh |
| Riwayat Perawatan | Lihat, hanya miliknya | Tidak tampil | Tidak tampil | Lihat |
| Profil | Ubah nama dan nomor HP | Ubah nama dan nomor HP | Ubah nama dan nomor HP | Ubah nama dan nomor HP |
| Dasbor Resepsionis, Kelola Janji | Tidak tampil | Penuh | Tidak tampil | Penuh |
| Data Pasien | Tidak tampil | Lihat kontak | Tidak tampil | Lihat |
| Dasbor Dokter, Pemeriksaan | Tidak tampil | Tidak tampil | Penuh, hanya janji miliknya | Penuh |
| Riwayat Pasien | Tidak tampil | Tidak tampil | Lihat, hanya pasien yang ia tangani | Lihat |
| Dasbor Admin, Layanan, Jadwal Dokter, Laporan | Tidak tampil | Tidak tampil | Tidak tampil | Penuh |
| Kelola Pengguna | Tidak tampil | Tidak tampil | Tidak tampil | Penuh, termasuk mengubah peran |

## **2.4 Yang tidak boleh dilihat tiap peran**

| Data | Pasien | Resepsionis | Dokter |
| :---- | :---- | :---- | :---- |
| Janji pasien lain | **Tidak tampil** | Lihat dan ubah | Hanya janji yang ia tangani |
| Catatan perawatan | Hanya miliknya | **Tidak tampil** | Hanya pasien yang ia tangani |
| Kontak pasien lain | **Tidak tampil** | Lihat | Hanya pasien yang ia tangani |
| Field role | Lihat miliknya, tidak bisa diubah | Lihat miliknya, tidak bisa diubah | Lihat miliknya, tidak bisa diubah |

Hanya super\_admin yang bisa mengubah peran. Menu yang tidak boleh dibuka tidak ditampilkan sama sekali. Selain itu, halamannya tetap menolak bila alamatnya diketik langsung, dan datanya tetap ditolak oleh Security Rules bila diminta lewat konsol peramban.

# **3\. Lingkup Produk**

Aplikasi web. Buka lewat peramban, tanpa instal dari Play Store.

## **3.1 Peta modul**

Pasien  
  Beranda  
  Janji Saya ▼  
    Daftar Janji · Buat Janji  
  Riwayat Perawatan  
  Profil

Resepsionis  
  Dasbor Resepsionis  
  Kelola Janji  
  Data Pasien  
  Profil

Dokter  
  Dasbor Dokter  
  Profil

Super Admin (semua menu peran lain, ditambah)  
  Dasbor Admin  
  Kelola Pengguna  
  Layanan  
  Jadwal Dokter  
  Laporan

Modul tanpa panah \= menu tunggal. Modul dengan panah \= bisa buka-tutup. Pemeriksaan dan Riwayat Pasien tidak ada di menu. Pemeriksaan dibuka dari Dasbor Dokter, Riwayat Pasien dibuka dari Pemeriksaan.

## **3.2 Batas fitur v1**

| Termasuk v1 | Tidak termasuk v1 |
| :---- | :---- |
| Daftar dan masuk dengan email atau Google, empat peran, janji dengan slot jam kosong, lima status janji, catatan perawatan, kelola pengguna, layanan, jadwal dokter, laporan kunjungan bulanan | Pembayaran, pengingat WhatsApp dan email, rekam medis lengkap, stok bahan, aplikasi seluler, BPJS dan asuransi, foto rontgen |

# **4\. Kebutuhan Fungsional**

Bagian ini menjelaskan setiap modul dari sudut pandang pengguna: siapa menekan apa, mengisi apa, dan sistem merespons apa.

## **4.0 Ringkasan modul**

| Modul | Peran | Tujuan |
| :---- | :---- | :---- |
| Daftar dan Masuk | Pengunjung | Masuk dengan email atau Google, lalu diarahkan sesuai peran |
| Beranda | Pasien | Janji terdekat dan tombol Buat Janji |
| Janji Saya | Pasien | Membuat, melihat, dan membatalkan janji |
| Riwayat Perawatan | Pasien | Tindakan dan catatan dari kunjungan yang selesai |
| Profil | Semua | Memperbarui nama dan nomor HP |
| Dasbor Resepsionis | Resepsionis | Janji hari ini per dokter dan jumlah menunggu konfirmasi |
| Kelola Janji | Resepsionis | Konfirmasi, jadwal ulang, batalkan, tandai hadir |
| Data Pasien | Resepsionis | Kontak pasien, tanpa catatan perawatan |
| Dasbor Dokter | Dokter | Jadwal hari ini miliknya |
| Pemeriksaan | Dokter | Mengisi tindakan dan catatan, menandai selesai |
| Riwayat Pasien | Dokter | Catatan pasien yang pernah ia tangani |
| Dasbor Admin | Super Admin | Ringkasan kunjungan hari ini dan bulan ini |
| Kelola Pengguna | Super Admin | Mengubah peran dan menonaktifkan akun |
| Layanan | Super Admin | Nama, durasi, harga, dan status aktif layanan |
| Jadwal Dokter | Super Admin | Hari dan jam praktik tiap dokter |
| Laporan | Super Admin | Kunjungan per dokter dan per layanan per bulan |

## **4.1 Daftar dan Masuk**

Dua halaman publik, keduanya dengan tombol **Masuk dengan Google**.

**Langkah pasien baru mendaftar:**

1. Andi membuka janji.senyumrekah.id/daftar.

2. Mengisi Nama\*, Email\*, Nomor HP\*, dan Kata sandi\*, lalu mengklik Daftar. Atau mengklik Masuk dengan Google.

3. Sistem membuat akun dan profil berperan pasien, lalu membawa Andi ke /beranda.

**Langkah masuk:**

1. Pengguna membuka /masuk, mengisi email dan kata sandi, atau mengklik Masuk dengan Google.

2. Sistem membaca peran dari profil. Pasien diarahkan ke /beranda, resepsionis ke /resepsionis, dokter ke /dokter, super\_admin ke /admin.

**Perilaku otomatis:** pengguna Google yang masuk pertama kali tidak melewati halaman Daftar, jadi profilnya dibuat saat itu juga dengan nomor HP kosong. Profil yang sudah ada tidak boleh tertimpa saat masuk lagi. Pengguna tetap masuk walau halaman dimuat ulang. Pengguna yang sudah masuk lalu membuka /masuk atau /daftar langsung diarahkan ke halamannya. Akun nonaktif melihat pesan “Akun Anda dinonaktifkan. Hubungi klinik.”

**Validasi:** email wajib dan unik, kata sandi minimal 6 karakter, nomor HP hanya angka dan diawali 08\.

**Batasan v1:** lupa kata sandi tidak termasuk.

## **4.2 Beranda**

Tujuan: pasien tahu janji terdekatnya tanpa membuka menu lain.

Isi kartu di /beranda:

* **Janji terdekat:** tanggal, jam, dokter, layanan, dan status. Bila tidak ada, tampil “Belum ada janji”.

* Tombol cepat **Buat Janji**.

**Perilaku otomatis:** kartu ditarik dari janji milik pasien yang masuk. Mengklik kartu membuka rincian janji itu.

## **4.3 Janji Saya**

### **4.3.1 Buat Janji**

**Langkah pasien membuat janji:**

1. Maya membuka Janji Saya → Buat Janji di /janji/baru.

2. Memilih Layanan\*, misalnya Scaling. Hanya layanan aktif yang tampil.

3. Memilih Dokter\* drg. Sinta, lalu Tanggal\*. Hanya hari praktik dokter itu yang bisa dipilih.

4. Sistem menampilkan slot jam yang masih kosong. Maya memilih Slot jam\* 10:00.

5. Mengisi Keluhan\* “Gigi geraham kiri ngilu”, lalu mengklik Kirim.

6. Sistem menyimpan janji berstatus Menunggu dan membawa Maya ke rinciannya.

**Perilaku otomatis:** slot disusun setiap 30 menit dari jam praktik dokter pada hari itu, dengan memperhitungkan durasi layanan. Slot yang bertabrakan dengan janji lain dokter itu yang belum dibatalkan tidak ditampilkan. Untuk mengetahuinya, aplikasi membaca koleksi slot\_terisi yang hanya berisi dokter, tanggal, jam, dan durasi, tanpa nama atau keluhan pasien. Dokumen slot\_terisi dibuat bersama janji dan dihapus saat janji dibatalkan atau dijadwal ulang.

**Validasi:** tanggal paling cepat besok. Bila slot keburu diambil pasien lain, tampil “Slot ini baru saja terisi. Pilih jam lain.”

### **4.3.2 Daftar dan Rincian Janji**

**Tampilan daftar:** di /janji, kolom Tanggal, Jam, Dokter, Layanan, Status, diurutkan dari tanggal terdekat. Status tampil sebagai pil berwarna.

**Langkah membatalkan janji:**

1. Andi membuka Janji Saya dan mengklik janjinya hari Kamis.

2. Rincian terbuka di alamat /janji/ diikuti ID janji, berisi tanggal, jam, dokter, layanan, keluhan, dan status.

3. Andi mengklik Batalkan Janji. Status menjadi Dibatalkan dan slotnya kembali kosong.

**Perilaku otomatis:** status dibaca langsung dari data, sehingga berubah begitu resepsionis bertindak. Bila dibatalkan resepsionis, alasannya ikut tampil. Bila ID di alamat diganti dengan janji orang lain, tampil “Janji tidak ditemukan”.

**Validasi:** pasien hanya bisa membatalkan janji Menunggu atau Dikonfirmasi, paling lambat H-1. Pada hari janji tombol Batalkan tidak tampil.

## **4.4 Riwayat Perawatan**

Tujuan: pasien bisa membaca kembali hasil setiap kunjungannya.

**Tampilan:** di /riwayat, daftar janji berstatus Selesai dengan Tanggal, Dokter, Layanan, Tindakan, dan Catatan dokter, dari yang terbaru. Hanya milik pasien yang masuk.

## **4.5 Profil**

Di /profil, menampilkan nama, email, nomor HP, dan peran. Nama dan nomor HP bisa diubah. Email dan peran tidak bisa diubah dari halaman ini.

## **4.6 Dasbor Resepsionis**

Halaman yang langsung terlihat setelah resepsionis masuk.

Isi kartu:

* **Janji hari ini:** satu kolom per dokter, berisi jam, pasien, layanan, dan status.

* **Menunggu konfirmasi:** jumlah janji berstatus Menunggu.

**Langkah resepsionis memeriksa pagi hari:**

1. Laras masuk → /resepsionis terbuka.

2. Kartu Menunggu konfirmasi: 4 → mengklik angka 4 → masuk Kelola Janji dengan saringan Menunggu.

## **4.7 Kelola Janji**

**Tampilan:** di /resepsionis/janji, semua janji dengan kolom Tanggal, Jam, Pasien, Dokter, Layanan, Status. Saringan status dan tanggal.

**Langkah resepsionis mengelola janji:**

1. Laras memilih saringan Menunggu, lalu mengklik janji Maya. Rincian terbuka di alamat /resepsionis/janji/ diikuti ID janji.

2. Mengklik Konfirmasi. Status menjadi Dikonfirmasi.

3. Andi menelepon minta pindah jam. Laras membuka janji Andi, mengklik Jadwal Ulang, memilih tanggal dan slot kosong baru, lalu Simpan.

4. Bila pasien tidak bisa datang, Laras mengklik Batalkan dan mengisi Alasan\*. Status menjadi Dibatalkan.

5. Saat Maya tiba di klinik, Laras mengklik Tandai Hadir. Janji muncul di Dasbor Dokter sebagai siap diperiksa.

**Perilaku otomatis:** saringan yang dipilih ikut tersimpan di alamat halaman, jadi tautannya bisa dibagikan ke Bu Ratna dengan daftar yang sama. Rincian untuk resepsionis tidak menampilkan catatan perawatan.

**Validasi:** Konfirmasi hanya untuk janji Menunggu. Tandai Hadir hanya untuk janji Dikonfirmasi pada hari ini. Janji Selesai atau Dibatalkan tidak bisa diubah lagi.

## **4.8 Data Pasien**

**Tampilan:** di /resepsionis/pasien, tabel Nama, Email, Nomor HP dengan pencarian nama. Laras mengetik “Andi” untuk mendapat nomor HP-nya.

**Batasan v1:** resepsionis tidak bisa membaca catatan perawatan dari halaman mana pun.

## **4.9 Dasbor Dokter**

Halaman yang langsung terlihat setelah dokter masuk.

**Tampilan:** di /dokter, janji hari ini milik dokter yang masuk dengan kolom Jam, Pasien, Layanan, Keluhan, Status. Janji Hadir ditandai “Siap diperiksa”.

**Perilaku otomatis:** hanya janji dengan dokterId miliknya yang tampil. Janji drg. Sinta tidak terlihat oleh drg. Bima.

## **4.10 Pemeriksaan**

**Langkah dokter mengisi pemeriksaan:**

1. drg. Bima mengklik Andi yang berstatus Hadir di Dasbor Dokter.

2. Halaman terbuka di alamat /dokter/janji/ diikuti ID janji, berisi data pasien, layanan, dan keluhan.

3. Mengisi Tindakan\* “Tambal gigi dengan komposit” dan Catatan\* “Hindari makanan keras 24 jam”.

4. Mengklik Tandai Selesai. Catatan perawatan tersimpan, status janji menjadi Selesai, dan Andi langsung bisa membacanya di Riwayat Perawatan.

**Validasi:** hanya janji milik dokter itu yang berstatus Hadir yang bisa diisi. Bila ID diganti dengan janji dokter lain, tampil “Janji tidak ditemukan”. Satu janji hanya punya satu catatan perawatan.

## **4.11 Riwayat Pasien**

Dari halaman Pemeriksaan, drg. Bima mengklik Lihat riwayat pasien. Halaman terbuka di alamat /dokter/pasien/ diikuti ID pasien, berisi catatan perawatan Andi yang pernah ditulis drg. Bima: Tanggal, Layanan, Tindakan, Catatan. Bila ID diganti dengan pasien yang belum pernah ia tangani, tampil “Pasien tidak ditemukan”.

## **4.12 Dasbor Admin**

Halaman yang langsung terlihat setelah Super Admin masuk, di /admin.

Isi kartu: **Kunjungan hari ini** dan **Kunjungan bulan ini**, yaitu jumlah janji berstatus Selesai, serta **Menunggu konfirmasi**. Mengklik Kunjungan bulan ini membuka Laporan bulan berjalan. Menu samping Super Admin juga memuat semua menu peran lain.

## **4.13 Kelola Pengguna**

**Tampilan:** di /admin/pengguna, tabel Nama, Email, Peran, Status dengan pencarian nama.

**Langkah Super Admin memberi peran dokter:**

1. Bu Ratna mengklik nama drg. Sinta. Rincian terbuka di alamat /admin/pengguna/ diikuti ID pengguna.

2. Mengubah Peran menjadi Dokter → Simpan.

3. Saat drg. Sinta masuk lagi, ia diarahkan ke /dokter.

Di halaman yang sama Bu Ratna bisa mengklik Nonaktifkan. Akun itu tidak bisa lagi membuka halaman mana pun.

**Validasi:** peran hanya bernilai pasien, resepsionis, dokter, atau super\_admin. Bu Ratna tidak bisa menonaktifkan atau menurunkan peran akunnya sendiri.

## **4.14 Layanan**

Di /admin/layanan, Bu Ratna mengklik Tambah Layanan, mengisi Nama\* “Cabut Gigi”, Durasi menit\* 30, Harga\* 250000, mencentang Aktif, lalu Simpan. Layanan langsung bisa dipilih di Buat Janji.

**Validasi:** durasi kelipatan 30 menit. Layanan yang pernah dipakai janji tidak dihapus, cukup dinonaktifkan.

## **4.15 Jadwal Dokter**

Di /admin/jadwal-dokter, Bu Ratna memilih drg. Bima, mengklik Tambah Hari, memilih Hari\* Senin, Jam Mulai\* 09:00, Jam Selesai\* 15:00, lalu Simpan. Senin langsung bisa dipilih pasien untuk drg. Bima.

**Validasi:** hari hanya Senin sampai Sabtu. Jam selesai setelah jam mulai. Satu dokter satu jadwal per hari.

## **4.16 Laporan**

**Langkah membaca laporan:**

1. Bu Ratna membuka /admin/laporan dan memilih bulan Oktober.

2. Tabel pertama menampilkan jumlah kunjungan per dokter, tabel kedua per layanan.

**Perilaku otomatis:** kunjungan dihitung dari janji berstatus Selesai. Bulan yang dipilih tersimpan di alamat halaman.

**Batasan v1:** ekspor Excel dan PDF serta perhitungan pendapatan tidak termasuk.

# **5\. Identitas Visual & Prinsip Antarmuka**

Tampilan bersih dengan menu samping, panel putih, dan tema terang. Mengikuti warna Senyum Rekah.

## **5.1 Warna**

| Nama | Kode | Pakai untuk |
| :---- | :---- | :---- |
| Biru Rekah | \#0E7490 | Tombol utama, menu aktif, bilah atas |
| Latar aplikasi | \#F4F7F9 | Latar di belakang panel |
| Panel | \#FFFFFF | Panel isi halaman |
| Teks | \#1F2937 | Teks utama |
| Teks redup | \#5A6B78 | Keterangan dan label |

## **5.2 Warna status janji**

| Status | Kode |
| :---- | :---- |
| Menunggu | \#F59E0B |
| Dikonfirmasi | \#2563EB |
| Hadir | \#7C3AED |
| Selesai | \#15A66A |
| Dibatalkan | \#E53935 |

## **5.3 Tipografi**

* Font UI: Inter (400, 500, 600, 700). Fallback: system-ui.

* Jam, tanggal, dan harga memakai tabular-nums agar kolom rata.

## **5.4 Prinsip antarmuka**

* Menu yang tidak boleh dibuka suatu peran tidak ditampilkan. Halamannya tetap dijaga bila alamatnya diketik langsung.

* Halaman yang menolak pengguna menjelaskan alasannya dan memberi tombol kembali, tanpa kode teknis.

* Setiap halaman yang mengambil data menampilkan empat keadaan: memuat, berhasil, kosong, dan gagal dengan tombol Coba lagi.

* Tombol yang mengubah status meminta konfirmasi sebelum dijalankan.

# **6\. Kebutuhan Non-Fungsional**

## **6.1 Akses**

* Masuk dengan email dan kata sandi, atau akun Google.

* Bahasa antarmuka Indonesia.

* Pengguna tetap masuk saat halaman dimuat ulang. Selama keadaan masuk dan peran masih dibaca, aplikasi menampilkan indikator memuat dan tidak mengarahkan pengguna ke mana pun.

## **6.2 Penjagaan halaman dan data**

Dua lapis, masing-masing untuk jalur yang berbeda.

| Lapis | Menjaga | Cara |
| :---- | :---- | :---- |
| Route guard | Halaman | Pemeriksaan setelah peran terbaca. Belum masuk diarahkan ke /masuk; peran yang tidak berhak melihat Akses Ditolak |
| Security Rules | Data di Firestore | Pemilik data lewat pasienId dan dokterId, peran dan status aktif lewat profil di koleksi users |

Security Rules juga mengunci field role dan aktif agar hanya bisa diubah super\_admin, mengunci status janji agar pasien hanya bisa mengubahnya menjadi dibatalkan, dan menolak resepsionis membaca catatan\_perawatan.

## **6.3 Alamat halaman**

* Setiap halaman bisa dibuka langsung dari alamatnya dan tetap tampil saat dimuat ulang.

* Alamat yang tidak dikenal menampilkan halaman 404 dengan tombol kembali.

* Pengguna yang diarahkan ke halaman Masuk dikembalikan ke halaman tujuannya setelah berhasil masuk.

# **7\. Teknologi yang Digunakan**

| Lapisan | Teknologi | Catatan |
| :---- | :---- | :---- |
| Aplikasi web | Next.js (App Router) | Dibangun dengan agen AI di Antigravity. Setiap halaman menjadi satu folder di app/ |
| Masuk | Firebase Authentication | Email dan kata sandi, serta akun Google |
| Basis data | Cloud Firestore | Enam koleksi, lihat 7.1 |
| Penjagaan data | Firestore Security Rules | Menegakkan kepemilikan dan peran |
| Hosting | Netlify | Alamat Netlify didaftarkan di Authorized domains Firebase agar masuk dengan Google berjalan |

## **7.1 Struktur data Firestore**

Nama koleksi dan field mengikuti tabel ini, bukan nama buatan agen AI.

| Koleksi | Field | Tipe | Keterangan |
| :---- | :---- | :---- | :---- |
| users | ID dokumen | string | Sama dengan uid akun Firebase Authentication |
|  | nama, email | string |  |
|  | noHp | string | Format 081234567890, boleh kosong |
|  | role | string | pasien, resepsionis, dokter, atau super\_admin |
|  | aktif | boolean | false bila dinonaktifkan |
|  | dibuatPada | timestamp |  |
| layanan | nama | string |  |
|  | durasiMenit | number | Kelipatan 30 |
|  | harga | number | Dalam rupiah |
|  | aktif | boolean |  |
| jadwal\_dokter | dokterId | string | uid dokter |
|  | hari | string | senin sampai sabtu |
|  | jamMulai, jamSelesai | string | Format 09:00 |
| janji\_temu | pasienId, dokterId | string | uid pasien dan uid dokter |
|  | layananId | string | ID dokumen layanan |
|  | tanggal | string | Format 2026-10-12 |
|  | jam | string | Format 10:00 |
|  | keluhan | string |  |
|  | status | string | menunggu, dikonfirmasi, hadir, selesai, atau dibatalkan |
|  | alasanBatal | string | Diisi saat resepsionis membatalkan |
|  | dibuatPada | timestamp |  |
| catatan\_perawatan | janjiId | string | ID dokumen janji |
|  | pasienId, dokterId | string | uid pasien dan uid dokter penulis |
|  | tindakan, catatan | string |  |
|  | dibuatPada | timestamp |  |
| slot\_terisi | ID dokumen | string | Sama dengan ID dokumen janji |
|  | dokterId | string | uid dokter |
|  | tanggal, jam | string | Sama dengan janji |
|  | durasiMenit | number | Dari layanan yang dipilih |

# **8\. Pengujian**

Pengujian penerimaan dilakukan per modul mengikuti alur pada Bab 4: mendaftar dengan email dan Google, masuk sebagai keempat peran, membuat dan membatalkan janji, mengonfirmasi, menjadwal ulang, menandai hadir, mengisi pemeriksaan, membaca riwayat, mengubah peran, menonaktifkan akun, mengatur layanan dan jadwal dokter, serta membaca laporan.

Termasuk di dalamnya uji tembus: pasien mengetik /resepsionis secara langsung, pasien mengganti ID di alamat rincian janji dengan milik orang lain, pasien menaikkan perannya sendiri lewat konsol peramban, resepsionis membaca catatan\_perawatan lewat konsol peramban, dan drg. Bima membuka Pemeriksaan untuk janji drg. Sinta. Kelima percobaan harus ditolak.

# **9\. Batas Lingkup Pekerjaan**

| Tidak termasuk v1 | Alasan |
| :---- | :---- |
| Pembayaran dan kasir online | Pembayaran tetap di meja resepsionis |
| Pengingat WhatsApp dan email | Butuh layanan pengiriman pesan berbayar; status sudah terlihat di aplikasi |
| Rekam medis lengkap dan odontogram | v1 cukup tindakan dan catatan |
| Stok bahan | Diurus terpisah oleh klinik |
| Aplikasi seluler | Hanya web, bisa dibuka dari peramban ponsel |
| BPJS dan asuransi | Klaim punya alur dan aturan tersendiri |
| Unggah foto rontgen | Butuh penyimpanan berkas dan penjagaan tambahan |

Setelah PRD disepakati, modul, peran, dan alur inti pada Bab 4 tidak diubah lagi. Perubahan tampilan masih dimungkinkan.

# **10\. Kamus Istilah**

| Istilah | Arti |
| :---- | :---- |
| Pasien, Resepsionis, Dokter, Super Admin | Empat peran, lihat 2.1 |
| Peran awal | Peran yang otomatis diberikan saat akun dibuat, yaitu pasien |
| Pengunjung | Orang yang membuka portal tetapi belum masuk |
| Profil | Dokumen di koleksi users yang ID-nya sama dengan uid pengguna |
| Janji temu | Pesanan waktu periksa dengan layanan, dokter, tanggal, jam, dan keluhan |
| Slot jam | Jam mulai yang masih kosong pada jadwal praktik dokter |
| Menunggu, Dikonfirmasi, Hadir, Selesai, Dibatalkan | Lima status janji temu |
| H-1 | Sehari sebelum tanggal janji, batas pasien membatalkan sendiri |
| Catatan perawatan | Tindakan dan catatan dokter saat janji ditandai Selesai |
| Nonaktif | Akun yang tidak bisa membuka halaman apa pun walau berhasil masuk |
| Route guard | Pemeriksaan sebelum halaman tampil yang memutuskan halaman dibuka atau ditolak |
| Security Rules | Aturan Firestore yang memeriksa setiap permintaan data |
| pasienId, dokterId | Field penanda pasien dan dokter pada janji\_temu dan catatan\_perawatan |

