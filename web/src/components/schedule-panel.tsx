"use client";

import Link from "next/link";
import { useState } from "react";
import { useToday } from "@/lib/use-today";
import { id } from "react-day-picker/locale";
import { Calendar } from "@/components/ui/calendar";
import { fromLocalDate, toLocalDate } from "@/lib/dates";
import { tanggal } from "@/lib/format";
import { SCHEDULE_DOT, SCHEDULE_LABEL, type ScheduleEvent, type ScheduleType } from "@/lib/schedule";
import type { ISODate } from "@/lib/types";
import { cn } from "@/lib/utils";

const TYPES: ScheduleType[] = ["pasang", "acara", "bongkar", "ambil", "kembali"];

export function EventRow({ e }: { e: ScheduleEvent }) {
  return (
    <Link href={`/admin/pesanan/${e.orderId}`} className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm hover:bg-muted">
      <span className={cn("size-2 shrink-0 rounded-full", SCHEDULE_DOT[e.type])} />
      <span className="w-16 shrink-0 text-xs text-muted-foreground">{SCHEDULE_LABEL[e.type]}</span>
      <span className="min-w-0 flex-1 truncate"><b className="font-medium">{e.customer}</b> <span className="text-muted-foreground">· {e.place}</span></span>    </Link>
  );
}

/** Kalender mini + daftar kegiatan per tanggal (FR-39). */
export function SchedulePanel({ events }: { events: ScheduleEvent[] }) {
  const today = useToday();
  const [picked, setDay] = useState<ISODate>();
  const day = picked ?? today;
  const [filter, setFilter] = useState<ScheduleType | "semua">("semua");

  const byType = (t: ScheduleType) => events.filter((e) => e.type === t).map((e) => toLocalDate(e.date));
  const list = events.filter((e) => e.date === day && (filter === "semua" || e.type === filter));
  const upcoming = day ? events.filter((e) => e.date > day && (filter === "semua" || e.type === filter)).slice(0, 5) : [];
  // kalender butuh "hari ini", jadi baru dirender di browser
  if (!today) return <div className="h-80 animate-pulse rounded-xl bg-muted" />;

  return (
    <div className="grid gap-6 md:grid-cols-[auto_1fr]">
      <Calendar
        mode="single"
        locale={id}
        selected={day ? toLocalDate(day) : undefined}
        onSelect={(d) => d && setDay(fromLocalDate(d))}
        modifiers={Object.fromEntries(TYPES.map((t) => [t, byType(t)]))}
        modifiersClassNames={{ pasang: "has-ev ev-pasang", bongkar: "has-ev ev-bongkar", acara: "has-ev ev-acara", ambil: "has-ev ev-ambil", kembali: "has-ev ev-kembali" }}
        className="rounded-xl bg-card p-2 ring-1 ring-foreground/[0.06] [--cell-size:--spacing(9)] [&_.has-ev_button]:font-semibold [&_.ev-pasang_button]:underline [&_.ev-pasang_button]:decoration-janur [&_.ev-pasang_button]:decoration-2 [&_.ev-pasang_button]:underline-offset-4"
      />
      <div className="min-w-0 space-y-4">
        <div className="flex flex-wrap gap-1.5">
          {(["semua", ...TYPES] as const).map((t) => (
            <button key={t} onClick={() => setFilter(t)} className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition", filter === t ? "border-pine bg-pine text-pine-foreground" : "text-muted-foreground hover:text-foreground")}>
              {t !== "semua" && <span className={cn("size-1.5 rounded-full", SCHEDULE_DOT[t])} />}
              {t === "semua" ? "Semua" : SCHEDULE_LABEL[t]}
            </button>
          ))}
        </div>
        <div>
          <p className="mb-1 text-sm font-medium">{day ? tanggal(day) : "…"}</p>
          {list.length ? list.map((e, i) => <EventRow key={i} e={e} />) : <p className="py-3 text-sm text-muted-foreground">Tidak ada kegiatan.</p>}
        </div>
        {upcoming.length > 0 && (
          <div>
            <p className="mb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">Berikutnya</p>
            {upcoming.map((e, i) => (
              <div key={i} className="flex items-center gap-2"><span className="w-14 shrink-0 text-xs text-muted-foreground tabular">{e.date.slice(8)}/{e.date.slice(5, 7)}</span><div className="min-w-0 flex-1"><EventRow e={e} /></div></div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
