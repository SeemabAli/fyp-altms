/* eslint-disable @typescript-eslint/no-explicit-any */
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function DashboardRedirect() {
  const session = await getServerSession(authOptions);
  if (!session) return redirect("/auth/signin");
  const role = (session.user as any).role;
  if (role === "admin") return redirect("/admin/dashboard");
  if (role === "coordinator") return redirect("/dashboard/coordinator");
  if (role === "faculty") return redirect("/faculty/dashboard");
  if (role === "student") return redirect("/student/timetable");
  
  return redirect("/unauthorized");
}
