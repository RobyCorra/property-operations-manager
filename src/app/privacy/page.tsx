export const metadata = { title: "Informativa sulla privacy" };

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-10">
      <div className="max-w-2xl mx-auto prose prose-sm text-gray-700">
        <h1 className="text-2xl font-semibold text-gray-900">Informativa sulla privacy</h1>
        <p className="text-gray-500">Ai sensi del Regolamento (UE) 2016/679 (GDPR).</p>

        <h2 className="text-lg font-semibold text-gray-900 mt-6">Titolare del trattamento</h2>
        <p>L&apos;organizzazione registrata sulla piattaforma è titolare del trattamento dei dati inseriti.</p>

        <h2 className="text-lg font-semibold text-gray-900 mt-6">Dati trattati</h2>
        <p>Dati degli utenti (nome, email, ruolo), dati operativi degli appartamenti, dati degli ospiti (nome) e, per i collaboratori esterni, dati di contatto e amministrativi.</p>

        <h2 className="text-lg font-semibold text-gray-900 mt-6">Finalità e base giuridica</h2>
        <p>Gestione operativa di pulizie, manutenzioni e check-in. Base giuridica: esecuzione del contratto e legittimo interesse del titolare.</p>

        <h2 className="text-lg font-semibold text-gray-900 mt-6">Conservazione</h2>
        <p>I dati sono conservati per il tempo necessario alle finalità indicate e poi cancellati o anonimizzati.</p>

        <h2 className="text-lg font-semibold text-gray-900 mt-6">Diritti dell&apos;interessato</h2>
        <p>Accesso, rettifica, cancellazione, limitazione, portabilità e opposizione, scrivendo al titolare del trattamento.</p>

        <p className="text-gray-400 text-xs mt-8">
          Documento da completare a cura del titolare/consulente privacy prima della pubblicazione definitiva.
        </p>
      </div>
    </main>
  );
}
