/**
 * The weekly class timetable, as data (never a baked image). Matches the current
 * silver-on-black flyer exactly. Update here when classes change; the Timetable page
 * and the Contact page's opening hours both derive from this, so they can't disagree.
 *
 * Times are 24h "HH:MM". `discipline` drives the small tag shown on each class.
 */

export type Discipline = "Muay Thai" | "Boxing" | "MMA" | "K1" | "Open Gym" | "S&C";

export type ClassSlot = {
  start: string; // "HH:MM"
  end: string; // "HH:MM"
  name: string;
  discipline: Discipline;
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
      { start: "17:00", end: "18:00", name: "Juniors Muay Thai", discipline: "Muay Thai" },
      { start: "18:00", end: "19:00", name: "Cadets Muay Thai", discipline: "Muay Thai" },
      { start: "19:00", end: "20:00", name: "Adult Muay Thai", discipline: "Muay Thai" },
      { start: "20:00", end: "21:00", name: "Adult Boxing", discipline: "Boxing", note: "TRB" },
    ],
  },
  {
    key: "tue",
    label: "Tuesday",
    short: "Tue",
    slots: [
      { start: "17:00", end: "18:00", name: "Juniors Muay Thai", discipline: "Muay Thai" },
      { start: "18:00", end: "19:00", name: "Cadets Muay Thai", discipline: "Muay Thai" },
      { start: "19:00", end: "20:00", name: "Adult Advanced Muay Thai", discipline: "Muay Thai" },
      { start: "20:00", end: "21:00", name: "Adult Beginner Muay Thai", discipline: "Muay Thai", note: "beginners welcome" },
    ],
  },
  {
    key: "wed",
    label: "Wednesday",
    short: "Wed",
    slots: [
      { start: "18:00", end: "19:00", name: "MMA", discipline: "MMA", note: "all levels" },
      { start: "19:30", end: "20:30", name: "Adult Boxing", discipline: "Boxing", note: "TRB" },
    ],
  },
  {
    key: "thu",
    label: "Thursday",
    short: "Thu",
    slots: [
      { start: "17:00", end: "18:00", name: "Juniors Muay Thai", discipline: "Muay Thai" },
      { start: "18:00", end: "19:00", name: "Cadets Muay Thai", discipline: "Muay Thai" },
      { start: "19:00", end: "20:00", name: "Adult Advanced Muay Thai", discipline: "Muay Thai" },
      { start: "20:00", end: "21:00", name: "Adult Beginner Muay Thai", discipline: "Muay Thai", note: "beginners welcome" },
    ],
  },
  {
    key: "fri",
    label: "Friday",
    short: "Fri",
    slots: [
      { start: "17:00", end: "19:30", name: "Open Gym", discipline: "Open Gym" },
      { start: "19:30", end: "21:00", name: "Adult Boxing", discipline: "Boxing", note: "TRB" },
    ],
  },
  {
    key: "sat",
    label: "Saturday",
    short: "Sat",
    slots: [
      { start: "10:00", end: "11:00", name: "Strength & Conditioning", discipline: "S&C" },
      { start: "12:00", end: "13:00", name: "Adult Boxing", discipline: "Boxing", note: "TRB" },
    ],
  },
  {
    key: "sun",
    label: "Sunday",
    short: "Sun",
    slots: [
      { start: "10:00", end: "11:30", name: "Adult Muay Thai", discipline: "Muay Thai", note: "all levels welcome" },
      { start: "11:30", end: "17:00", name: "Open Gym", discipline: "Open Gym" },
    ],
  },
];

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

/** Earliest open to latest close per day, for the Contact page opening hours. */
export function openingHours(): { day: string; range: string }[] {
  return timetable.map((d) => {
    if (d.slots.length === 0) return { day: d.label, range: "Closed" };
    const first = d.slots[0]!;
    const last = d.slots[d.slots.length - 1]!;
    return { day: d.label, range: `${toDisplayTime(first.start)} - ${toDisplayTime(last.end)}` };
  });
}
