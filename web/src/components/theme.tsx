"use client";

import { useSyncExternalStore } from "react";
import { DesktopIcon, MoonIcon, SunIcon } from "@phosphor-icons/react/ssr";
import { cn } from "@/lib/utils";

type Theme = "system" | "light" | "dark";
const KEY = "theme";


const read = (): Theme => (localStorage.getItem(KEY) as Theme) || "system";
const apply = (t: Theme) => {
  const dark = t === "dark" || (t === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
};

function subscribe(cb: () => void) {
  const mq = matchMedia("(prefers-color-scheme: dark)");
  const onSystem = () => read() === "system" && apply("system");
  mq.addEventListener("change", onSystem);
  window.addEventListener("theme-change", cb);
  window.addEventListener("storage", cb);
  return () => {
    mq.removeEventListener("change", onSystem);
    window.removeEventListener("theme-change", cb);
    window.removeEventListener("storage", cb);
  };
}

function setTheme(t: Theme) {
  localStorage.setItem(KEY, t);
  apply(t);
  window.dispatchEvent(new Event("theme-change"));
}

const OPTIONS = [
  { value: "system", label: "Ikuti perangkat", icon: DesktopIcon },
  { value: "light", label: "Terang", icon: SunIcon },
  { value: "dark", label: "Gelap", icon: MoonIcon },
] as const;

/** Pilihan tema tiga posisi; default mengikuti perangkat. */
export function ThemeSwitch({ className }: { className?: string }) {
  const theme = useSyncExternalStore(subscribe, read, () => undefined);
  return (
    <div role="radiogroup" aria-label="Tema tampilan" className={cn("inline-flex rounded-full bg-foreground/[0.05] p-1 ring-1 ring-foreground/[0.06]", className)}>
      {OPTIONS.map(({ value, label, icon: Icon }) => {
        const active = theme === value;
        return (
          <button
            key={value}
            role="radio"
            aria-checked={active}
            aria-label={label}
            title={label}
            onClick={() => setTheme(value)}
            className={cn("grid size-8 place-items-center rounded-full transition-colors duration-300", active ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
          >
            <Icon size={15} />
          </button>
        );
      })}
    </div>
  );
}
