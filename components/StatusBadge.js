import React from "react";

export default function StatusBadge({ status }) {
  const norm = (status || "").toLowerCase();

  switch (norm) {
    case "menunggu":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-[#F59E0B] border border-amber-200">
          Menunggu
        </span>
      );
    case "dikonfirmasi":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-[#2563EB] border border-blue-200">
          Dikonfirmasi
        </span>
      );
    case "hadir":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-[#7C3AED] border border-purple-200">
          Hadir
        </span>
      );
    case "selesai":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-[#15A66A] border border-emerald-200">
          Selesai
        </span>
      );
    case "dibatalkan":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-[#E53935] border border-red-200">
          Dibatalkan
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
          {status || "-"}
        </span>
      );
  }
}
