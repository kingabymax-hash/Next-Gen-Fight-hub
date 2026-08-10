"use client";

import { useActionState } from "react";
import { submitContact, type ContactState } from "@/app/contact/actions";
import { buttonClasses } from "@/components/ui/Button";
import { site } from "@/lib/site/config";

const initial: ContactState = { status: "idle" };

const fieldClass =
  "w-full border border-paper/20 bg-transparent px-4 py-3 text-sm text-paper placeholder:text-steel-500 focus:border-paper focus:outline-none";

export function ContactForm() {
  const [state, formAction, pending] = useActionState(submitContact, initial);

  if (state.status === "success") {
    return (
      <div className="border border-paper/20 p-8">
        <p className="font-display text-2xl uppercase text-paper">Message sent</p>
        <p className="mt-3 text-sm text-steel-200">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <div>
        <label htmlFor="name" className="mb-2 block text-xs uppercase tracking-[0.18em] text-steel-300">
          Name
        </label>
        <input id="name" name="name" type="text" autoComplete="name" className={fieldClass} placeholder="Your name" />
        {state.errors?.name ? <p className="mt-1.5 text-xs text-steel-300">{state.errors.name}</p> : null}
      </div>

      <div>
        <label htmlFor="email" className="mb-2 block text-xs uppercase tracking-[0.18em] text-steel-300">
          Email
        </label>
        <input id="email" name="email" type="email" autoComplete="email" className={fieldClass} placeholder="you@email.com" />
        {state.errors?.email ? <p className="mt-1.5 text-xs text-steel-300">{state.errors.email}</p> : null}
      </div>

      <div>
        <label htmlFor="message" className="mb-2 block text-xs uppercase tracking-[0.18em] text-steel-300">
          Message
        </label>
        <textarea id="message" name="message" rows={5} className={fieldClass} placeholder="What would you like to know?" />
        {state.errors?.message ? <p className="mt-1.5 text-xs text-steel-300">{state.errors.message}</p> : null}
      </div>

      {state.status === "error" && state.message ? (
        <p className="text-sm text-steel-100">
          {state.message}
          {/* Field errors are the user's to fix; only a send failure needs the fallback. */}
          {state.errors ? null : (
            <>
              {" "}
              <a href={site.whatsapp.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-paper">
                {site.whatsapp.display}
              </a>
            </>
          )}
        </p>
      ) : null}

      <button type="submit" disabled={pending} className={buttonClasses("primary")}>
        {pending ? "Sending..." : "Send message"}
      </button>
    </form>
  );
}
