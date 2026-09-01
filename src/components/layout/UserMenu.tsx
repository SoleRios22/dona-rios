import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import UserMenuDropdown from "@/components/layout/UserMenuDropdown";

export default async function UserMenu() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
    isAdmin = profile?.role === "admin";
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-semibold text-forest transition hover:border-avocado"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" />
        </svg>
        Ingresar
      </Link>
    );
  }

  const fullName = user.user_metadata?.full_name ?? user.email ?? "Tu cuenta";
  const initials = String(fullName)
    .split(" ")
    .map((p: string) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return <UserMenuDropdown initials={initials} fullName={fullName} isAdmin={isAdmin} />;
}
