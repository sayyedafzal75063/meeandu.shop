import { Link } from "react-router-dom";
import { scrollToId } from "../lib/lenis";

export function SiteFooter() {
  return (
    <footer data-testid="site-footer" className="border-t border-[#D4AF37]/20 bg-[#070707]">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-14 grid gap-10 sm:grid-cols-3">
        <div>
          <img src="/logo.svg" alt="Meè & U" className="h-12 w-auto mb-4" />
          <p className="text-sm text-[#A1A19A] leading-relaxed max-w-xs">
            Hand-crafted oil-based attars and refined EDP perfumes, blended in small batches in Mumbai.
          </p>
        </div>
        <div>
          <p className="f-mono text-[11px] uppercase tracking-[0.3em] text-[#C5A059] mb-4">Explore</p>
          <div className="flex flex-col gap-2.5">
            <Link to="/" data-testid="footer-link-home" className="text-sm text-[#A1A19A] hover:text-[#D4AF37] transition-colors">Home</Link>
            <Link to="/shop" data-testid="footer-link-shop" className="text-sm text-[#A1A19A] hover:text-[#D4AF37] transition-colors">Shop</Link>
            <button
              data-testid="footer-link-story"
              onClick={() => scrollToId("story")}
              className="text-left text-sm text-[#A1A19A] hover:text-[#D4AF37] transition-colors"
            >
              Our Story
            </button>
          </div>
        </div>
        <div>
          <p className="f-mono text-[11px] uppercase tracking-[0.3em] text-[#C5A059] mb-4">Contact</p>
          <a
            href="mailto:meeandusupport@gmail.com"
            data-testid="footer-email"
            className="block text-sm text-[#A1A19A] hover:text-[#D4AF37] transition-colors"
          >
            meeandusupport@gmail.com
          </a>
          <p className="mt-2 text-sm text-[#6E6E68]">WhatsApp orders via product page</p>
        </div>
      </div>
      <div className="border-t border-[#D4AF37]/10 py-5 text-center">
        <p className="f-mono text-[10px] uppercase tracking-[0.3em] text-[#6E6E68]">
          © 2025 Meè & U — Perfume & Attar
        </p>
      </div>
    </footer>
  );
}
