"use client";

import { useState } from "react";
import { CalendarBlankIcon as CalendarDays } from "@phosphor-icons/react/ssr";
import type { Matcher } from "react-day-picker";
import { id } from "react-day-picker/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { fromLocalDate, toLocalDate } from "@/lib/dates";
import { tanggalPendek } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ISODate } from "@/lib/types";

type Range = { from?: ISODate; to?: ISODate };

const triggerCls =
  "flex h-11 w-full items-center gap-2.5 rounded-[0.875rem] border border-input bg-card px-3.5 text-left text-sm transition-colors duration-300 hover:border-foreground/25 focus-visible:ring-4 focus-visible:ring-primary/10 outline-none";

// Dirender hanya saat popover terbuka, jadi "hari ini" dihitung di browser, bukan saat prerender.
function Cal(props: React.ComponentProps<typeof Calendar> & { extraDisabled?: Matcher[] }) {
  const { extraDisabled = [], ...rest } = props;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return (
    <Calendar
      locale={id}
      disabled={[{ before: today }, ...extraDisabled]}
      className="[--cell-size:--spacing(9)]"
      {...(rest as object)}
    />
  );
}

/** Pilih tanggal mulai–selesai acara. Tanggal lampau tidak bisa dipilih (FR-19). */
export function DateRangeField({ value, onChange, placeholder = "Pilih tanggal acara", className }: { value: Range; onChange: (r: Range) => void; placeholder?: string; className?: string }) {
  const [open, setOpen] = useState(false);
  const label = value.from
    ? value.to && value.to !== value.from
      ? `${tanggalPendek(value.from)} – ${tanggalPendek(value.to)}`
      : tanggalPendek(value.from)
    : placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className={cn(triggerCls, className)}>
        <CalendarDays className="size-4 shrink-0 text-muted-foreground" />
        <span className={cn("truncate", !value.from && "text-muted-foreground")}>{label}</span>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Cal
          mode="range"
          selected={{ from: value.from ? toLocalDate(value.from) : undefined, to: value.to ? toLocalDate(value.to) : undefined }}
          defaultMonth={value.from ? toLocalDate(value.from) : undefined}
          onSelect={(r) => {
            const from = r?.from ? fromLocalDate(r.from) : undefined;
            const to = r?.to ? fromLocalDate(r.to) : from;
            onChange({ from, to });
            if (r?.from && r?.to && r.from.getTime() !== r.to.getTime()) setOpen(false);
          }}
        />
        <p className="border-t px-3 py-2 text-xs text-muted-foreground">Klik sekali untuk acara 1 hari, dua kali untuk rentang.</p>
      </PopoverContent>
    </Popover>
  );
}

/** Pilih satu tanggal, dengan tanggal terkunci/di luar jendela dinonaktifkan. */
export function DateField({ value, onChange, disabled, modifiers, placeholder = "Pilih tanggal", legend, defaultMonth }: { value?: ISODate; onChange: (d?: ISODate) => void; disabled?: Matcher[]; modifiers?: Record<string, Matcher | Matcher[]>; placeholder?: string; legend?: React.ReactNode; defaultMonth?: ISODate }) {
  const [open, setOpen] = useState(false);
  const month = value ?? defaultMonth;
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className={triggerCls}>
        <CalendarDays className="size-4 shrink-0 text-muted-foreground" />
        <span className={cn(!value && "text-muted-foreground")}>{value ? tanggalPendek(value) : placeholder}</span>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Cal
          mode="single"
          selected={value ? toLocalDate(value) : undefined}
          defaultMonth={month ? toLocalDate(month) : undefined}
          extraDisabled={disabled}
          modifiers={modifiers}
          modifiersClassNames={{ locked: "line-through opacity-50", window: "bg-accent rounded-(--cell-radius)" }}
          onSelect={(d: Date | undefined) => {
            onChange(d ? fromLocalDate(d) : undefined);
            setOpen(false);
          }}
        />
        {legend && <div className="border-t px-3 py-2 text-xs text-muted-foreground">{legend}</div>}
      </PopoverContent>
    </Popover>
  );
}
