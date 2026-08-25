import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { scrollToId } from "../lib/lenis";

const LINKS = [
  { label: "Home", to: "/" },
  { label: "Shop", to: "/shop" },
  { label: "About", to: "/#story", anchor: "story" },
  { label: "Contact", to: "/#contact", anchor: "contact" },
  { label: "Admin", to: "/admin" },
];

export function SiteNavbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const go = (link) => (e) => {
    setOpen(false);
    if (link.anchor) {
      e.preventDefault();
      if (location.pathname !== "/") {
        navigate("/");
        setTimeout(() => scrollToId(link.anchor), 250);
      } else {
        scrollToId(link.anchor);
      }
    }
  };

  return (
    <header
      data-testid="site-navbar"
      className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-[#070707]/80 border-b border-[#D4AF37]/20"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 h-[72px] flex items-center justify-between">
        <Link to="/" data-testid="nav-logo" className="flex items-center" onClick={() => setOpen(false)}>
          <img src="/logo.svg" alt="Meè & U" className="h-11 w-auto" />
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {LINKS.map((l) => (
            <Link
              key={l.label}
              to={l.to}
              onClick={go(l)}
              data-testid={`nav-link-${l.label.toLowerCase()}`}
              className="f-mono text-[11px] uppercase tracking-[0.25em] text-[#A1A19A] hover:text-[#D4AF37] transition-colors duration-300"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <button
          data-testid="nav-mobile-toggle"
          className="md:hidden text-[#D4AF37]"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <nav className="md:hidden border-t border-[#D4AF37]/15 bg-[#070707]/95 backdrop-blur-xl px-6 py-5 flex flex-col gap-4">
          {LINKS.map((l) => (
            <Link
              key={l.label}
              to={l.to}
              onClick={go(l)}
              data-testid={`nav-mobile-link-${l.label.toLowerCase()}`}
              className="f-mono text-xs uppercase tracking-[0.25em] text-[#A1A19A] hover:text-[#D4AF37] transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
