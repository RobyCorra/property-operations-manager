export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-6 text-center">
      <div className="w-20 h-20 rounded-2xl bg-indigo-950 flex items-center justify-center mb-8 shadow-xl">
        <span className="text-4xl font-black text-white">P</span>
      </div>

      <h1 className="text-2xl font-bold text-slate-900 mb-2">Sei offline</h1>
      <p className="text-slate-500 mb-8 max-w-xs">
        Nessuna connessione disponibile. Le pagine già visitate sono disponibili in cache.
      </p>

      <div className="space-y-3 w-full max-w-xs">
        <a
          href="/dashboard/cleaner"
          className="flex items-center justify-center gap-2 w-full px-6 py-3.5 bg-indigo-950 text-white rounded-full text-sm font-semibold"
        >
          🧹 Dashboard Pulizie
        </a>
        <a
          href="/dashboard/maintenance"
          className="flex items-center justify-center gap-2 w-full px-6 py-3.5 bg-slate-200 text-slate-800 rounded-full text-sm font-semibold"
        >
          🔧 Dashboard Manutenzione
        </a>
      </div>

      <p className="mt-10 text-xs text-slate-400">
        Le spunte e le foto scattate vengono salvate localmente e sincronizzate quando torni online.
      </p>
    </div>
  );
}
