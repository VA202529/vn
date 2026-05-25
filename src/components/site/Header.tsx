import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useSiteData } from "@/hooks/use-site-data";

const nav = [
  { to: "/", label: "Home" },
  { to: "/diensten", label: "Diensten" },
  { to: "/websites-laten-maken-amsterdam-noord", label: "Websites" },
  { to: "/marketing-amsterdam-noord", label: "Marketing" },
  { to: "/portfolio", label: "Portfolio" },
  { to: "/producten", label: "Producten" },
  { to: "/offerte", label: "Offerte" },
  { to: "/over", label: "Over" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const { data } = useSiteData();
  const bedrijfsnaam = data?.bedrijfsgegevens?.bedrijfsnaam || "Van Appiah";

  return (
    <header className="sticky top-4 z-50 px-4">
      <div className="mx-auto max-w-6xl glass-strong rounded-full px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="size-7 rounded-full bg-foreground text-background grid place-items-center text-[11px] font-semibold tracking-tight">VA</span>
          <span className="font-semibold tracking-tight">{bedrijfsnaam}</span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="px-3 py-1.5 text-sm rounded-full text-muted-foreground hover:text-foreground hover:bg-surface transition-colors"
              activeProps={{ className: "px-3 py-1.5 text-sm rounded-full text-foreground bg-surface-muted" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <Link
          to="/contact"
          className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-foreground text-background text-sm font-medium px-4 py-2 hover:opacity-90 transition-opacity"
        >
          Start project
          <span aria-hidden>→</span>
        </Link>
        <button
          aria-label="Menu"
          onClick={() => setOpen((v) => !v)}
          className="md:hidden size-9 rounded-full grid place-items-center hover:bg-surface"
        >
          <span className="i-block">{open ? "✕" : "☰"}</span>
        </button>
      </div>
      {open && (
        <div className="md:hidden mx-auto max-w-6xl mt-2 glass-strong rounded-3xl p-3 flex flex-col">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              onClick={() => setOpen(false)}
              className="px-4 py-3 rounded-2xl text-sm hover:bg-surface"
            >
              {n.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
