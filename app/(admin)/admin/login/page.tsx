import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Image from "next/image";
import { LoginForm } from "@/components/admin/LoginForm";
import { NotConfigured } from "@/components/admin/NotConfigured";
import { getAdminEnv } from "@/lib/admin/env";
import { hasSession } from "@/lib/admin/session";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage() {
  if (!getAdminEnv()) return <NotConfigured />;
  if (await hasSession()) redirect("/admin");

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4 py-16">
      <Image src="/images/logo.jpg" alt="Next Gen Fight Hub" width={96} height={96} priority className="h-16 w-16 object-contain" />
      <p className="kicker mb-3 mt-10">Members area</p>
      <h1 className="mb-8 text-5xl leading-[0.95]">Sign in</h1>
      <LoginForm />
    </div>
  );
}
