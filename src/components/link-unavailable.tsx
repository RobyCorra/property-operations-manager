/**
 * Mostrata al posto di un 404 muto quando un link pubblico non è utilizzabile.
 * Distingue la scadenza (il link è esistito) dal token sconosciuto, così il
 * cleaner sa se deve chiedere un link nuovo o se ha sbagliato indirizzo.
 */
export default function LinkUnavailable({ reason }: { reason: "expired" | "unknown" }) {
  const expired = reason === "expired";

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-sm rounded-3xl bg-white border border-slate-100 p-8 text-center shadow-sm">
        <div className="text-5xl mb-4">{expired ? "⏳" : "🔗"}</div>

        <h1 className="text-xl font-bold text-slate-900 mb-2">
          {expired ? "Link scaduto" : "Link non valido"}
        </h1>

        <p className="text-sm text-slate-500 leading-relaxed">
          {expired
            ? "Questo link è scaduto per motivi di sicurezza. Chiedi al responsabile di inviartene uno nuovo."
            : "Questo link non corrisponde a nessuna pulizia. Controlla di aver aperto l'indirizzo completo, oppure chiedi al responsabile di inviartelo di nuovo."}
        </p>

        <p className="mt-6 text-[10px] font-black uppercase tracking-widest text-slate-300">
          Property Operations Manager
        </p>
      </div>
    </main>
  );
}
