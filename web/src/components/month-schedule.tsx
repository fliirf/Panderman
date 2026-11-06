"use client";

import Link from "next/link";
import { useState } from "react";
import { useToday } from "@/lib/use-today";
import { CaretLeftIcon as ChevronLeft, CaretRightIcon as ChevronRight } from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import { addDays, fromLocalDate } from "@/lib/dates";
import { SCHEDULE_DOT, SCHEDULE_LABEL, type ScheduleEvent } from "@/lib/schedule";
import { cn } from "@/lib/utils";

const DAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
const monthFmt = new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" });

/** Kalender bulanan semua kegiatan lapangan (FR-39). */
export function MonthSchedule({ events }: { events: ScheduleEvent[] }) {
  const today = useToday();
  const [picked, setMonth] = useState<{ y: number; m: number }>();
  const month = picked ?? (today ? { y: Number(today.slice(0, 4)), m: Number(today.slice(5, 7)) - 1 } : undefined);
  if (!month) return <div className="h-[600px] animate-pulse rounded-2xl bg-muted" />;

  const first = new Date(month.y, month.m, 1);
  const start = addDays(fromLocalDate(first), -((first.getDay() + 6) % 7)); // mulai Senin
  const cells = Array.from({ length: 42 }, (_, i) => addDays(start, i));
  const shift = (n: number) => setMonth(({ y, m } = month) => ({ y: m + n < 0 ? y - 1 : m + n > 11 ? y + 1 : y, m: (m + n + 12) % 12 }));

  return (
    <div className="overflow-hidden rounded-[1.75rem] bg-card ring-1 ring-foreground/[0.06]">
      <div className="flex items-center justify-between border-b p-4">
        <p className="font-display text-2xl capitalize">{monthFmt.format(first)}</p>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={() => { const d = new Date(); setMonth({ y: d.getFullYear(), m: d.getMonth() }); }}>Hari ini</Button>
          <Button variant="ghost" size="icon" onClick={() => shift(-1)} aria-label="Bulan sebelumnya"><ChevronLeft /></Button>
          <Button variant="ghost" size="icon" onClick={() => shift(1)} aria-label="Bulan berikutnya"><ChevronRight /></Button>
        </div>
      </div>
      <div className="flex flex-wrap gap-4 border-b px-4 py-2.5 text-xs text-muted-foreground">
        {Object.entries(SCHEDULE_LABEL).map(([k, v]) => <span key={k} className="flex items-center gap-1.5"><span className={cn("size-2 rounded-full", SCHEDULE_DOT[k as keyof typeof SCHEDULE_DOT])} />{v}</span>)}
      </div>
      <div className="grid grid-cols-7 border-b bg-muted/40 text-center text-xs font-medium text-muted-foreground">
        {DAYS.map((d) => <div key={d} className="py-2">{d}</div>)}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((d) => {
          const inMonth = Number(d.slice(5, 7)) - 1 === month.m;
          const ev = events.filter((e) => e.date === d);
          return (
            <div key={d} className={cn("min-h-24 border-r border-b p-1.5 sm:min-h-28 [&:nth-child(7n)]:border-r-0", !inMonth && "bg-muted/30")}>
              <p className={cn("mb-1 grid size-6 place-items-center rounded-full text-xs tabular", !inMonth && "text-muted-foreground/50", d === today && "bg-primary font-semibold text-primary-foreground")}>{Number(d.slice(8))}</p>
              <div className="space-y-0.5">
                {ev.slice(0, 3).map((e, i) => (
                  <Link key={i} href={`/admin/pesanan/${e.orderId}`} title={`${SCHEDULE_LABEL[e.type]} · ${e.customer}`} className="flex items-center gap-1 truncate rounded px-1 py-0.5 text-[11px] hover:bg-muted">
                    <span className={cn("size-1.5 shrink-0 rounded-full", SCHEDULE_DOT[e.type])} />
                    <span className="truncate"><span className="hidden font-medium sm:inline">{SCHEDULE_LABEL[e.type]} </span>{e.customer.split(" ")[0]}</span>
                  </Link>
                ))}
                {ev.length > 3 && <p className="px-1 text-[11px] text-muted-foreground">+{ev.length - 3} lagi</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
