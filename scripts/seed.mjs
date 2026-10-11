import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, Timestamp } from "firebase/firestore";

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

async function seed() {
  console.log("Seeding data to Firestore...");

  // 1. Layanan (PRD 7.1 & 4.14)
  const layananData = [
    {
      id: "layanan-scaling",
      nama: "Pembersihan Karang Gigi (Scaling)",
      durasiMenit: 30,
      harga: 250000,
      aktif: true,
    },
    {
      id: "layanan-tambal",
      nama: "Tambal Gigi Komposit",
      durasiMenit: 30,
      harga: 300000,
      aktif: true,
    },
    {
      id: "layanan-cabut",
      nama: "Cabut Gigi",
      durasiMenit: 30,
      harga: 250000,
      aktif: true,
    },
    {
      id: "layanan-saluran-akar",
      nama: "Perawatan Saluran Akar",
      durasiMenit: 60,
      harga: 500000,
      aktif: true,
    },
    {
      id: "layanan-konsultasi",
      nama: "Pemeriksaan & Konsultasi Umum",
      durasiMenit: 30,
      harga: 150000,
      aktif: true,
    },
  ];

  for (const item of layananData) {
    const { id, ...data } = item;
    await setDoc(doc(db, "layanan", id), data);
    console.log(`Layanan seeded: ${item.nama}`);
  }

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding error:", err);
  process.exit(1);
});
