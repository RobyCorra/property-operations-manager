import { redirect } from "next/navigation";
import { isSuperAdminAuthenticated } from "@/src/app/actions/superadmin";

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  // Login page bypassa il check
  return <>{children}</>;
}
