import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Droplets, Clock, FlaskConical, MessageCircle } from "lucide-react";
import { api, fetchPrimaryWhatsApp, waLink, inr } from "../lib/api";
import { SiteNavbar } from "../components/SiteNavbar";
import { SiteFooter } from "../components/SiteFooter";
import { Marquee } from "../components/Marquee";
import { ProductCard } from "../components/ProductCard";
import { ContactSection } from "../components/ContactSection";
import { Reveal, MaskedLine, SectionLabel } from "../components/Reveal";
import { scrollToId } from "../lib/lenis";

const BADGES = [
  { icon: Droplets, title: "Pure Oil-Based", text: "No alcohol. Skin-friendly." },
  { icon: Clock, title: "Long-Lasting", text: "12+ hours on skin." },
  { icon: FlaskConical, title: "Small-Batch", text: "Hand-blended, never mass-produced." },
];

const STORY_IMAGE =
  "https://images.pexels.com/photos/37127787/pexels-photo-37127787.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [offers, setOffers] = useState([]);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const glowY = useTransform(scrollYProgress, [0, 1], [0, 220]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  useEffect(() => {
    api.get("/products").then((r) => setProducts(Array.isArray(r.data) ? r.data : [])).catch(() => setProducts([]));
    api.get("/offers").then((r) => setOffers(Array.isArray(r.data) ? r.data : [])).catch(() => setOffers([]));
  }, []);

  const attars = (Array.isArray(products) ? products : []).filter((p) => p.category === "Attar" && p.featured).slice(0, 2);
  const perfumes = (Array.isArray(products) ? products : []).filter((p) => p.category === "Perfume" && p.featured).slice(0, 2);

  const orderCombo = async (offer) => {
    const num = await fetchPrimaryWhatsApp();
    if (num)
      window.open(
        waLink(num.number, `Hi Meè & U! I'm interested in the Special Offer: ${offer.name} — Price: ${inr(offer.price)}.`),
        "_blank"
      );
  };

  return (
    <div data-testid="home-page" className="bg-[#F5EFE6] min-h-screen">
      <SiteNavbar />

      {/* ---------- HERO ---------- */}
      <section ref={heroRef} data-testid="hero-section" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#070707]">
        <motion.div style={{ y: glowY }} className="absolute inset-0 pointer-events-none">
          <div className="animate-glow absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 h-[60vmin] w-[80vmin] rounded-full bg-[#D4AF37]/10 blur-[120px]" />
          <div className="absolute right-[8%] top-[18%] h-[30vmin] w-[30vmin] rounded-full bg-[#D4AF37]/5 blur-[90px]" />
        </motion.div>

        <motion.div style={{ opacity: fade }} className="relative z-10 text-center px-5 pt-24 pb-16">
          <MaskedLine delay={0.15}>
            <span className="f-script text-gold-gradient text-6xl sm:text-8xl lg:text-9xl leading-[1.1]">
              Meè &amp; U
            </span>
          </MaskedLine>
          <MaskedLine delay={0.4}>
            <span className="mt-3 f-serif text-xl sm:text-2xl lg:text-3xl font-light tracking-[0.45em] uppercase text-[#F8F8F6]">
              Perfume &amp; Attar
            </span>
          </MaskedLine>
          <MaskedLine delay={0.65}>
            <span className="mt-7 mx-auto max-w-xl text-sm sm:text-base text-[#A1A19A] leading-relaxed">
              Hand-crafted oil-based fragrances. Long-lasting. Unforgettable. Rooted in tradition, made for you.
            </span>
          </MaskedLine>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/shop"
              data-testid="hero-shop-button"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#C5A059] text-black f-mono uppercase tracking-[0.2em] text-xs sm:text-sm py-3.5 px-8 border border-[#D4AF37] hover:shadow-[0_0_24px_rgba(212,175,55,0.4)] transition-all duration-300 hover:-translate-y-0.5"
            >
              Shop the Collection <ArrowRight size={15} />
            </Link>
            <button
              data-testid="hero-story-button"
              onClick={() => scrollToId("story")}
              className="inline-flex items-center gap-2 bg-transparent text-[#F8F8F6] f-mono uppercase tracking-[0.2em] text-xs sm:text-sm py-3.5 px-8 border border-[#D4AF37]/40 hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all duration-300"
            >
              Our Story
            </button>
          </motion.div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3, duration: 1 }}
          data-testid="hero-est-line"
          className="absolute bottom-8 inset-x-0 text-center f-mono text-[10px] sm:text-xs uppercase tracking-[0.4em] text-[#C5A059]/80"
        >
          Est. 2025 · Mumbai
        </motion.p>
      </section>

      {/* ---------- TRUST BADGES ---------- */}
      <section data-testid="trust-badges" className="border-y border-[#D4AF37]/25 bg-[#F5EFE6]">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-14 grid gap-8 sm:grid-cols-3">
          {BADGES.map((b, i) => (
            <Reveal key={b.title} delay={i * 0.12}>
              <div data-testid={`trust-badge-${i + 1}`} className="flex items-start gap-4 p-6 border border-[#D4AF37]/20 hover:border-[#D4AF37]/50 transition-colors duration-500">
                <b.icon size={26} strokeWidth={1.4} className="text-[#D4AF37] shrink-0 mt-0.5" />
                <div>
                  <h3 className="f-serif text-xl text-[#241E17]">{b.title}</h3>
                  <p className="mt-1 text-sm text-[#6B5E4E]">{b.text}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- FEATURED ATTARS ---------- */}
      <section data-testid="featured-attars-section" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <SectionLabel testId="featured-attars-label">Signature Scents</SectionLabel>
          <Reveal delay={0.1}>
            <h2 className="mt-4 f-serif text-3xl sm:text-4xl lg:text-5xl font-light text-[#241E17]">Featured Attars</h2>
          </Reveal>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 max-w-4xl">
            {attars.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ---------- FEATURED PERFUMES ---------- */}
      <section data-testid="featured-perfumes-section" className="pb-24 sm:pb-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <SectionLabel testId="featured-perfumes-label">Refined EDPs</SectionLabel>
          <Reveal delay={0.1}>
            <h2 className="mt-4 f-serif text-3xl sm:text-4xl lg:text-5xl font-light text-[#241E17]">Featured Perfumes</h2>
          </Reveal>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 max-w-4xl">
            {perfumes.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
          <Reveal className="mt-14 text-center">
            <Link
              to="/shop"
              data-testid="view-all-products-button"
              className="inline-flex items-center gap-2 bg-transparent text-[#241E17] f-mono uppercase tracking-[0.25em] text-xs sm:text-sm py-4 px-10 border border-[#D4AF37]/60 hover:border-[#D4AF37] hover:bg-[#D4AF37]/15 hover:shadow-[0_0_24px_rgba(212,175,55,0.2)] transition-all duration-300"
            >
              View All Products <ArrowRight size={15} />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ---------- SPECIAL OFFERS (hidden when none active) ---------- */}
      {offers.length > 0 && (
        <section data-testid="offers-section" className="py-24 sm:py-28 bg-[#F5EFE6] border-y border-[#D4AF37]/25">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <SectionLabel testId="offers-label">Limited Combos</SectionLabel>
            <Reveal delay={0.1}>
              <h2 className="mt-4 f-serif text-3xl sm:text-4xl lg:text-5xl font-light text-[#241E17]">Special Offers</h2>
            </Reveal>
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {offers.map((o, i) => (
                <Reveal key={o.id} delay={i * 0.12}>
                  <div
                    data-testid={`offer-card-${o.id}`}
                    className="bg-[#070707] border border-[#D4AF37]/25 hover:border-[#D4AF37]/60 hover:shadow-[0_0_30px_rgba(212,175,55,0.12)] transition-[border-color,box-shadow] duration-500"
                  >
                    {o.image && (
                      <div className="spotlight-frame aspect-[16/10] bg-[#0E0E0E]">
                        <img src={o.image} alt={o.name} loading="lazy" className="h-full w-full object-cover" />
                      </div>
                    )}
                    <div className="p-6 sm:p-7">
                      <h3 className="f-serif text-2xl text-[#F8F8F6]">{o.name}</h3>
                      <p className="mt-2 f-mono text-xs text-[#A1A19A]">
                        {(Array.isArray(o.product_ids) ? o.product_ids : [])
                          .map((pid) => products.find((p) => p.id === pid)?.name)
                          .filter(Boolean)
                          .join(" + ")}
                      </p>
                      <div className="mt-5 flex items-center justify-between">
                        <span className="f-mono text-lg text-[#D4AF37]">{inr(o.price)}</span>
                        <button
                          data-testid={`offer-order-button-${o.id}`}
                          onClick={() => orderCombo(o)}
                          className="inline-flex items-center gap-2 bg-[#25D366] text-black text-xs font-semibold tracking-wide py-2.5 px-5 hover:bg-[#20ba5a] transition-colors duration-300"
                        >
                          <MessageCircle size={15} /> Order
                        </button>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------- OUR STORY ---------- */}
      <section id="story" data-testid="story-section" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 grid gap-14 lg:grid-cols-2 items-center">
          <Reveal>
            <div className="spotlight-frame border border-[#D4AF37]/25 aspect-[4/5] max-w-md">
              <img src={STORY_IMAGE} alt="Fragrance craftsmanship" loading="lazy" className="h-full w-full object-cover animate-float-slow" />
            </div>
          </Reveal>
          <div>
            <SectionLabel testId="story-label">Our Story</SectionLabel>
            <Reveal delay={0.1}>
              <h2 className="mt-4 f-serif text-3xl sm:text-4xl lg:text-5xl font-light text-[#241E17] leading-tight">
                A tribute to timeless fragrance.
              </h2>
            </Reveal>
            <Reveal delay={0.2}>
              <div className="mt-8 space-y-7">
                <div className="flex gap-5">
                  <span className="f-mono text-xs text-[#C5A059] pt-1.5 shrink-0">01</span>
                  <p className="text-base text-[#6B5E4E] leading-relaxed">
                    Attar-making is an art passed down through generations — pure oils, patiently
                    blended, never rushed. Meè &amp; U was born in Mumbai to honour that tradition:
                    every bottle is hand-blended in small batches, the way it has always been done.
                  </p>
                </div>
                <div className="hairline" />
                <div className="flex gap-5">
                  <span className="f-mono text-xs text-[#C5A059] pt-1.5 shrink-0">02</span>
                  <p className="text-base text-[#6B5E4E] leading-relaxed">
                    We use only pure oil-based formulations — no alcohol, no shortcuts. The result is
                    a fragrance that sits close to the skin, deepens through the day, and stays with
                    you long after the moment has passed. Rooted in tradition, made for you.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <Marquee />

      {/* ---------- CTA BAND ---------- */}
      <section data-testid="cta-band" className="relative py-24 sm:py-32 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[40vmin] w-[70vmin] rounded-full bg-[#D4AF37]/10 blur-[110px] pointer-events-none" />
        <div className="relative mx-auto max-w-4xl px-5 sm:px-8 text-center">
          <SectionLabel testId="cta-label">Ready to find your scent?</SectionLabel>
          <Reveal delay={0.1}>
            <h2 className="mt-5 f-serif text-3xl sm:text-4xl lg:text-6xl font-light text-[#241E17] leading-tight">
              Order on WhatsApp.
              <br />
              <span className="text-gold-gradient">Delivered to your door.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-6 text-base text-[#6B5E4E] max-w-xl mx-auto leading-relaxed">
              Every order is hand-packed with care and shipped straight from our Mumbai atelier to you.
            </p>
          </Reveal>
          <Reveal delay={0.3} className="mt-10">
            <Link
              to="/shop"
              data-testid="cta-shop-button"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#C5A059] text-black f-mono uppercase tracking-[0.2em] text-xs sm:text-sm py-4 px-10 border border-[#D4AF37] hover:shadow-[0_0_28px_rgba(212,175,55,0.45)] transition-all duration-300 hover:-translate-y-0.5"
            >
              Shop Now <ArrowRight size={15} />
            </Link>
          </Reveal>
        </div>
      </section>

      <ContactSection />
      <SiteFooter />
    </div>
  );
}
