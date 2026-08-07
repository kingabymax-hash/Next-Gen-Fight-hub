"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  timetable,
  slotRange,
  slotDescription,
  type ClassSlot,
} from "@/lib/site/timetable";
import { coachById } from "@/lib/site/coaches";
import { CloseIcon } from "@/components/ui/icons";
import { buttonClasses } from "@/components/ui/Button";

type Selected = { dayLabel: string; slot: ClassSlot } | null;

function DisciplineTag({ slot }: { slot: ClassSlot }) {
  return (
    <span className="inline-flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-steel-400">
      {slot.discipline}
      {slot.note ? <span className="text-steel-500">· {slot.note}</span> : null}
    </span>
  );
}

/**
 * The weekly grid, but every class is a button. Clicking one opens a card with the
 * coach who takes it, what the class involves, and the in-person £10 trial note.
 * The one bit of client state on the Timetable page.
 */
export function TimetableExplorer() {
  const [selected, setSelected] = useState<Selected>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => setSelected(null), []);

  // Esc to close, and lock body scroll while the card is open.
  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [selected, close]);

  const coach = selected?.slot.coachId ? coachById(selected.slot.coachId) : undefined;

  return (
    <>
      {/* Desktop: 7-column grid. Mobile: stacked per day. */}
      <div className="grid grid-cols-1 gap-px bg-paper/10 md:grid-cols-2 lg:grid-cols-7">
        {timetable.map((day) => (
          <div key={day.key} className="bg-ink p-5">
            <h2 className="mb-5 font-display text-xl uppercase tracking-tight text-paper">
              {day.label}
            </h2>
            <ul className="space-y-3">
              {day.slots.map((slot, i) => {
                const slotCoach = slot.coachId ? coachById(slot.coachId) : undefined;
                return (
                  <li key={i}>
                    <button
                      type="button"
                      onClick={() => setSelected({ dayLabel: day.label, slot })}
                      className="group w-full border-l border-paper/15 pl-4 text-left transition-colors hover:border-paper focus:border-paper focus:outline-none"
                    >
                      <span className="block font-display text-lg leading-none text-paper">
                        {slotRange(slot)}
                      </span>
                      <span className="mt-1.5 block text-sm text-steel-200 group-hover:text-paper">
                        {slot.name}
                      </span>
                      <span className="mt-1 block">
                        <DisciplineTag slot={slot} />
                      </span>
                      <span className="mt-1.5 block text-[0.7rem] uppercase tracking-[0.15em] text-steel-500 group-hover:text-steel-300">
                        {slotCoach ? slotCoach.name : "Open mat"}
                        <span aria-hidden="true"> +</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <p className="mt-6 text-xs uppercase tracking-[0.15em] text-steel-500">
        Tap any class to see who takes it and what to expect.
      </p>

      {/* Class card */}
      {selected ? (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/80 p-4 backdrop-blur-sm sm:items-center"
          onClick={close}
          role="presentation"
        >
          <div
            className="relative flex max-h-[90vh] w-full max-w-md flex-col overflow-y-auto border border-paper/20 bg-ink-soft"
            role="dialog"
            aria-modal="true"
            aria-labelledby="class-card-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              ref={closeRef}
              type="button"
              onClick={close}
              aria-label="Close"
              className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center bg-ink/70 text-paper backdrop-blur transition-colors hover:bg-ink"
            >
              <CloseIcon />
            </button>

            {coach && coach.photo ? (
              <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-ink">
                <Image
                  src={coach.photo}
                  alt={`${coach.name}, coach at Next Gen Fight Hub`}
                  fill
                  sizes="(min-width: 640px) 28rem, 100vw"
                  className="object-cover object-[center_30%]"
                />
              </div>
            ) : null}

            <div className="flex flex-col gap-4 p-6">
              <div>
                <p className="kicker mb-2">
                  {selected.dayLabel} · {slotRange(selected.slot)}
                </p>
                <h3 id="class-card-title" className="font-display text-2xl uppercase tracking-tight text-paper">
                  {selected.slot.name}
                </h3>
                <p className="mt-2">
                  <DisciplineTag slot={selected.slot} />
                </p>
              </div>

              <p className="text-sm leading-relaxed text-steel-200">
                {slotDescription(selected.slot)}
              </p>

              {coach ? (
                <div className="border-t border-paper/10 pt-4">
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-steel-500">
                    Your coach
                  </p>
                  <p className="mt-1 text-base text-paper">{coach.name}</p>
                  <p className="mt-0.5 text-xs text-steel-400">{coach.disciplines.join(" · ")}</p>
                </div>
              ) : null}

              <div className="border border-paper/15 bg-ink/40 p-4">
                {coach ? (
                  <p className="text-sm text-steel-100">
                    First time? You can try this class for <span className="text-paper">£10</span>,
                    paid on the day at the gym. No need to book online.
                  </p>
                ) : (
                  <p className="text-sm text-steel-100">
                    Open gym is included with membership. Day passes are{" "}
                    <span className="text-paper">£10</span>, weekends 10am to 4pm, paid at
                    the gym.
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/memberships" className={buttonClasses("primary", true)}>
                  See memberships
                </Link>
                {coach ? (
                  <Link href="/coaches" className={buttonClasses("outline", true)}>
                    Meet the coaches
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
