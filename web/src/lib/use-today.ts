"use client";

import { useSyncExternalStore } from "react";
import { fromLocalDate } from "./dates";

const noop = () => () => {};

/** Tanggal hari ini di browser; undefined saat prerender (Cache Components melarang new Date() di sana). */
export const useToday = () => useSyncExternalStore(noop, () => fromLocalDate(new Date()), () => undefined);
