import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    // Server-side admin check - this runs before the page renders
    await requireAdmin();
  } catch (error) {
    // Redirect non-admin users to the home page
    redirect("/");
  }

  return <>{children}</>;
}

