import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const cookieStore = await cookies();
  const role = cookieStore.get("role")?.value;

  if (role === "MANAGER") {
    redirect("/dashboard/manager");
  }

  redirect("/login");
}
