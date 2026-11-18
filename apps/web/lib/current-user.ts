import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: session.user.role,
  };
}

const roleHome: Record<Role, string> = {
  PUPIL: "/pupil",
  TEACHER: "/teacher",
  PARENT: "/parent",
  ADMIN: "/admin",
};

export async function requireRole(role: Role) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== role) redirect(roleHome[user.role]);
  return user;
}
