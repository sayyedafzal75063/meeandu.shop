import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { api, fetchPrimaryWhatsApp, waLink, inr } from "../lib/api";
import { SiteNavbar } from "../components/SiteNavbar";
import { SiteFooter } from "../components/SiteFooter";
import { Reveal } from "../components/Reveal";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [sizeIdx, setSizeIdx] = useState(0);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setProduct(null);
    setNotFound(false);
    api
      .get(`/products/${id}`)
      .then((r) => setProduct(r.data))
      .catch(() => setNotFound(true));
  }, [id]);

  const order = async () => {
    if (!address.trim()) {
      setError("Delivery address is required to place your order.");
      return;
    }
    setError("");
    const size = product.sizes[sizeIdx];
    const lines = [
      "Hi Meè & U! I'd like to order:",
      "",
      `Product: ${product.name}`,
      `Size: ${size.label}`,
      `Price: ${inr(size.price)}`,
    ];
    if (name.trim()) lines.push(`Name: ${name.trim()}`);
    lines.push(`Delivery Address: ${address.trim()}`);
    lines.push("", "Please share payment and delivery details.");
    const num = await fetchPrimaryWhatsApp();
    if (num) window.open(waLink(num.number, lines.join("\n")), "_blank");
  };

  const inputCls =
    "w-full bg-[#0E0E0E] text-[#F8F8F6] border border-[#D4AF37]/30 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none px-4 py-3 placeholder-[#6E6E68] text-sm transition-colors";

  return (
    <div data-testid="pdp-page" className="bg-[#070707] min-h-screen">
      <SiteNavbar />
      <div className="pt-32 pb-24 mx-auto max-w-6xl px-5 sm:px-8">
        <Link
          to="/shop"
          data-testid="back-to-shop-link"
          className="inline-flex items-center gap-2 f-mono text-[11px] uppercase tracking-[0.25em] text-[#A1A19A] hover:text-[#D4AF37] transition-colors"
        >
          <ArrowLeft size={14} /> Back to shop
        </Link>

        {notFound && (
          <p data-testid="pdp-not-found" className="mt-20 text-center text-[#A1A19A]">
            This fragrance could not be found.
          </p>
        )}

        {product && (
          <div className="mt-10 grid gap-12 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="spotlight-frame border border-[#D4AF37]/25 aspect-[4/5] bg-[#0E0E0E]">
                <img data-testid="pdp-image" src={product.image} alt={product.name} className="h-full w-full object-cover" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            >
              <p data-testid="pdp-category-stock" className="f-mono text-[11px] uppercase tracking-[0.3em] text-[#C5A059]">
                {product.category} · {product.in_stock ? "In Stock" : "Out of Stock"}
              </p>
              <h1 data-testid="pdp-name" className="mt-3 f-serif text-4xl sm:text-5xl font-light text-[#F8F8F6]">
                {product.name}
              </h1>
              <p data-testid="pdp-description" className="mt-5 text-base text-[#A1A19A] leading-relaxed">
                {product.description}
              </p>

              {product.notes && (product.notes.top || product.notes.heart || product.notes.base) && (
                <div data-testid="fragrance-notes" className="mt-8 border border-[#D4AF37]/20 divide-y divide-[#D4AF37]/10">
                  {[
                    ["Top", product.notes.top],
                    ["Heart", product.notes.heart],
                    ["Base", product.notes.base],
                  ]
                    .filter(([, v]) => v)
                    .map(([label, value]) => (
                      <div key={label} data-testid={`notes-${label.toLowerCase()}`} className="flex gap-5 px-5 py-3.5">
                        <span className="f-mono text-[10px] uppercase tracking-[0.25em] text-[#D4AF37] w-14 pt-0.5 shrink-0">
                          {label}
                        </span>
                        <span className="text-sm text-[#F8F8F6]">{value}</span>
                      </div>
                    ))}
                </div>
              )}

              <div className="mt-8">
                <p className="f-mono text-[10px] uppercase tracking-[0.25em] text-[#C5A059] mb-3">Size</p>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map((s, i) => (
                    <button
                      key={i}
                      data-testid={`size-option-${i}`}
                      onClick={() => setSizeIdx(i)}
                      className={`px-5 py-3 border text-sm transition-all duration-300 ${
                        sizeIdx === i
                          ? "border-[#D4AF37] bg-[#D4AF37]/10 text-[#F3E5AB]"
                          : "border-[#D4AF37]/25 text-[#A1A19A] hover:border-[#D4AF37]/60"
                      }`}
                    >
                      {s.label} · {inr(s.price)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-4">
                <input
                  data-testid="customer-name-input"
                  placeholder="Your Name (optional)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputCls}
                />
                <textarea
                  data-testid="delivery-address-input"
                  placeholder="Delivery Address (required)"
                  rows={3}
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    if (e.target.value.trim()) setError("");
                  }}
                  className={inputCls}
                />
                {error && (
                  <p data-testid="address-error" className="text-sm text-red-400">
                    {error}
                  </p>
                )}
                <button
                  data-testid="whatsapp-order-button"
                  onClick={order}
                  disabled={!product.in_stock}
                  className="inline-flex items-center justify-center gap-2 bg-[#25D366] text-black font-semibold tracking-wide py-4 px-8 hover:bg-[#20ba5a] hover:shadow-[0_0_24px_rgba(37,211,102,0.35)] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <MessageCircle size={18} /> Order on WhatsApp
                </button>
                <p className="text-xs text-[#6E6E68]">
                  You will be redirected to WhatsApp with your order details pre-filled.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </div>
      <Reveal>
        <SiteFooter />
      </Reveal>
    </div>
  );
}
