export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  const errorMessage =
    error === "required"
      ? "Email e password richiesti."
      : error === "invalid"
      ? "Credenziali non valide."
      : error === "locked"
      ? "Troppi tentativi falliti: account bloccato per 15 minuti. Riprova più tardi."
      : null;

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-6 font-sans">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm border border-gray-100">
        <h1 className="text-2xl font-semibold mb-2 text-gray-900 tracking-tight">Login</h1>
        <p className="text-sm text-gray-500 mb-8">Property Operations Manager</p>

        <form action="/api/auth/login" method="POST" className="space-y-5">
          {errorMessage && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-2 rounded-lg text-sm font-medium">
              {errorMessage}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              required
              name="email"
              type="email"
              placeholder="manager@propertyops.com"
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              required
              name="password"
              type="password"
              placeholder="••••••••"
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-full bg-black text-white py-2.5 font-medium shadow-sm hover:bg-gray-800 transition-all focus:outline-none focus:ring-2 focus:ring-gray-900 mt-2"
          >
            Accedi
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Non hai un account?{" "}
            <a href="/register" className="font-medium text-gray-900 hover:underline">
              Registrati
            </a>
          </p>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-50">
          <p className="text-xs text-center text-gray-400">© 2026 Property Operations Manager</p>
        </div>
      </div>
    </main>
  );
}
