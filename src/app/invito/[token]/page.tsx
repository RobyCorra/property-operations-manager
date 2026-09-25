import { cookies } from "next/headers";
import { getInviteDetails } from "@/src/app/actions/company";
import InviteAcceptCard from "@/src/components/invite-accept-card";

const SCOPE_LABEL: Record<string, string> = {
  CLEANING: "Pulizie",
  MAINTENANCE: "Manutenzione",
  CHECKIN: "Check-in",
  SUPERVISION: "Supervisione",
};

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const invite = await getInviteDetails(token);
  const ck = await cookies();
  const role = ck.get("role")?.value;
  const companyId = ck.get("companyId")?.value;
  const isCompanyManager = role === "MANAGER" && !!companyId;

  if (!invite) {
    return (
      <main className="min-h-screen bg-[#faf8ff] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 max-w-md w-full text-center">
          <p className="text-4xl mb-4">🔗</p>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Invito non trovato</h1>
          <p className="text-sm text-slate-500">Questo link non è valido o è già stato utilizzato.</p>
        </div>
      </main>
    );
  }

  if (invite.status !== "PENDING") {
    return (
      <main className="min-h-screen bg-[#faf8ff] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 max-w-md w-full text-center">
          <p className="text-4xl mb-4">✅</p>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Invito già accettato</h1>
          <p className="text-sm text-slate-500">Questa delega è già attiva.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf8ff] flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 max-w-md w-full">
        <p className="text-4xl text-center mb-4">🤝</p>
        <h1 className="text-xl font-bold text-slate-900 text-center mb-1">Invito di collaborazione</h1>
        <p className="text-sm text-slate-500 text-center mb-6">
          L&apos;organizzazione <strong className="text-slate-800">{invite.organizationName}</strong> ti invita a gestire la funzione:
        </p>

        <div className="bg-slate-50 rounded-xl p-4 mb-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Funzione</span>
            <span className="text-sm font-bold text-slate-900">{SCOPE_LABEL[invite.scope] ?? invite.scope}</span>
          </div>
          {invite.apartments.length > 0 && (
            <div>
              <span className="text-xs text-slate-500 font-medium">Appartamenti</span>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {invite.apartments.map((name) => (
                  <span key={name} className="text-xs bg-white border border-slate-200 rounded-full px-2.5 py-1 text-slate-700">{name}</span>
                ))}
              </div>
            </div>
          )}
          {invite.apartments.length === 0 && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Appartamenti</span>
              <span className="text-xs text-slate-400">Tutti</span>
            </div>
          )}
        </div>

        {isCompanyManager ? (
          <InviteAcceptCard token={token} />
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
            <p className="text-sm text-amber-800 font-medium mb-1">Accedi per accettare</p>
            <p className="text-xs text-amber-600">
              Devi effettuare il login come manager di un&apos;impresa per accettare questo invito.
            </p>
            <a
              href={`/login?redirect=/invito/${token}`}
              className="inline-block mt-3 px-6 py-2.5 bg-amber-600 text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-amber-700 transition-colors"
            >
              Vai al login
            </a>
          </div>
        )}
      </div>
    </main>
  );
}
