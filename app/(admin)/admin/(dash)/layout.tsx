import { AdminNav } from "@/components/admin/AdminNav";
import { NotConfigured } from "@/components/admin/NotConfigured";
import { Logo } from "@/components/site/Logo";
import { getAdminEnv } from "@/lib/admin/env";
import { homeFor, requireSession } from "@/lib/admin/session";
import { signOut } from "@/app/(admin)/admin/login/actions";

/** Signed-in admin shell. Every loader re-checks the session too (lib/admin/members.ts). */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  if (!getAdminEnv()) return <NotConfigured />;
  const role = await requireSession();

  return (
    <>
      <header className="sticky top-0 z-30 border-b print:hidden border-paper/10 bg-ink/95 backdrop-blur">
        <div className="mx-auto flex max-w-screen-2xl flex-wrap items-center justify-between gap-x-8 gap-y-3 px-4 py-3 sm:px-8">
          <div className="flex items-center gap-4">
            <Logo href={homeFor(role)} className="[&_span]:hidden sm:[&_span]:inline" />
            <span className="kicker">{role === "owner" ? "Members" : "Front desk"}</span>
          </div>
          <div className="flex items-center gap-6">
            <AdminNav role={role} />
            <form action={signOut}>
              <button type="submit" className="text-xs uppercase tracking-[0.2em] text-steel-400 transition-colors hover:text-paper">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-screen-2xl px-4 pb-24 pt-8 sm:px-8 sm:pt-12 print:p-0">{children}</main>
    </>
  );
}
