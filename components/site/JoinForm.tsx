"use client";

import { useState } from "react";
import Link from "next/link";
import { z } from "zod";
import { buttonClasses } from "@/components/ui/Button";
import {
  MAX_NAME_LENGTH,
  MAX_REFERENCE_LENGTH,
  normaliseUkPhone,
  packJoinDetails,
} from "@/lib/site/joinDetails";

/**
 * The details step before Stripe checkout. Nothing is posted to our server: on submit
 * the details are packed into the Payment Link's `client_reference_id` (see
 * lib/site/joinDetails.ts) and the buyer is sent to Stripe in the same tab, with their
 * email prefilled. Only a completed checkout keeps the details.
 */

const fieldClass =
  "w-full border border-paper/20 bg-transparent px-4 py-3 text-base text-paper placeholder:text-steel-500 focus:border-ember focus:outline-none sm:text-sm";
const labelClass = "mb-2 block text-xs uppercase tracking-[0.18em] text-steel-300";

type Field = "name" | "email" | "phone" | "memberName";
type Errors = Partial<Record<Field, string>>;

const nameField = (empty: string) =>
  z
    .string()
    .trim()
    .min(1, empty)
    .max(MAX_NAME_LENGTH, `Please keep this under ${MAX_NAME_LENGTH} characters.`);

export function JoinForm({
  paymentLink,
  youth,
}: {
  paymentLink: string;
  youth: boolean;
}) {
  const [errors, setErrors] = useState<Errors>({});
  const [leaving, setLeaving] = useState(false);

  const schema = z.object({
    name: nameField(youth ? "Please enter your name." : "Please enter your full name."),
    email: z.string().trim().email("Please enter a valid email address."),
    phone: z
      .string()
      .transform((v) => normaliseUkPhone(v))
      .refine((v): v is string => v !== null, "Please enter a UK phone number, like 07700 900123."),
    memberName: youth ? nameField("Please enter the member's name.") : z.string().optional(),
  });

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const parsed = schema.safeParse({
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      phone: String(form.get("phone") ?? ""),
      memberName: youth ? String(form.get("memberName") ?? "") : undefined,
    });

    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as Field;
        next[key] ??= issue.message;
      }
      setErrors(next);
      return;
    }

    const reference = packJoinDetails({
      name: parsed.data.name,
      phone: parsed.data.phone as string,
      memberName: youth ? parsed.data.memberName : undefined,
    });
    if (reference.length > MAX_REFERENCE_LENGTH) {
      // Only reachable with very long names in non-Latin scripts.
      setErrors({ name: "Please use a shorter version of the name." });
      return;
    }

    setErrors({});
    setLeaving(true);
    const url = new URL(paymentLink);
    url.searchParams.set("prefilled_email", parsed.data.email);
    url.searchParams.set("client_reference_id", reference);
    window.location.assign(url.toString());
  }

  const error = (field: Field) =>
    errors[field] ? (
      <p id={`${field}-error`} className="mt-1.5 text-xs text-ember">
        {errors[field]}
      </p>
    ) : null;

  const described = (field: Field) => (errors[field] ? `${field}-error` : undefined);

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      {youth ? (
        <div>
          <label htmlFor="memberName" className={labelClass}>
            Member&apos;s name
          </label>
          <input
            id="memberName"
            name="memberName"
            type="text"
            autoComplete="off"
            className={fieldClass}
            placeholder="Who is training with us"
            aria-invalid={!!errors.memberName}
            aria-describedby={described("memberName")}
          />
          {error("memberName")}
        </div>
      ) : null}

      <div>
        <label htmlFor="name" className={labelClass}>
          {youth ? "Parent or guardian's name" : "Full name"}
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          className={fieldClass}
          placeholder={youth ? "Your full name" : "First and last name"}
          aria-invalid={!!errors.name}
          aria-describedby={described("name")}
        />
        {error("name")}
      </div>

      <div>
        <label htmlFor="email" className={labelClass}>
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          className={fieldClass}
          placeholder="you@email.com"
          aria-invalid={!!errors.email}
          aria-describedby={described("email")}
        />
        {error("email")}
      </div>

      <div>
        <label htmlFor="phone" className={labelClass}>
          {youth ? "Parent or guardian's mobile" : "Mobile number"}
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          className={fieldClass}
          placeholder="07700 900123"
          aria-invalid={!!errors.phone}
          aria-describedby={described("phone")}
        />
        {error("phone")}
      </div>

      <button type="submit" disabled={leaving} className={buttonClasses("primary", true)}>
        {leaving ? "Opening secure checkout..." : "Continue to payment"}
      </button>

      <p className="text-xs leading-relaxed text-steel-400">
        Payment is taken securely by Stripe. We use these details to contact you about your
        membership. See our{" "}
        <Link href="/privacy" className="underline underline-offset-4 hover:text-paper">
          privacy notice
        </Link>
        .
      </p>
    </form>
  );
}
