import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, LogOut, Lock, X } from "lucide-react";
import { api, setToken, clearToken, getToken, formatApiError, inr } from "../lib/api";

const inputCls =
  "w-full bg-[#0E0E0E] text-[#F8F8F6] border border-[#D4AF37]/30 focus:border-[#D4AF37] outline-none px-3.5 py-2.5 placeholder-[#6E6E68] text-sm transition-colors";
const labelCls = "block f-mono text-[10px] uppercase tracking-[0.2em] text-[#C5A059] mb-1.5";

const EMPTY_PRODUCT = {
  name: "",
  description: "",
  category: "Attar",
  sizes: [{ label: "", price: "" }],
  image: "",
  in_stock: true,
  featured: false,
  notes: { top: "", heart: "", base: "" },
};

const EMPTY_OFFER = { name: "", price: "", product_ids: [], image: "", active: true };

function readFileAsDataUrl(file, cb) {
  if (file.size > 2 * 1024 * 1024) {
    toast.error("Image too large — keep it under 2MB.");
    return;
  }
  const reader = new FileReader();
  reader.onload = () => cb(reader.result);
  reader.readAsDataURL(file);
}

function LoginScreen({ onLogin }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { data } = await api.post("/admin/login", { password });
      setToken(data.token);
      onLogin();
    } catch (err) {
      setError(formatApiError(err, "Login failed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div data-testid="admin-login-screen" className="min-h-screen bg-[#070707] flex items-center justify-center px-5">
      <form
        data-testid="admin-login-form"
        onSubmit={submit}
        className="w-full max-w-sm bg-[#0A0A0A] border border-[#D4AF37]/25 p-8"
      >
        <div className="flex flex-col items-center text-center">
          <img src="/logo.svg" alt="Meè & U" className="h-12 w-auto mb-6" />
          <div className="h-10 w-10 rounded-full border border-[#D4AF37]/40 flex items-center justify-center">
            <Lock size={16} className="text-[#D4AF37]" />
          </div>
          <h1 className="mt-4 f-serif text-2xl text-[#F8F8F6]">Admin Access</h1>
          <p className="mt-1 text-xs text-[#6E6E68]">This area is password-protected.</p>
        </div>
        <input
          data-testid="admin-password-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={`${inputCls} mt-6`}
          autoFocus
        />
        {error && (
          <p data-testid="admin-login-error" className="mt-3 text-sm text-red-400">
            {error}
          </p>
        )}
        <button
          data-testid="admin-login-submit"
          type="submit"
          disabled={busy}
          className="mt-5 w-full bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#C5A059] text-black f-mono uppercase tracking-[0.2em] text-xs py-3.5 border border-[#D4AF37] hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all duration-300 disabled:opacity-50"
        >
          {busy ? "Checking…" : "Enter"}
        </button>
        <Link to="/" data-testid="admin-back-home" className="mt-5 block text-center f-mono text-[10px] uppercase tracking-[0.25em] text-[#6E6E68] hover:text-[#D4AF37] transition-colors">
          ← Back to site
        </Link>
      </form>
    </div>
  );
}

function ProductForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial);
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    const payload = {
      ...form,
      sizes: form.sizes.filter((s) => s.label && s.price !== "").map((s) => ({ label: s.label, price: Number(s.price) })),
      notes:
        form.notes.top || form.notes.heart || form.notes.base
          ? { top: form.notes.top || null, heart: form.notes.heart || null, base: form.notes.base || null }
          : null,
    };
    try {
      await onSave(payload);
    } catch (err) {
      toast.error(formatApiError(err, "Could not save product"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form data-testid="product-form" onSubmit={submit} className="bg-[#0A0A0A] border border-[#D4AF37]/25 p-6 flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Name</label>
          <input data-testid="product-name-input" required value={form.name} onChange={(e) => set("name", e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Category</label>
          <select data-testid="product-category-select" value={form.category} onChange={(e) => set("category", e.target.value)} className={inputCls}>
            <option value="Attar">Attar</option>
            <option value="Perfume">Perfume</option>
          </select>
        </div>
      </div>
      <div>
        <label className={labelCls}>Description</label>
        <textarea data-testid="product-description-input" rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Sizes &amp; Prices</label>
        {form.sizes.map((s, i) => (
          <div key={i} className="flex gap-3 mb-2">
            <input
              data-testid={`size-label-input-${i}`}
              placeholder="e.g. 6ml"
              value={s.label}
              onChange={(e) => set("sizes", form.sizes.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))}
              className={inputCls}
            />
            <input
              data-testid={`size-price-input-${i}`}
              placeholder="₹ Price"
              type="number"
              min="0"
              value={s.price}
              onChange={(e) => set("sizes", form.sizes.map((x, j) => (j === i ? { ...x, price: e.target.value } : x)))}
              className={inputCls}
            />
            {form.sizes.length > 1 && (
              <button type="button" data-testid={`size-remove-${i}`} onClick={() => set("sizes", form.sizes.filter((_, j) => j !== i))} className="text-red-400 px-2">
                <X size={16} />
              </button>
            )}
          </div>
        ))}
        <button type="button" data-testid="size-add-button" onClick={() => set("sizes", [...form.sizes, { label: "", price: "" }])} className="f-mono text-[10px] uppercase tracking-[0.2em] text-[#D4AF37] hover:text-[#F3E5AB]">
          + Add size
        </button>
      </div>
      <div>
        <label className={labelCls}>Image</label>
        <div className="flex items-center gap-4">
          {form.image && <img src={form.image} alt="" className="h-16 w-16 object-cover border border-[#D4AF37]/30" />}
          <input data-testid="product-image-input" type="file" accept="image/*" onChange={(e) => e.target.files[0] && readFileAsDataUrl(e.target.files[0], (url) => set("image", url))} className="text-xs text-[#A1A19A] file:mr-3 file:bg-[#141414] file:border file:border-[#D4AF37]/30 file:text-[#D4AF37] file:px-3 file:py-2 file:text-xs file:f-mono" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {["top", "heart", "base"].map((k) => (
          <div key={k}>
            <label className={labelCls}>{k} notes (optional)</label>
            <input data-testid={`notes-${k}-input`} value={form.notes[k]} onChange={(e) => set("notes", { ...form.notes, [k]: e.target.value })} className={inputCls} />
          </div>
        ))}
      </div>
      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm text-[#A1A19A]">
          <input data-testid="product-instock-toggle" type="checkbox" checked={form.in_stock} onChange={(e) => set("in_stock", e.target.checked)} className="accent-[#D4AF37]" />
          In stock
        </label>
        <label className="flex items-center gap-2 text-sm text-[#A1A19A]">
          <input data-testid="product-featured-toggle" type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} className="accent-[#D4AF37]" />
          Featured on home
        </label>
      </div>
      <div className="flex gap-3">
        <button data-testid="product-save-button" type="submit" disabled={busy} className="bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#C5A059] text-black f-mono uppercase tracking-[0.2em] text-xs py-3 px-8 border border-[#D4AF37] disabled:opacity-50">
          {busy ? "Saving…" : "Save Product"}
        </button>
        <button type="button" data-testid="product-cancel-button" onClick={onCancel} className="border border-[#D4AF37]/40 text-[#F8F8F6] f-mono uppercase tracking-[0.2em] text-xs py-3 px-6 hover:bg-[#D4AF37]/10">
          Cancel
        </button>
      </div>
    </form>
  );
}

function ProductsTab() {
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(null); // null | "new" | product

  const load = useCallback(() => api.get("/products").then((r) => setProducts(r.data)), []);
  useEffect(() => {
    load().catch(() => {});
  }, [load]);

  const save = async (payload) => {
    if (editing === "new") await api.post("/products", payload);
    else await api.put(`/products/${editing.id}`, payload);
    toast.success("Product saved");
    setEditing(null);
    load();
  };

  const remove = async (p) => {
    if (!window.confirm(`Delete "${p.name}"?`)) return;
    await api.delete(`/products/${p.id}`);
    toast.success("Product deleted");
    load();
  };

  if (editing) {
    const initial =
      editing === "new"
        ? EMPTY_PRODUCT
        : {
            ...editing,
            sizes: editing.sizes.length ? editing.sizes : [{ label: "", price: "" }],
            notes: { top: editing.notes?.top || "", heart: editing.notes?.heart || "", base: editing.notes?.base || "" },
          };
    return <ProductForm initial={initial} onSave={save} onCancel={() => setEditing(null)} />;
  }

  return (
    <div>
      <button data-testid="product-add-button" onClick={() => setEditing("new")} className="mb-6 inline-flex items-center gap-2 bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#C5A059] text-black f-mono uppercase tracking-[0.2em] text-xs py-3 px-6 border border-[#D4AF37]">
        <Plus size={14} /> Add Product
      </button>
      <div className="flex flex-col gap-3">
        {products.map((p) => (
          <div key={p.id} data-testid={`admin-product-row-${p.id}`} className="flex items-center gap-4 bg-[#0A0A0A] border border-[#D4AF37]/20 p-4">
            {p.image && <img src={p.image} alt="" className="h-14 w-14 object-cover border border-[#D4AF37]/20 shrink-0" />}
            <div className="flex-1 min-w-0">
              <p className="f-serif text-lg text-[#F8F8F6] truncate">{p.name}</p>
              <p className="f-mono text-[10px] uppercase tracking-[0.2em] text-[#6E6E68]">
                {p.category} · {p.in_stock ? "In stock" : "Out of stock"} · From {inr(Math.min(...p.sizes.map((s) => s.price)))}
              </p>
            </div>
            <button data-testid={`product-edit-${p.id}`} onClick={() => setEditing(p)} className="text-[#D4AF37] hover:text-[#F3E5AB] p-2">
              <Pencil size={16} />
            </button>
            <button data-testid={`product-delete-${p.id}`} onClick={() => remove(p)} className="text-red-400 hover:text-red-300 p-2">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        {products.length === 0 && <p className="text-sm text-[#6E6E68]">No products yet.</p>}
      </div>
    </div>
  );
}

function OfferForm({ initial, products, onSave, onCancel }) {
  const [form, setForm] = useState(initial);
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const toggleProduct = (pid) =>
    set("product_ids", form.product_ids.includes(pid) ? form.product_ids.filter((x) => x !== pid) : [...form.product_ids, pid]);

  const submit = async (e) => {
    e.preventDefault();
    if (form.product_ids.length < 2) {
      toast.error("Pick at least 2 products for a combo.");
      return;
    }
    setBusy(true);
    try {
      await onSave({ ...form, price: Number(form.price) });
    } catch (err) {
      toast.error(formatApiError(err, "Could not save offer"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form data-testid="offer-form" onSubmit={submit} className="bg-[#0A0A0A] border border-[#D4AF37]/25 p-6 flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Combo name</label>
          <input data-testid="offer-name-input" required value={form.name} onChange={(e) => set("name", e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Combo price (₹)</label>
          <input data-testid="offer-price-input" required type="number" min="0" value={form.price} onChange={(e) => set("price", e.target.value)} className={inputCls} />
        </div>
      </div>
      <div>
        <label className={labelCls}>Products in this combo (pick 2 or more)</label>
        <div className="flex flex-wrap gap-3">
          {products.map((p) => (
            <label key={p.id} data-testid={`offer-product-check-${p.id}`} className={`flex items-center gap-2 border px-3.5 py-2 text-sm cursor-pointer transition-colors ${form.product_ids.includes(p.id) ? "border-[#D4AF37] bg-[#D4AF37]/10 text-[#F3E5AB]" : "border-[#D4AF37]/25 text-[#A1A19A]"}`}>
              <input type="checkbox" checked={form.product_ids.includes(p.id)} onChange={() => toggleProduct(p.id)} className="accent-[#D4AF37]" />
              {p.name}
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className={labelCls}>Image</label>
        <div className="flex items-center gap-4">
          {form.image && <img src={form.image} alt="" className="h-16 w-16 object-cover border border-[#D4AF37]/30" />}
          <input data-testid="offer-image-input" type="file" accept="image/*" onChange={(e) => e.target.files[0] && readFileAsDataUrl(e.target.files[0], (url) => set("image", url))} className="text-xs text-[#A1A19A] file:mr-3 file:bg-[#141414] file:border file:border-[#D4AF37]/30 file:text-[#D4AF37] file:px-3 file:py-2 file:text-xs" />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm text-[#A1A19A]">
        <input data-testid="offer-active-toggle" type="checkbox" checked={form.active} onChange={(e) => set("active", e.target.checked)} className="accent-[#D4AF37]" />
        Active (visible on the site)
      </label>
      <div className="flex gap-3">
        <button data-testid="offer-save-button" type="submit" disabled={busy} className="bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#C5A059] text-black f-mono uppercase tracking-[0.2em] text-xs py-3 px-8 border border-[#D4AF37] disabled:opacity-50">
          {busy ? "Saving…" : "Save Offer"}
        </button>
        <button type="button" data-testid="offer-cancel-button" onClick={onCancel} className="border border-[#D4AF37]/40 text-[#F8F8F6] f-mono uppercase tracking-[0.2em] text-xs py-3 px-6 hover:bg-[#D4AF37]/10">
          Cancel
        </button>
      </div>
    </form>
  );
}

function OffersTab() {
  const [offers, setOffers] = useState([]);
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(null);

  const load = useCallback(() => {
    api.get("/admin/offers").then((r) => setOffers(r.data)).catch(() => {});
    api.get("/products").then((r) => setProducts(r.data)).catch(() => {});
  }, []);
  useEffect(load, [load]);

  const save = async (payload) => {
    if (editing === "new") await api.post("/offers", payload);
    else await api.put(`/offers/${editing.id}`, payload);
    toast.success("Offer saved");
    setEditing(null);
    load();
  };

  const remove = async (o) => {
    if (!window.confirm(`Delete offer "${o.name}"?`)) return;
    await api.delete(`/offers/${o.id}`);
    toast.success("Offer deleted");
    load();
  };

  const toggleActive = async (o) => {
    await api.put(`/offers/${o.id}`, { name: o.name, price: o.price, product_ids: o.product_ids, image: o.image, active: !o.active });
    load();
  };

  if (editing) {
    return <OfferForm initial={editing === "new" ? EMPTY_OFFER : editing} products={products} onSave={save} onCancel={() => setEditing(null)} />;
  }

  return (
    <div>
      <button data-testid="offer-add-button" onClick={() => setEditing("new")} className="mb-6 inline-flex items-center gap-2 bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#C5A059] text-black f-mono uppercase tracking-[0.2em] text-xs py-3 px-6 border border-[#D4AF37]">
        <Plus size={14} /> Add Offer / Combo
      </button>
      <div className="flex flex-col gap-3">
        {offers.map((o) => (
          <div key={o.id} data-testid={`admin-offer-row-${o.id}`} className="flex items-center gap-4 bg-[#0A0A0A] border border-[#D4AF37]/20 p-4">
            {o.image && <img src={o.image} alt="" className="h-14 w-14 object-cover border border-[#D4AF37]/20 shrink-0" />}
            <div className="flex-1 min-w-0">
              <p className="f-serif text-lg text-[#F8F8F6] truncate">{o.name}</p>
              <p className="f-mono text-[10px] uppercase tracking-[0.2em] text-[#6E6E68]">
                {inr(o.price)} · {o.product_ids.length} products · {o.active ? "Active" : "Hidden"}
              </p>
            </div>
            <button data-testid={`offer-toggle-${o.id}`} onClick={() => toggleActive(o)} className={`f-mono text-[10px] uppercase tracking-[0.15em] px-3 py-1.5 border ${o.active ? "border-[#D4AF37] text-[#D4AF37]" : "border-[#6E6E68]/40 text-[#6E6E68]"}`}>
              {o.active ? "Active" : "Inactive"}
            </button>
            <button data-testid={`offer-edit-${o.id}`} onClick={() => setEditing(o)} className="text-[#D4AF37] hover:text-[#F3E5AB] p-2">
              <Pencil size={16} />
            </button>
            <button data-testid={`offer-delete-${o.id}`} onClick={() => remove(o)} className="text-red-400 hover:text-red-300 p-2">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        {offers.length === 0 && <p className="text-sm text-[#6E6E68]">No offers yet — the Special Offers section stays hidden until you activate one.</p>}
      </div>
    </div>
  );
}

function WhatsAppTab() {
  const [numbers, setNumbers] = useState([]);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => api.get("/settings/whatsapp").then((r) => setNumbers(r.data.numbers || [])), []);
  useEffect(() => {
    load().catch(() => {});
  }, [load]);

  const save = async (next) => {
    setBusy(true);
    try {
      const payload = next.map(({ label, number, primary }) => ({ label, number, primary }));
      const { data } = await api.put("/settings/whatsapp", payload);
      setNumbers(data.numbers);
      toast.success("WhatsApp numbers saved");
    } catch (err) {
      toast.error(formatApiError(err, "Could not save numbers"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <p className="mb-5 text-sm text-[#A1A19A] max-w-xl">
        Orders on the site are sent to the <span className="text-[#D4AF37]">primary</span> number. Add, edit, or remove numbers here — nothing is hardcoded.
      </p>
      <div className="flex flex-col gap-3">
        {numbers.map((n, i) => (
          <div key={n.id || i} data-testid={`whatsapp-row-${i}`} className="flex flex-wrap items-center gap-3 bg-[#0A0A0A] border border-[#D4AF37]/20 p-4">
            <input
              data-testid={`whatsapp-label-${i}`}
              value={n.label}
              placeholder="Label (e.g. Founder 1)"
              onChange={(e) => setNumbers(numbers.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))}
              className={`${inputCls} flex-1 min-w-[140px]`}
            />
            <input
              data-testid={`whatsapp-number-${i}`}
              value={n.number}
              placeholder="91XXXXXXXXXX"
              onChange={(e) => setNumbers(numbers.map((x, j) => (j === i ? { ...x, number: e.target.value.replace(/[^\d]/g, "") } : x)))}
              className={`${inputCls} flex-1 min-w-[140px]`}
            />
            <label className="flex items-center gap-2 text-sm text-[#A1A19A]">
              <input
                data-testid={`whatsapp-primary-${i}`}
                type="radio"
                name="primary-wa"
                checked={!!n.primary}
                onChange={() => setNumbers(numbers.map((x, j) => ({ ...x, primary: j === i })))}
                className="accent-[#D4AF37]"
              />
              Primary
            </label>
            <button data-testid={`whatsapp-remove-${i}`} onClick={() => save(numbers.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-300 p-2">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
      <div className="mt-5 flex gap-3">
        <button
          data-testid="whatsapp-add-button"
          onClick={() => setNumbers([...numbers, { label: "", number: "", primary: numbers.length === 0 }])}
          className="inline-flex items-center gap-2 border border-[#D4AF37]/40 text-[#F8F8F6] f-mono uppercase tracking-[0.2em] text-xs py-3 px-6 hover:bg-[#D4AF37]/10"
        >
          <Plus size={14} /> Add Number
        </button>
        <button
          data-testid="whatsapp-save-button"
          onClick={() => save(numbers)}
          disabled={busy || numbers.length === 0}
          className="bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#C5A059] text-black f-mono uppercase tracking-[0.2em] text-xs py-3 px-8 border border-[#D4AF37] disabled:opacity-50"
        >
          {busy ? "Saving…" : "Save Numbers"}
        </button>
      </div>
    </div>
  );
}

const TABS = [
  { key: "products", label: "Products" },
  { key: "offers", label: "Offers / Combos" },
  { key: "whatsapp", label: "WhatsApp Numbers" },
];

export default function Admin() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(!!getToken());
  const [tab, setTab] = useState("products");

  useEffect(() => {
    if (!getToken()) return;
    api
      .get("/admin/verify")
      .then(() => setAuthed(true))
      .catch(() => clearToken())
      .finally(() => setChecking(false));
  }, []);

  const logout = () => {
    clearToken();
    setAuthed(false);
  };

  if (checking) return <div className="min-h-screen bg-[#070707]" />;
  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />;

  return (
    <div data-testid="admin-dashboard" className="min-h-screen bg-[#070707]">
      <header className="border-b border-[#D4AF37]/20 bg-[#0A0A0A]">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 h-[72px] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/logo.svg" alt="Meè & U" className="h-10 w-auto" />
            <span className="f-mono text-[10px] uppercase tracking-[0.3em] text-[#C5A059]">Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/" data-testid="admin-view-site" className="f-mono text-[10px] uppercase tracking-[0.25em] text-[#A1A19A] hover:text-[#D4AF37] transition-colors">
              View site
            </Link>
            <button data-testid="admin-logout-button" onClick={logout} className="inline-flex items-center gap-2 f-mono text-[10px] uppercase tracking-[0.25em] text-[#A1A19A] hover:text-red-400 transition-colors">
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-10">
        <div className="flex gap-2 flex-wrap mb-8">
          {TABS.map((t) => (
            <button
              key={t.key}
              data-testid={`admin-tab-${t.key}`}
              onClick={() => setTab(t.key)}
              className={`f-mono text-[11px] uppercase tracking-[0.2em] px-5 py-2.5 border transition-all duration-300 ${
                tab === t.key
                  ? "bg-[#D4AF37] text-black border-[#D4AF37]"
                  : "bg-transparent text-[#A1A19A] border-[#D4AF37]/30 hover:border-[#D4AF37]/70"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "products" && <ProductsTab />}
        {tab === "offers" && <OffersTab />}
        {tab === "whatsapp" && <WhatsAppTab />}
      </div>
    </div>
  );
}
