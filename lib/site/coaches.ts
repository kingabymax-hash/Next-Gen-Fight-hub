/**
 * The coaching team. Bios are short, truthful and discipline-based placeholders
 * (Instagram is not machine-readable, and we never fabricate records/titles for real
 * people). Hayden supplies one real line + a photo per coach to replace these.
 *
 * `photo` is a path under /public/images when supplied; when null the card renders a
 * clean monogram placeholder.
 */

export type Coach = {
  name: string;
  disciplines: string[];
  bio: string;
  instagramHandle: string;
  instagramUrl: string;
  photo: string | null;
  headCoach?: boolean;
  isTeam?: boolean; // a partner brand/team rather than one person
};

export const coaches: Coach[] = [
  {
    name: "Hayden",
    disciplines: ["Muay Thai", "Boxing", "K1", "MMA"],
    bio: "Head coach and founder. Fifteen years on the pads across Muay Thai, boxing, K1 and MMA, a competitive fighter, and the coach behind The Pad Guy Programme.",
    instagramHandle: "@thepadguy",
    instagramUrl: "https://www.instagram.com/thepadguy/",
    photo: "/images/coaches/hayden.jpg",
    headCoach: true,
  },
  {
    name: "LPF Striking",
    disciplines: ["K1", "Striking"],
    bio: "K1 and striking. Sharp, technical sessions built on footwork, timing and combinations.",
    instagramHandle: "@lpfstriking_",
    instagramUrl: "https://www.instagram.com/lpfstriking_/",
    photo: "/images/coaches/lpf.jpg",
    isTeam: true,
  },
  {
    name: "Jamie Biggs",
    disciplines: ["Muay Thai"],
    bio: "Muay Thai. Clean technique and ring craft, fundamentals through to fight prep.",
    instagramHandle: "@jamiebiggsmt",
    instagramUrl: "https://www.instagram.com/jamiebiggsmt/",
    photo: "/images/coaches/jamie.jpg",
  },
  {
    name: "Evan Jays",
    disciplines: ["Muay Thai"],
    bio: "Muay Thai. Technique and conditioning for every level, beginners welcome.",
    instagramHandle: "@evan_jays",
    instagramUrl: "https://www.instagram.com/evan_jays/",
    photo: "/images/coaches/evan.jpg",
  },
  {
    name: "Top Rope Boxing",
    disciplines: ["Boxing"],
    bio: "Boxing. Four proper boxing sessions a week, first jab to sparring.",
    instagramHandle: "@toprope.boxing",
    instagramUrl: "https://www.instagram.com/toprope.boxing/",
    photo: "/images/coaches/toprope.jpg",
    isTeam: true,
  },
  {
    name: "Jacob Gifford",
    disciplines: ["MMA"],
    bio: "MMA. Leads the Wednesday MMA class, all levels, striking through to ground work.",
    instagramHandle: "@jaccob_gifford",
    instagramUrl: "https://www.instagram.com/jaccob_gifford/",
    photo: "/images/coaches/jacob.jpg",
  },
];

/** Initials for the placeholder monogram when no photo is supplied. */
export function coachMonogram(name: string): string {
  const words = name.split(" ").filter(Boolean);
  if (words.length === 1) return words[0]!.slice(0, 2).toUpperCase();
  return (words[0]![0]! + words[words.length - 1]![0]!).toUpperCase();
}
