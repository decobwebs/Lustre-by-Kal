"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Lockup } from "@/components/Logo";
import { useOrder } from "@/components/OrderProvider";
import { BagIcon, MenuIcon } from "@/components/icons";

const NAV = [
  { href: "/hampers", label: "Hampers" },
  { href: "/hampers#add-ons", label: "Add-ons" },
  { href: "/#how-to-order", label: "How to order" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const { count, ready } = useOrder();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    // Close the mobile menu after navigating.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const orderLabel = ready && count > 0 ? `Order list, ${count} ${count === 1 ? "item" : "items"}` : "Order list";

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors duration-200 ${
        scrolled || open ? "border-line bg-paper/95 backdrop-blur-md" : "border-transparent bg-paper"
      }`}
    >
      <div className="container-x flex h-[72px] items-center justify-between gap-6">
        <Link href="/" className="shrink-0 text-bronze" aria-label="Lustre by Kal, home">
          <Lockup className="h-9 w-auto md:h-10" title="Lustre by Kal" />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-8 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[0.98rem] font-semibold text-ink/85 transition-colors hover:text-bronze-text"
              aria-current={pathname === item.href ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/order" className="btn btn-outline btn-sm gap-2" aria-label={orderLabel}>
            <BagIcon className="size-5" />
            <span className="hidden sm:inline">Order list</span>
            {ready && count > 0 && (
              <span className="grid min-w-6 place-items-center rounded-full bg-bronze px-1.5 text-xs font-bold leading-6 text-white tabular-nums">
                {count > 999 ? "999+" : count}
              </span>
            )}
          </Link>
          <button
            type="button"
            className="grid size-11 place-items-center rounded-full text-ink hover:bg-tint lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <MenuIcon open={open} className="size-6" />
          </button>
        </div>
      </div>

      <nav
        id="mobile-nav"
        aria-label="Main"
        hidden={!open}
        className="border-t border-line bg-paper lg:hidden"
      >
        <ul className="container-x flex flex-col py-3">
          {NAV.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="block border-b border-line py-4 font-display text-2xl" onClick={() => setOpen(false)}>
                {item.label}
              </Link>
            </li>
          ))}
          <li className="pt-5 pb-3">
            <Link href="/order" className="btn btn-primary btn-block" onClick={() => setOpen(false)}>
              View order list{ready && count > 0 ? ` (${count})` : ""}
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
