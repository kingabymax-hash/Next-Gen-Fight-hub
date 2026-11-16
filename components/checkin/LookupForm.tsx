"use client";

import { useActionState } from "react";
import { lookUp, type LookupState } from "@/app/(checkin)/checkin/actions";
import { buttonClasses } from "@/components/ui/Button";

export function LookupForm() {
  const [state, action, pending] = useActionState<LookupState, FormData>(lookUp, {});
  return (
    <form action={action} className="space-y-5">
      <div>
        <label htmlFor="contact" className="mb-2 block text-sm text-steel-200">
          Mobile number or email you joined with
        </label>
        <input
          id="contact"
          name="contact"
          type="text"
          inputMode="tel"
          autoComplete="tel"
          defaultValue={state.value}
          required
          autoFocus
          placeholder="07..."
          aria-invalid={!!state.error}
          aria-describedby={state.error ? "contact-error" : "contact-hint"}
          className={`w-full rounded-md border bg-transparent px-4 py-4 text-lg text-paper placeholder:text-steel-500 focus:border-ember focus:outline-none ${
            state.error ? "border-ember" : "border-paper/20"
          }`}
        />
        {state.error ? (
          <p id="contact-error" className="mt-2 text-sm text-ember">
            {state.error}
          </p>
        ) : (
          <p id="contact-hint" className="mt-2 text-xs text-steel-400">
            Only needed once. This phone remembers you next time.
          </p>
        )}
      </div>
      <button type="submit" disabled={pending} className={buttonClasses("primary", true)}>
        {pending ? "Checking..." : "Check in"}
      </button>
    </form>
  );
}
