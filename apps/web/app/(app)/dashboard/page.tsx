import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";

export default async function DashboardRouter() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const route: Record<string, string> = {
    PUPIL: "/pupil",
    TEACHER: "/teacher",
    PARENT: "/parent",
    ADMIN: "/admin",
  };
  redirect(route[user.role] ?? "/login");
}