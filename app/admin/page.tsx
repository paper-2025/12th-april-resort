// ❗ SERVER COMPONENT — DO NOT ADD "use client"
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminDashboard from "./AdminDashboard";

export default async function AdminPage() {
  // Await cookies() to get the cookie store
  const cookieStore = await cookies();
  const auth = cookieStore.get("admin_auth");

  // If cookie missing → redirect to login
  if (!auth || !auth.value) {
    redirect("/admin/login");
  }

  // If logged in → show UI
  return <AdminDashboard />;
}
