# PRD — Meè & U · Perfume & Attar

## Original problem statement
Exact rebuild of the reference site https://attar-shop-premium.emergent.host/ — black/white/gold luxury fragrance store for "Meè & U — Perfume & Attar" (Est. 2025 · Mumbai). Home (hero, trust badges, featured attars/perfumes, special offers, our story, CTA band, footer), Shop with live-count filter tabs, product detail with WhatsApp ordering, contact form (EmailJS + DB), and a fully working password-protected admin (products CRUD, offers/combos, WhatsApp numbers). Awwwards-level motion: kinetic masked hero reveal, lenis smooth scroll, framer-motion reveals, editorial marquee, spotlight product frames.

## Architecture
- Frontend: React 19 + react-router-dom 7 + Tailwind + framer-motion + lenis + @emailjs/browser (CRA/craco, port 3000)
- Backend: FastAPI + Motor (MongoDB), port 8001, all routes under /api
- Storage: MongoDB (built-in) — user chose this over Supabase for reliability
- Auth: single admin password (env ADMIN_PASSWORD, bcrypt) → JWT (24h) → Bearer token in localStorage
- Product images: AI-generated (Gemini Nano Banana) unbranded consistent set in /app/frontend/public/products/
- Logo: /app/frontend/public/logo.svg (gold script + fleur ornament), used as <img>

## User personas
- Visitor/customer: browses collection, orders via WhatsApp deep link, sends general inquiries via contact form
- Founder/admin: manages products, offers/combos, and WhatsApp order numbers from /admin

## Core requirements (static)
- Exact section order/copy per spec; palette black/white/gold; serif+script headings
- Filter tabs with live counts on /shop (both directions)
- Special Offers renders only when active offers exist
- Fragrance notes optional per product; WhatsApp numbers never hardcoded
- Mobile responsive; no console errors

## Implemented (2026-08-25)
- Home: hero (masked line reveal, parallax gold glow, "Est. 2025 · Mumbai"), 3 trust badges, Featured Attars ("Signature Scents"), Featured Perfumes ("Refined EDPs"), View All Products, Special Offers (hidden when empty), Our Story (#story, numbered chapters), editorial marquee, CTA band, Contact (#contact: WhatsApp + Instagram + EmailJS form stored in MongoDB), footer
- /shop: "The Collection" / "Our Fragrances", tabs All(4)/Attars(2)/Perfumes(2) with live counts, verified filtering both ways
- /product/:id: back link, spotlight image, category·stock, notes rows (Top/Heart/Base), size selector, name (optional), address (required, validated), WhatsApp order → wa.me primary number with pre-filled details
- /admin: password login (meeandu2025, wrong-password error verified), Products CRUD with image upload (base64), sizes, stock, featured, optional notes; Offers/Combos CRUD with 2+ product rule and active toggle; WhatsApp numbers add/edit/remove/primary
- Seeded: 4 products (exact spec copy + notes), 2 WhatsApp numbers (Afzal primary)

## Verified
- curl: health, products list, offers create→public→deactivate→hidden→delete, unauthorized write blocked (401), contact stored, login good/bad
- UI screenshots: home sections, shop tabs filtering, PDP order validation, WhatsApp popup URL (917506380114 + pre-filled text), admin login + all 3 tabs, mobile 390px home + cards

## Backlog
- P0: GitHub push — waiting on user's repo URL + Personal Access Token
- P1: Instagram real handle link (currently https://instagram.com placeholder)
- P1: Admin inbox view for contact messages (GET /api/contact already exists)
- P2: OG/social meta image; favicon already logo.svg

## Next tasks
1. Push to GitHub once user provides repo URL + PAT
2. Replace Instagram placeholder with real profile URL
3. Optional: contact-messages tab in admin
