"use client";

import { useState, useMemo, useTransition } from "react";
import { useLang } from "@/src/components/lang-context";
import {
  createClient, updateClient, deleteClient,
  type ClientFormData, type ClientType,
} from "@/src/app/actions/client";

type Client = {
  id: string;
  type: string;
  name: string;
  vatNumber: string | null;
  taxCode: string | null;
  sdiCode: string | null;
  pec: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  zip: string | null;
  province: string | null;
  country: string | null;
  notes: string | null;
  apartments: { id: string; name: string }[];
};

type ApartmentOpt = { id: string; name: string; clientId: string | null; client: { name: string } | null };

type Props = { initialClients: Client[]; apartments: ApartmentOpt[] };

const EMPTY: ClientFormData = {
  type: "PRIVATE", name: "", vatNumber: "", taxCode: "", sdiCode: "", pec: "",
  email: "", phone: "", address: "", city: "", zip: "", province: "", country: "Italia",
  notes: "", apartmentIds: [],
};

function initials(name: string) {
  return name.split(" ").filter(Boolean).map((p) => p[0]).join("").toUpperCase().slice(0, 2) || "?";
}

export default function ClientsPanel({ initialClients, apartments }: Props) {
  const { t } = useLang();
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [form, setForm] = useState<ClientFormData>(EMPTY);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter((c) =>
      [c.name, c.vatNumber, c.taxCode, c.email, ...c.apartments.map((a) => a.name)]
        .filter(Boolean).some((v) => (v as string).toLowerCase().includes(q))
    );
  }, [clients, query]);

  const companyCount = clients.filter((c) => c.type === "COMPANY").length;

  function openAdd() { setEditing(null); setForm(EMPTY); setError(""); setShowForm(true); }
  function openEdit(c: Client) {
    setEditing(c);
    setForm({
      type: (c.type === "COMPANY" ? "COMPANY" : "PRIVATE") as ClientType,
      name: c.name, vatNumber: c.vatNumber ?? "", taxCode: c.taxCode ?? "", sdiCode: c.sdiCode ?? "",
      pec: c.pec ?? "", email: c.email ?? "", phone: c.phone ?? "", address: c.address ?? "",
      city: c.city ?? "", zip: c.zip ?? "", province: c.province ?? "", country: c.country ?? "Italia",
      notes: c.notes ?? "", apartmentIds: c.apartments.map((a) => a.id),
    });
    setError(""); setShowForm(true);
  }

  function handleSave() {
    if (!form.name.trim()) { setError(t.clNameRequired); return; }
    setError("");
    startTransition(async () => {
      const res = editing ? await updateClient(editing.id, form) : await createClient(form);
      if (!res.success) { setError(res.error ?? "Errore"); return; }
      window.location.reload();
    });
  }

  function handleDelete(id: string) {
    if (!confirm(t.clDeleteConfirm)) return;
    startTransition(async () => {
      await deleteClient(id);
      setClients((prev) => prev.filter((c) => c.id !== id));
    });
  }

  const isCompany = form.type === "COMPANY";
  const inp = "w-full border border-[#e6e2f2] rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-500";
  const lbl = "text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1.5";

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">{t.clTitle}</h2>
          <p className="text-xs text-slate-400 mt-0.5">{t.clSubtitle(clients.length)}{companyCount > 0 ? ` · ${companyCount} ${t.clCompany.toLowerCase()}` : ""}</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-full uppercase tracking-widest hover:bg-slate-700">{t.clNew}</button>
      </div>

      {/* Search */}
      <div className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 flex items-center gap-2">
        <span className="text-slate-400">🔎</span>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.clSearch} className="flex-1 text-sm outline-none bg-transparent" />
      </div>

      {clients.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center text-slate-400">
          <p className="text-3xl mb-3">🧾</p>
          <p className="text-sm font-medium">{t.clNoClients}</p>
          <p className="text-xs mt-1">{t.clEmptyHint}</p>
        </div>
      )}

      {filtered.map((c) => {
        const company = c.type === "COMPANY";
        const sub = company
          ? [c.vatNumber && `P.IVA ${c.vatNumber}`, c.sdiCode && `SDI ${c.sdiCode}`].filter(Boolean).join(" · ")
          : [c.taxCode && `CF ${c.taxCode}`, c.email].filter(Boolean).join(" · ");
        return (
          <div key={c.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white font-black text-base flex-shrink-0 ${company ? "bg-gradient-to-br from-violet-600 to-fuchsia-500" : "bg-gradient-to-br from-sky-500 to-cyan-400"}`}>{initials(c.name)}</div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 text-sm flex items-center gap-2 flex-wrap">
                  {c.name}
                  <span className={`text-[9px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full ${company ? "bg-violet-100 text-violet-700" : "bg-sky-100 text-sky-700"}`}>{company ? t.clCompany : t.clPrivate}</span>
                </p>
                {sub && <p className="text-[11.5px] text-slate-400 mt-0.5 truncate">{sub}</p>}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => openEdit(c)} className="px-3 py-1.5 text-[11px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 rounded-lg">✏️</button>
                <button onClick={() => handleDelete(c.id)} className="px-3 py-1.5 text-[11px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 rounded-lg">🗑️</button>
              </div>
            </div>
            {c.apartments.length > 0 && (
              <div className="mt-3 flex gap-1.5 flex-wrap">
                {c.apartments.map((a) => (
                  <span key={a.id} className="text-[10.5px] font-bold text-violet-800 bg-violet-50 border border-violet-100 rounded-lg px-2.5 py-1">🏠 {a.name}</span>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* ── Modal ── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">{editing ? t.clEditClient : t.clNewClient}</h3>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 text-lg font-bold">×</button>
            </div>

            <div className="p-6 space-y-4">
              {/* Tipo */}
              <div className="grid grid-cols-2 gap-3">
                {(["PRIVATE", "COMPANY"] as const).map((ty) => (
                  <button key={ty} type="button" onClick={() => setForm((f) => ({ ...f, type: ty }))}
                    className={`flex flex-col items-center gap-1 py-3 border-2 rounded-xl ${form.type === ty ? "border-violet-600 bg-violet-600 text-white" : "border-slate-200 text-slate-600 hover:border-slate-400"}`}>
                    <span className="text-lg">{ty === "COMPANY" ? "🏢" : "👤"}</span>
                    <span className="text-[11px] font-black uppercase tracking-wide">{ty === "COMPANY" ? t.clCompany : t.clPrivate}</span>
                  </button>
                ))}
              </div>

              <div>
                <label className={lbl}>{isCompany ? t.clNameCompany : t.clNamePrivate} *</label>
                <input className={inp} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              </div>

              {isCompany ? (
                <div className="grid grid-cols-2 gap-3">
                  <div><label className={lbl}>{t.clVat}</label><input className={inp} value={form.vatNumber} onChange={(e) => setForm((f) => ({ ...f, vatNumber: e.target.value }))} /></div>
                  <div><label className={lbl}>{t.clTaxCode}</label><input className={inp} value={form.taxCode} onChange={(e) => setForm((f) => ({ ...f, taxCode: e.target.value }))} /></div>
                  <div><label className={lbl}>{t.clSdi}</label><input className={inp} value={form.sdiCode} onChange={(e) => setForm((f) => ({ ...f, sdiCode: e.target.value }))} /></div>
                  <div><label className={lbl}>{t.clPec}</label><input className={inp} value={form.pec} onChange={(e) => setForm((f) => ({ ...f, pec: e.target.value }))} /></div>
                </div>
              ) : (
                <div><label className={lbl}>{t.clTaxCode}</label><input className={inp} value={form.taxCode} onChange={(e) => setForm((f) => ({ ...f, taxCode: e.target.value }))} /></div>
              )}

              <div className="text-[10px] font-black uppercase tracking-widest text-slate-300 border-t border-slate-100 pt-3">{t.clContacts}</div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={lbl}>{t.clEmail}</label><input className={inp} value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} /></div>
                <div><label className={lbl}>{t.clPhone}</label><input className={inp} value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} /></div>
              </div>

              <div className="text-[10px] font-black uppercase tracking-widest text-slate-300 border-t border-slate-100 pt-3">{t.clBilling}</div>
              <div><label className={lbl}>{t.clAddress}</label><input className={inp} value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} /></div>
              <div className="grid grid-cols-[1.4fr_1fr_0.8fr] gap-3">
                <div><label className={lbl}>{t.clCity}</label><input className={inp} value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} /></div>
                <div><label className={lbl}>{t.clZip}</label><input className={inp} value={form.zip} onChange={(e) => setForm((f) => ({ ...f, zip: e.target.value }))} /></div>
                <div><label className={lbl}>{t.clProvince}</label><input className={inp} value={form.province} onChange={(e) => setForm((f) => ({ ...f, province: e.target.value }))} /></div>
              </div>

              {/* Appartamenti */}
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-300 border-t border-slate-100 pt-3">{t.clApartments}</div>
              <div className="flex flex-wrap gap-2">
                {apartments.length === 0 && <span className="text-xs text-slate-400">{t.clApartmentsNone}</span>}
                {apartments.map((a) => {
                  const on = form.apartmentIds.includes(a.id);
                  const takenByOther = a.clientId && (!editing || a.clientId !== editing.id);
                  return (
                    <button key={a.id} type="button"
                      onClick={() => setForm((f) => ({ ...f, apartmentIds: on ? f.apartmentIds.filter((x) => x !== a.id) : [...f.apartmentIds, a.id] }))}
                      className={`text-xs font-bold rounded-lg px-3 py-2 border ${on ? "bg-violet-100 border-violet-300 text-violet-700" : "border-slate-200 text-slate-600 hover:border-slate-400"}`}>
                      🏠 {a.name}{on ? " ✓" : ""}
                      {takenByOther && !on && <span className="block text-[9px] font-normal text-amber-500">{t.clTakenBy} {a.client?.name}</span>}
                    </button>
                  );
                })}
              </div>

              <div><label className={lbl}>{t.clNotes}</label><textarea rows={2} className={inp} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} /></div>

              {error && <p className="text-xs text-red-600 font-semibold">{error}</p>}

              <div className="flex gap-3 pt-1">
                <button onClick={handleSave} disabled={isPending} className="flex-1 py-3 bg-slate-900 text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-slate-700 disabled:opacity-40">{isPending ? "…" : t.clSave}</button>
                <button onClick={() => setShowForm(false)} className="px-5 py-3 border border-slate-200 text-slate-500 rounded-full text-xs font-black uppercase tracking-widest hover:bg-slate-50">{t.mgrCancel}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
