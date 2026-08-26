import { useState } from "react";
import { MessageCircle, Instagram, Send } from "lucide-react";
import emailjs from "@emailjs/browser";
import { toast } from "sonner";
import { api, fetchPrimaryWhatsApp, waLink, formatApiError } from "../lib/api";
import { Reveal, SectionLabel } from "../components/Reveal";

emailjs.init({ publicKey: process.env.REACT_APP_EMAILJS_PUBLIC_KEY });

const EMPTY = { name: "", email: "", phone: "", address: "", message: "" };

export function ContactSection() {
  const [form, setForm] = useState(EMPTY);
  const [sending, setSending] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const openWhatsApp = async () => {
    const num = await fetchPrimaryWhatsApp();
    if (num) window.open(waLink(num.number, "Hi Meè & U! I have a question about your fragrances."), "_blank");
  };

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.post("/contact", form);
      await emailjs.send(
        process.env.REACT_APP_EMAILJS_SERVICE_ID,
        process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
        {
          from_name: form.name,
          from_email: form.email,
          phone: form.phone,
          address: form.address,
          message: form.message,
        }
      );
      toast.success("Message sent — we'll get back to you soon.");
      setForm(EMPTY);
    } catch (err) {
      toast.error(formatApiError(err, "Could not send your message. Please try WhatsApp instead."));
    } finally {
      setSending(false);
    }
  };

  const inputCls =
    "w-full bg-[#0E0E0E] text-[#F8F8F6] border border-[#D4AF37]/30 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none px-4 py-3 placeholder-[#6E6E68] text-sm transition-colors";

  return (
    <section id="contact" data-testid="contact-section" className="relative py-24 sm:py-32 bg-[#F5EFE6]">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-14 lg:grid-cols-2">
          <div>
            <SectionLabel testId="contact-label">Contact</SectionLabel>
            <Reveal delay={0.1}>
              <h2 className="mt-4 f-serif text-3xl sm:text-4xl lg:text-5xl font-light text-[#241E17] leading-tight">
                Talk to us.
              </h2>
              <p className="mt-5 text-base text-[#6B5E4E] leading-relaxed max-w-md">
                Questions about a fragrance, your order, or a gift? Reach us directly — this form is
                for general inquiries, not orders. To order, use the WhatsApp button on any product page.
              </p>
            </Reveal>
            <Reveal delay={0.2} className="mt-8 flex flex-col gap-3">
              <button
                data-testid="contact-whatsapp-button"
                onClick={openWhatsApp}
                className="inline-flex w-fit items-center gap-2 bg-[#25D366] text-black font-semibold tracking-wide py-3 px-6 hover:bg-[#20ba5a] hover:shadow-[0_0_20px_rgba(37,211,102,0.3)] transition-all duration-300"
              >
                <MessageCircle size={18} /> Chat on WhatsApp
              </button>
              <a
                data-testid="contact-instagram-link"
                href="https://www.instagram.com/meeandu.fragrance"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-fit items-center gap-2 border border-[#D4AF37]/50 text-[#241E17] py-3 px-6 hover:border-[#D4AF37] hover:bg-[#D4AF37]/15 transition-all duration-300 text-sm"
              >
                <Instagram size={18} className="text-[#D4AF37]" /> Follow on Instagram
              </a>
            </Reveal>
          </div>

          <Reveal delay={0.15}>
            <form
              data-testid="contact-form"
              onSubmit={submit}
              className="bg-[#0A0A0A] border border-[#D4AF37]/20 p-6 sm:p-8 flex flex-col gap-4"
            >
              <input data-testid="contact-name-input" required placeholder="Name" value={form.name} onChange={set("name")} className={inputCls} />
              <input data-testid="contact-email-input" required type="email" placeholder="Email" value={form.email} onChange={set("email")} className={inputCls} />
              <input data-testid="contact-phone-input" placeholder="Phone" value={form.phone} onChange={set("phone")} className={inputCls} />
              <input data-testid="contact-address-input" placeholder="Address" value={form.address} onChange={set("address")} className={inputCls} />
              <textarea data-testid="contact-message-input" required placeholder="Message" rows={4} value={form.message} onChange={set("message")} className={inputCls} />
              <button
                data-testid="contact-submit-button"
                type="submit"
                disabled={sending}
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#C5A059] text-black f-mono uppercase tracking-[0.2em] text-xs py-3.5 px-8 border border-[#D4AF37] hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
              >
                <Send size={15} /> {sending ? "Sending…" : "Send Message"}
              </button>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
