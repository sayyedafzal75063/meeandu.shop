import { motion } from "framer-motion";

export function Reveal({ children, delay = 0, y = 36, className = "", once = true }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-60px" }}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function MaskedLine({ children, delay = 0, className = "" }) {
  return (
    <span className={`block overflow-hidden ${className}`}>
      <motion.span
        className="block"
        initial={{ y: "110%" }}
        animate={{ y: 0 }}
        transition={{ duration: 1.1, delay, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.span>
    </span>
  );
}

export function SectionLabel({ children, testId }) {
  return (
    <Reveal>
      <p
        data-testid={testId}
        className="f-mono text-[11px] sm:text-xs uppercase tracking-[0.3em] text-[#C5A059]"
      >
        {children}
      </p>
    </Reveal>
  );
}
