import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAVCvJxuffVL6dnA3F1wFglIT2VnL_76xo",
  authDomain: "senyum-rekah-89e2b.firebaseapp.com",
  projectId: "senyum-rekah-89e2b",
  storageBucket: "senyum-rekah-89e2b.firebasestorage.app",
  messagingSenderId: "92098996194",
  appId: "1:92098996194:web:8b7867f3c5b6dc19a0fbbb",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function runSeed() {
  console.log("Memulai seeding data lengkap...");

  // 1. Layanan (PRD 4.14 & 7.1)
  const layananList = [
    { id: "layanan-scaling", nama: "Pembersihan Karang Gigi (Scaling)", durasiMenit: 30, harga: 250000, aktif: true },
    { id: "layanan-tambal", nama: "Tambal Gigi Komposit", durasiMenit: 30, harga: 300000, aktif: true },
    { id: "layanan-cabut", nama: "Cabut Gigi", durasiMenit: 30, harga: 250000, aktif: true },
    { id: "layanan-saluran-akar", nama: "Perawatan Saluran Akar", durasiMenit: 60, harga: 500000, aktif: true },
    { id: "layanan-konsultasi", nama: "Pemeriksaan & Konsultasi Umum", durasiMenit: 30, harga: 150000, aktif: true },
  ];

  for (const l of layananList) {
    const { id, ...data } = l;
    await setDoc(doc(db, "layanan", id), data);
  }
  console.log("✓ Layanan berhasil diisi.");

  // 2. Dokter Seed (ID konsisten)
  const bimaId = "dokter-bima";
  const sintaId = "dokter-sinta";
  const larasId = "resepsionis-laras";
  const ratnaId = "admin-ratna";
  const andiId = "pasien-andi";
  const mayaId = "pasien-maya";

  const seedUsers = [
    { id: ratnaId, nama: "Bu Ratna (Pemilik)", email: "ratna@senyumrekah.id", noHp: "081234567891", role: "super_admin", aktif: true },
    { id: larasId, nama: "Laras (Resepsionis)", email: "laras@senyumrekah.id", noHp: "081234567892", role: "resepsionis", aktif: true },
    { id: bimaId, nama: "drg. Bima Pratama", email: "bima@senyumrekah.id", noHp: "081234567893", role: "dokter", aktif: true },
    { id: sintaId, nama: "drg. Sinta Wijaya", email: "sinta@senyumrekah.id", noHp: "081234567894", role: "dokter", aktif: true },
    { id: andiId, nama: "Andi Pratama", email: "andi@gmail.com", noHp: "081234567895", role: "pasien", aktif: true },
    { id: mayaId, nama: "Maya Lestari", email: "maya@gmail.com", noHp: "081234567896", role: "pasien", aktif: true },
  ];

  for (const u of seedUsers) {
    const { id, ...data } = u;
    await setDoc(doc(db, "users", id), {
      ...data,
      dibuatPada: serverTimestamp(),
    });
  }
  console.log("✓ Profil pengguna awal berhasil diisi.");

  // 3. Jadwal Dokter (PRD 4.15 & 7.1)
  const jadwalList = [
    // drg. Bima: Senin, Selasa, Rabu (09:00 - 15:00)
    { id: "jadwal-bima-senin", dokterId: bimaId, hari: "senin", jamMulai: "09:00", jamSelesai: "15:00" },
    { id: "jadwal-bima-selasa", dokterId: bimaId, hari: "selasa", jamMulai: "09:00", jamSelesai: "15:00" },
    { id: "jadwal-bima-rabu", dokterId: bimaId, hari: "rabu", jamMulai: "09:00", jamSelesai: "15:00" },
    // drg. Sinta: Kamis, Jumat, Sabtu (09:00 - 15:00)
    { id: "jadwal-sinta-kamis", dokterId: sintaId, hari: "kamis", jamMulai: "09:00", jamSelesai: "15:00" },
    { id: "jadwal-sinta-jumat", dokterId: sintaId, hari: "jumat", jamMulai: "09:00", jamSelesai: "15:00" },
    { id: "jadwal-sinta-sabtu", dokterId: sintaId, hari: "sabtu", jamMulai: "09:00", jamSelesai: "15:00" },
  ];

  for (const j of jadwalList) {
    const { id, ...data } = j;
    await setDoc(doc(db, "jadwal_dokter", id), data);
  }
  console.log("✓ Jadwal dokter berhasil diisi.");

  // 4. Riwayat Kunjungan Contoh Selesai (Agar laporan dan riwayat langsung memiliki data riil)
  const janjiSampleId = "janji-sample-andi-1";
  await setDoc(doc(db, "janji_temu", janjiSampleId), {
    pasienId: andiId,
    dokterId: bimaId,
    layananId: "layanan-tambal",
    tanggal: "2026-10-05",
    jam: "10:00",
    keluhan: "Gigi geraham kiri bawah berlubang dan linu",
    status: "selesai",
    alasanBatal: "",
    dibuatPada: serverTimestamp(),
  });

  await setDoc(doc(db, "catatan_perawatan", "catatan-sample-1"), {
    janjiId: janjiSampleId,
    pasienId: andiId,
    dokterId: bimaId,
    tindakan: "Tambal gigi komposit klas II geraham 36",
    catatan: "Hindari mengunyah makanan keras di sisi kiri selama 24 jam. Kontrol kembali 6 bulan lagi.",
    dibuatPada: serverTimestamp(),
  });

  const janjiSampleId2 = "janji-sample-maya-1";
  await setDoc(doc(db, "janji_temu", janjiSampleId2), {
    pasienId: mayaId,
    dokterId: sintaId,
    layananId: "layanan-scaling",
    tanggal: "2026-10-08",
    jam: "11:00",
    keluhan: "Pembersihan karang gigi rutin",
    status: "selesai",
    alasanBatal: "",
    dibuatPada: serverTimestamp(),
  });

  await setDoc(doc(db, "catatan_perawatan", "catatan-sample-2"), {
    janjiId: janjiSampleId2,
    pasienId: mayaId,
    dokterId: sintaId,
    tindakan: "Scaling supra dan subgingiva seluruh regio rahang",
    catatan: "Gusi sehat, sikat gigi rutin 2 kali sehari dengan bulu sikat lembut.",
    dibuatPada: serverTimestamp(),
  });

  console.log("✓ Data janji selesai dan rekam medis berhasil diisi.");
  console.log("Seeding lengkap selesai dengan sukses!");
  process.exit(0);
}

runSeed().catch((e) => {
  console.error("Error seeding:", e);
  process.exit(1);
});
