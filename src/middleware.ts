import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ROLE_ALLOWED_PREFIXES: Record<string, string[]> = {
  MANAGER:     ["/dashboard/manager", "/dashboard/history"],
  CLEANER:     ["/dashboard/cleaner", "/dashboard/history"],
  MAINTENANCE: ["/dashboard/maintenance", "/dashboard/history"],
  SUPERVISOR:  ["/dashboard/supervisor"],
  OWNER:       ["/dashboard/owner"],
};

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // ── Superadmin: auth gestita inline dalle pagine stesse (nessun redirect) ──
  if (path.startsWith("/superadmin")) return NextResponse.next();

  // ── Dashboard routes ───────────────────────────────────────────────────────
  if (!path.startsWith("/dashboard")) return NextResponse.next();

  const role = request.cookies.get("role")?.value;
  if (!role) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const allowed = ROLE_ALLOWED_PREFIXES[role] ?? [];
  const isAllowed = allowed.some(prefix => path.startsWith(prefix));

  if (!isAllowed) {
    const home = allowed[0] ?? "/login";
    return NextResponse.redirect(new URL(home, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
