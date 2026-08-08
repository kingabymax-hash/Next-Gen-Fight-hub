/**
 * The weekly class timetable, as data (never a baked image). Matches the current
 * silver-on-black flyer exactly. Update here when classes change; the Timetable page
 * and the Contact page's opening hours both derive from this, so they can't disagree.
 *
 * Times are 24h "HH:MM". `discipline` drives the small tag shown on each class.
 * `coachId` links a slot to a coach in lib/site/coaches.ts (open-gym slots have none),
 * and the Timetable page uses it to show who takes each class. Boxing is run by the
 * Top Rope Boxing team rather than one named coach, so those slots carry `coachTeam`
 * instead; a slot has one or the other, never both.
 */

export type Discipline = "Muay Thai" | "Boxing" | "MMA" | "K1" | "Open Gym" | "S&C";

export type ClassSlot = {
  start: string; // "HH:MM"
  end: string; // "HH:MM"
  name: string;
  discipline: Discipline;
  coachId?: string; // matches a coach id; omitted for unstaffed open gym
  coachTeam?: string; // a partner team takes this class instead of one named coach
  note?: string; // e.g. "TRB", "all levels", "beginners welcome"
};

export type Day = {
  key: string;
  label: string;
  short: string;
  slots: ClassSlot[];
};

export const timetable: Day[] = [
  {
    key: "mon",
    label: "Monday",
    short: "Mon",
    slots: [
      { start: "17:00", end: "18:00", name: "Juniors Muay Thai", discipline: "Muay Thai", coachId: "jamie" },
      { start: "18:00", end: "19:00", name: "Cadets Muay Thai", discipline: "Muay Thai", coachId: "jamie" },
      { start: "19:00", end: "20:00", name: "Mixed Ability Fundamentals", discipline: "Muay Thai", coachId: "lpf", note: "all levels" },
      { start: "20:00", end: "21:00", name: "Adult Boxing", discipline: "Boxing", coachTeam: "Top Rope Boxing", note: "TRB" },
    ],
  },
  {
    key: "tue",
    label: "Tuesday",
    short: "Tue",
    slots: [
      { start: "17:00", end: "18:00", name: "Juniors Muay Thai", discipline: "Muay Thai", coachId: "jamie" },
      { start: "18:00", end: "19:00", name: "Cadets Muay Thai", discipline: "Muay Thai", coachId: "jamie" },
      { start: "19:00", end: "20:00", name: "Adult Advanced Muay Thai", discipline: "Muay Thai", coachId: "hayden" },
      { start: "20:00", end: "21:00", name: "Adult Beginner Muay Thai", discipline: "Muay Thai", coachId: "hayden", note: "beginners welcome" },
    ],
  },
  {
    key: "wed",
    label: "Wednesday",
    short: "Wed",
    slots: [
      { start: "18:00", end: "19:00", name: "MMA Grappling", discipline: "MMA", coachId: "jacob", note: "all levels" },
      { start: "19:30", end: "20:30", name: "Adult Boxing", discipline: "Boxing", coachTeam: "Top Rope Boxing", note: "TRB" },
    ],
  },
  {
    key: "thu",
    label: "Thursday",
    short: "Thu",
    slots: [
      { start: "17:00", end: "18:00", name: "Juniors Muay Thai", discipline: "Muay Thai", coachId: "jamie" },
      { start: "18:00", end: "19:00", name: "Cadets Muay Thai", discipline: "Muay Thai", coachId: "jamie" },
      { start: "19:00", end: "20:00", name: "Adult Advanced Muay Thai", discipline: "Muay Thai", coachId: "hayden" },
      { start: "20:00", end: "21:00", name: "Adult Beginner Muay Thai", discipline: "Muay Thai", coachId: "hayden", note: "beginners welcome" },
    ],
  },
  {
    key: "fri",
    label: "Friday",
    short: "Fri",
    slots: [
      { start: "19:30", end: "21:00", name: "Adult Boxing", discipline: "Boxing", coachTeam: "Top Rope Boxing", note: "TRB" },
    ],
  },
  {
    key: "sat",
    label: "Saturday",
    short: "Sat",
    slots: [
      { start: "10:00", end: "16:00", name: "Open Gym", discipline: "Open Gym" },
      { start: "10:00", end: "11:00", name: "Strength & Conditioning", discipline: "S&C", coachId: "evan" },
      { start: "12:00", end: "13:00", name: "Adult Boxing", discipline: "Boxing", coachTeam: "Top Rope Boxing", note: "TRB" },
    ],
  },
  {
    key: "sun",
    label: "Sunday",
    short: "Sun",
    slots: [
      { start: "10:00", end: "16:00", name: "Open Gym", discipline: "Open Gym" },
      { start: "10:00", end: "11:30", name: "Adult Muay Thai", discipline: "Muay Thai", coachId: "lpf", note: "all levels welcome" },
    ],
  },
];

/**
 * Short description per class, keyed by the slot `name`. Shown when a member clicks
 * into a class on the Timetable page. Truthful and discipline-based (no fabricated
 * detail); update alongside the flyer.
 */
export const classDescriptions: Record<string, string> = {
  "Juniors Muay Thai":
    "Muay Thai for our youngest group. Coordination, discipline and confidence built through technique and games, always supervised.",
  "Cadets Muay Thai":
    "Muay Thai for older juniors and teens. Real technique, pad work and controlled drilling to lay down the fundamentals.",
  "Adult Muay Thai":
    "All-levels adult Muay Thai. Technique, pads and conditioning every session. Beginners are welcome.",
  "Adult Advanced Muay Thai":
    "For experienced students. Sharper combinations, clinch work and controlled sparring at a higher pace.",
  "Adult Beginner Muay Thai":
    "The starting point. Stance, guard and your first combinations in a friendly, no-pressure class. No experience needed.",
  "Adult Boxing":
    "Boxing with Top Rope Boxing. Footwork, combinations and conditioning, from your first jab through to sparring.",
  "Mixed Ability Fundamentals":
    "Striking fundamentals with Liam, open to every level. Footwork, timing and combinations drilled properly, whether it is your first session or your hundredth.",
  "MMA Grappling":
    "Grappling for MMA with Jacob. Takedowns, control and ground work for all levels, no experience needed.",
  MMA: "Mixed martial arts for all levels. Striking, takedowns and ground work brought together.",
  "Strength & Conditioning":
    "Build the engine behind your fight game. Power, endurance and mobility to back up your skills.",
  "Open Gym":
    "Open mat and bag time. Come in and train your own way, work the bags or drill with partners. No coach-led session.",
};

/** The description for a slot, falling back to a generic line by discipline. */
export function slotDescription(slot: ClassSlot): string {
  return (
    classDescriptions[slot.name] ??
    `A ${slot.discipline} session at Next Gen Fight Hub. All levels welcome.`
  );
}

/** 24h "HH:MM" to a display label like "5:00pm". */
export function toDisplayTime(hhmm: string): string {
  const [hStr, mStr] = hhmm.split(":");
  const h = Number(hStr);
  const m = Number(mStr);
  const period = h >= 12 ? "pm" : "am";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${h12}${period}` : `${h12}:${mStr}${period}`;
}

/** Display range like "5pm - 6pm". */
export function slotRange(slot: ClassSlot): string {
  return `${toDisplayTime(slot.start)} - ${toDisplayTime(slot.end)}`;
}

/**
 * Earliest open to latest close per day, for the Contact page opening hours.
 * Compares every slot rather than the first and last, because overlapping slots
 * (open gym running across a class) mean array order is not time order.
 */
export function openingHours(): { day: string; range: string }[] {
  return timetable.map((d) => {
    if (d.slots.length === 0) return { day: d.label, range: "Closed" };
    const open = d.slots.reduce((a, s) => (s.start < a ? s.start : a), d.slots[0]!.start);
    const close = d.slots.reduce((a, s) => (s.end > a ? s.end : a), d.slots[0]!.end);
    return { day: d.label, range: `${toDisplayTime(open)} - ${toDisplayTime(close)}` };
  });
}
