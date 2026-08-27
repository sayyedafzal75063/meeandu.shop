import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { SiteNavbar } from "../components/SiteNavbar";
import { SiteFooter } from "../components/SiteFooter";
import { ProductCard } from "../components/ProductCard";
import { Reveal, SectionLabel } from "../components/Reveal";

const TABS = [
  { key: "All", label: "All", testId: "shop-tab-all" },
  { key: "Attar", label: "Attars", testId: "shop-tab-attars" },
  { key: "Perfume", label: "Perfumes", testId: "shop-tab-perfumes" },
];

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [tab, setTab] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/products")
      .then((r) => setProducts(Array.isArray(r.data) ? r.data : []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const list = Array.isArray(products) ? products : [];
  const count = (key) => (key === "All" ? list.length : list.filter((p) => p.category === key).length);
  const visible = tab === "All" ? list : list.filter((p) => p.category === tab);

  return (
    <div data-testid="shop-page" className="bg-[#070707] min-h-screen">
      <SiteNavbar />
      <div className="pt-36 pb-24 mx-auto max-w-7xl px-5 sm:px-8">
        <div className="text-center">
          <SectionLabel testId="shop-label">The Collection</SectionLabel>
          <Reveal delay={0.1}>
            <h1 className="mt-4 f-serif text-4xl sm:text-5xl lg:text-6xl font-light text-[#F8F8F6]">Our Fragrances</h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-5 text-sm sm:text-base text-[#A1A19A] max-w-2xl mx-auto leading-relaxed">
              Pure oil-based attars and refined EDP perfumes, blended in small batches. Tap any bottle to order via WhatsApp.
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.25} className="mt-12 flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
          {TABS.map((t) => (
            <button
              key={t.key}
              data-testid={t.testId}
              onClick={() => setTab(t.key)}
              className={`f-mono text-[11px] sm:text-xs uppercase tracking-[0.2em] px-5 py-2.5 border transition-all duration-300 ${
                tab === t.key
                  ? "bg-[#D4AF37] text-black border-[#D4AF37]"
                  : "bg-transparent text-[#A1A19A] border-[#D4AF37]/30 hover:border-[#D4AF37]/70 hover:text-[#F8F8F6]"
              }`}
            >
              {t.label} ({count(t.key)})
            </button>
          ))}
        </Reveal>

        <div data-testid="shop-grid" className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>

        {!loading && visible.length === 0 && (
          <p data-testid="shop-empty" className="mt-16 text-center text-sm text-[#6E6E68]">
            No products in this category yet.
          </p>
        )}
      </div>
      <SiteFooter />
    </div>
  );
}
