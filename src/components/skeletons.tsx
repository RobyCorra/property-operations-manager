/**
 * Skeleton di caricamento riutilizzabili per i file `loading.tsx` delle rotte.
 *
 * Next.js mostra questi skeleton ISTANTANEAMENTE al tocco (Suspense boundary),
 * mentre il server renderizza la pagina e Prisma carica i dati. Senza di essi
 * lo schermo resta congelato sulla pagina precedente e il tocco "sembra morto".
 *
 * Sono server component puri (solo JSX + Tailwind): nessun hook client.
 * Replicano il guscio reale di ogni pagina per evitare salti di layout quando
 * arriva il contenuto vero.
 */

/** Blocco grigio pulsante — il mattone base di ogni skeleton. */
export function Shimmer({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-slate-200/80 ${className}`} />;
}

/**
 * Skeleton per le pagine-lista del manager (pulizie, manutenzioni,
 * prenotazioni, appartamenti). Ricalca esattamente il guscio:
 * <main bg-[#faf8ff]> + header sticky con back-button/titolo/azione + lista.
 */
export function ListPageSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <main className="min-h-screen bg-[#faf8ff] p-4 md:p-6 font-sans overflow-x-hidden">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header sticky (back + titolo + azione), stessa geometria delle pagine reali */}
        <div
          className="sticky top-0 z-30 -mx-4 md:-mx-6 px-4 md:px-6 pb-3 -mt-4 md:-mt-6 bg-[#faf8ff] flex items-center gap-4"
          style={{ paddingTop: "calc(env(safe-area-inset-top) + 16px)" }}
        >
          <Shimmer className="w-10 h-10 rounded-full shrink-0" />
          <div className="flex-1 flex items-center justify-between gap-3">
            <div className="space-y-2">
              <Shimmer className="h-6 w-40 rounded-md" />
              <Shimmer className="h-3 w-28 rounded-md" />
            </div>
            <Shimmer className="h-11 w-32 rounded-full shrink-0" />
          </div>
        </div>

        {/* Righe lista */}
        <div className="space-y-3">
          {Array.from({ length: rows }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-4"
            >
              <Shimmer className="w-11 h-11 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <Shimmer className="h-4 w-1/2 rounded-md" />
                <Shimmer className="h-3 w-1/3 rounded-md" />
              </div>
              <Shimmer className="h-7 w-20 rounded-full shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

/**
 * Skeleton per la dashboard manager mobile: banner + griglia KPI 2 colonne +
 * azioni rapide + stato appartamenti. L'header persistente (Roberto/gear/bell)
 * resta visibile perché vive nel layout, non nella pagina.
 */
export function ManagerDashboardSkeleton() {
  return (
    <div className="bg-[#f8f7ff] min-h-full px-4 pt-3 pb-24 space-y-4">
      {/* Banner avviso */}
      <Shimmer className="h-16 w-full rounded-2xl" />

      {/* Griglia KPI 2 colonne */}
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-3xl border border-slate-100 p-5 space-y-4">
            <Shimmer className="w-10 h-10 rounded-2xl" />
            <Shimmer className="h-8 w-10 rounded-md" />
            <Shimmer className="h-3 w-24 rounded-md" />
          </div>
        ))}
      </div>

      {/* Azioni rapide */}
      <Shimmer className="h-3 w-28 rounded-md mt-2" />
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Shimmer key={i} className="h-24 rounded-3xl" />
        ))}
      </div>

      {/* Stato appartamenti */}
      <Shimmer className="h-3 w-40 rounded-md mt-2" />
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-3">
            <Shimmer className="w-3 h-3 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <Shimmer className="h-4 w-1/2 rounded-md" />
              <Shimmer className="h-3 w-1/4 rounded-md" />
            </div>
            <Shimmer className="h-7 w-24 rounded-full shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
