"use client";

import Link from "next/link";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { findItem } from "@/content/catalogue";
import { MAX_LINES, MAX_QTY, type OrderLine } from "@/lib/order";

const STORAGE_KEY = "lbk-order-v1";

type Toast = { id: number; message: string; action?: { href: string; label: string } };

type OrderContextValue = {
  lines: OrderLine[];
  /** False until the saved list has been read, so counts don't flash 0. */
  ready: boolean;
  count: number;
  add: (ref: string, qty?: number) => void;
  setQty: (ref: string, qty: number) => void;
  remove: (ref: string) => void;
  clear: () => void;
  notify: (message: string, action?: Toast["action"]) => void;
};

const OrderContext = createContext<OrderContextValue | null>(null);

function readSaved(): OrderLine[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((l): l is OrderLine => typeof l?.ref === "string" && Number.isFinite(l?.qty) && !!findItem(l.ref))
      .map((l) => ({ ref: l.ref, qty: clamp(l.qty) }))
      .slice(0, MAX_LINES);
  } catch {
    return [];
  }
}

const clamp = (qty: number) => Math.max(1, Math.min(MAX_QTY, Math.floor(qty)));

export function OrderProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<OrderLine[]>([]);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    // Reading localStorage has to wait for the browser; this syncs React with it once.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLines(readSaved());
    setReady(true);
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setLines(readSaved());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* Private mode or storage full: the list still works for this visit. */
    }
  }, [lines, ready]);

  const notify = useCallback((message: string, action?: Toast["action"]) => {
    window.clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), message, action });
    toastTimer.current = window.setTimeout(() => setToast(null), 5000);
  }, []);

  const add = useCallback((ref: string, qty = 1) => {
    if (!findItem(ref)) return;
    setLines((current) => {
      const existing = current.find((l) => l.ref === ref);
      if (existing) return current.map((l) => (l.ref === ref ? { ...l, qty: clamp(l.qty + qty) } : l));
      if (current.length >= MAX_LINES) return current;
      return [...current, { ref, qty: clamp(qty) }];
    });
  }, []);

  const setQty = useCallback((ref: string, qty: number) => {
    setLines((current) => current.map((l) => (l.ref === ref ? { ...l, qty: clamp(qty) } : l)));
  }, []);

  const remove = useCallback((ref: string) => setLines((current) => current.filter((l) => l.ref !== ref)), []);
  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<OrderContextValue>(
    () => ({ lines, ready, count: lines.reduce((n, l) => n + l.qty, 0), add, setQty, remove, clear, notify }),
    [lines, ready, add, setQty, remove, clear, notify],
  );

  return (
    <OrderContext.Provider value={value}>
      {children}
      <div aria-live="polite" role="status">
        {toast && (
          <div className="toast" key={toast.id}>
            <span>{toast.message}</span>
            {toast.action && (
              <Link href={toast.action.href} onClick={() => setToast(null)}>
                {toast.action.label}
              </Link>
            )}
          </div>
        )}
      </div>
    </OrderContext.Provider>
  );
}

export function useOrder() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrder must be used inside <OrderProvider>");
  return ctx;
}
