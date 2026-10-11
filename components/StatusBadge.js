import React from "react";

export default function StatusBadge({ status }) {
  const norm = (status || "").toLowerCase();

  switch (norm) {
    case "menunggu":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200/70">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
          Menunggu Konfirmasi
        </span>
      );
    case "dikonfirmasi":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-800 border border-sky-200/70">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0"></span>
          Dikonfirmasi
        </span>
      );
    case "hadir":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-violet-50 text-violet-800 border border-violet-200/70">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0"></span>
          Hadir di Klinik
        </span>
      );
    case "selesai":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/70">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
          Selesai
        </span>
      );
    case "dibatalkan":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-200/70">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
          Dibatalkan
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0"></span>
          {status || "-"}
        </span>
      );
  }
}
