import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Portal Janji Senyum Rekah | Klinik Gigi Senyum Rekah",
  description: "Aplikasi Janji Temu dan Catatan Perawatan Klinik Gigi Senyum Rekah",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
