import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { inr } from "../lib/api";

export function ProductCard({ product, index = 0 }) {
  const fromPrice = product.sizes?.length ? Math.min(...product.sizes.map((s) => s.price)) : 0;
  const slug = product.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.8, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        to={`/product/${product.id}`}
        data-testid={`product-card-${slug}`}
        className="group block bg-[#0A0A0A] border border-[#D4AF37]/20 hover:border-[#D4AF37]/60 hover:shadow-[0_0_30px_rgba(212,175,55,0.12)] transition-[border-color,box-shadow] duration-500"
      >
        <div className="spotlight-frame aspect-[4/5] bg-[#0E0E0E]">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="p-6 sm:p-7">
          <div className="flex items-center gap-2 mb-3">
            <span className="f-mono text-[10px] uppercase tracking-[0.2em] text-[#D4AF37] border border-[#D4AF37]/30 bg-[#141414] px-2.5 py-1">
              {product.category}
            </span>
            {product.featured && (
              <span className="f-mono text-[10px] uppercase tracking-[0.2em] text-[#070707] bg-[#D4AF37] px-2.5 py-1">
                Featured
              </span>
            )}
            {!product.in_stock && (
              <span className="f-mono text-[10px] uppercase tracking-[0.2em] text-red-400 border border-red-400/40 px-2.5 py-1">
                Sold Out
              </span>
            )}
          </div>
          <h3 className="f-serif text-2xl sm:text-[1.7rem] font-medium text-[#F8F8F6] group-hover:text-[#F3E5AB] transition-colors duration-300">
            {product.name}
          </h3>
          <p className="mt-2 text-sm text-[#A1A19A] leading-relaxed line-clamp-2">
            {product.description}
          </p>
          <p className="mt-4 f-mono text-sm text-[#D4AF37]">From {inr(fromPrice)}</p>
        </div>
      </Link>
    </motion.div>
  );
}
