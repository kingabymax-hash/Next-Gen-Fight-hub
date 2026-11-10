"use client";

import { useActionState } from "react";
import { signIn, type LoginState } from "@/app/(admin)/admin/login/actions";
import { buttonClasses } from "@/components/ui/Button";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(signIn, {});
  return (
    <form action={action} className="space-y-5">
      <div>
        <label htmlFor="password" className="mb-2 block text-xs uppercase tracking-[0.18em] text-steel-300">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          autoFocus
          aria-invalid={!!state.error}
          aria-describedby={state.error ? "password-error" : undefined}
          className={`w-full border bg-transparent px-4 py-3 text-base text-paper focus:border-ember focus:outline-none ${
            state.error ? "border-ember" : "border-paper/20"
          }`}
        />
        {state.error ? (
          <p id="password-error" className="mt-1.5 text-xs text-ember">
            {state.error}
          </p>
        ) : null}
      </div>
      <button type="submit" disabled={pending} className={buttonClasses("primary", true)}>
        {pending ? "Checking..." : "Sign in"}
      </button>
    </form>
  );
}
