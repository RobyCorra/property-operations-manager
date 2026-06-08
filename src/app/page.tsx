import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const cookieStore = await cookies();

  const superToken = cookieStore.get("superadmin_token")?.value;
  const expected = (process.env.SUPERADMIN_SECRET ?? "").trim();
  if (expected && superToken === expected) redirect("/superadmin");

  const role = cookieStore.get("role")?.value;
  if (role === "MANAGER")     redirect("/dashboard/manager");
  if (role === "CLEANER")     redirect("/dashboard/cleaner");
  if (role === "MAINTENANCE") redirect("/dashboard/maintenance");
  if (role === "SUPERVISOR")  redirect("/dashboard/supervisor");
  if (role === "OWNER")       redirect("/dashboard/owner");

  redirect("/login");
}
