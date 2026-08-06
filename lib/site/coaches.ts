/**
 * The coaching team. Bios are truthful and discipline-based: real records and titles
 * come from Hayden only, never from us. Coaches still on a placeholder line are marked
 * below; replace them as Hayden supplies the real copy.
 *
 * `bio` is an array of paragraphs, rendered one <p> per entry.
 *
 * `photo` is a path under /public/images when supplied; when null the card renders a
 * clean monogram placeholder.
 */

export type Coach = {
  id: string; // stable slug, referenced by the timetable slots
  name: string;
  disciplines: string[];
  bio: string[]; // one entry per paragraph
  instagramHandle: string;
  instagramUrl: string;
  photo: string | null;
  headCoach?: boolean;
  isTeam?: boolean; // a partner brand/team rather than one person
};

export const coaches: Coach[] = [
  {
    id: "hayden",
    name: "Hayden",
    disciplines: ["Muay Thai", "Boxing", "K1", "MMA"],
    bio: [
      "Hayden is a qualified sports coach with 13 years of coaching experience, all of it in Muay Thai, boxing and kickboxing, training some of the best fighters in the South East across boxing, Muay Thai, kickboxing and MMA stand-up striking.",
      "Coaching combat sports is not just his job, it is his life and passion.",
      "With a competitive record of 5 fights and 5 wins at novice and semi-pro level, Hayden is now looking to turn professional in Muay Thai this year.",
    ],
    instagramHandle: "@thepadguy",
    instagramUrl: "https://www.instagram.com/thepadguy/",
    photo: "/images/coaches/hayden.jpg",
    headCoach: true,
  },
  {
    id: "lpf",
    name: "Liam",
    disciplines: ["K1", "Striking"],
    bio: [
      "Liam is a 26 year old striking coach with 16 years in the sport, competing in K-1 and living and breathing kickboxing. His coaching style is heavily inspired by elite technicians such as Chingiz Allazov and Giorgio Petrosyan.",
      "Alongside his in-gym coaching, Liam runs a high level online coaching platform, helping fighters develop wherever they are based. He leads our Monday mixed ability fundamentals session, bringing modern coaching, real fight experience and passion to the mats.",
      "Liam is also available for private sessions: DM him directly or message us to book.",
    ],
    instagramHandle: "@lpfstriking_",
    instagramUrl: "https://www.instagram.com/lpfstriking_/",
    photo: "/images/coaches/lpf.jpg",
  },
  {
    id: "jamie",
    name: "Jamie Biggs",
    disciplines: ["Muay Thai"],
    // Placeholder line: awaiting real copy from Hayden.
    bio: ["Muay Thai. Clean technique and ring craft, fundamentals through to fight prep."],
    instagramHandle: "@jamiebiggsmt",
    instagramUrl: "https://www.instagram.com/jamiebiggsmt/",
    photo: "/images/coaches/jamie.jpg",
  },
  {
    id: "evan",
    name: "Evan Jays",
    disciplines: ["Muay Thai"],
    bio: [
      "Coach Evan Jays is a 25 year old Muay Thai fighter and coach with over 17 years of experience in the sport.",
      "A former UK number one and two-time Junior World Champion, he has competed across the world in countries such as America, Japan and Thailand.",
      "He now brings elite level knowledge, experience and a high standard of coaching to the team at Next Gen Fight Hub.",
    ],
    instagramHandle: "@evan_jays",
    instagramUrl: "https://www.instagram.com/evan_jays/",
    photo: "/images/coaches/evan.jpg",
  },
  {
    id: "toprope",
    name: "Top Rope Boxing",
    disciplines: ["Boxing"],
    // Placeholder line: awaiting real copy from Hayden.
    bio: ["Boxing. Four proper boxing sessions a week, first jab to sparring."],
    instagramHandle: "@toprope.boxing",
    instagramUrl: "https://www.instagram.com/toprope.boxing/",
    photo: "/images/coaches/toprope.jpg",
    isTeam: true,
  },
  {
    id: "jacob",
    name: "Jacob Gifford",
    disciplines: ["MMA", "Grappling"],
    bio: [
      "Jacob comes to us fighting out of GB Top Team and Sniper MMA, currently ranked number 3 in the UK amateur MMA scene. With 13 years of experience in the sport, he brings high level grappling, MMA IQ and competitive experience to Next Gen Fight Hub.",
      "He now joins us to lead our weekly MMA grappling session, levelling up our coaching team with elite knowledge from the MMA circuit.",
      "Jacob is also available for private sessions.",
    ],
    instagramHandle: "@jaccob_gifford",
    instagramUrl: "https://www.instagram.com/jaccob_gifford/",
    photo: "/images/coaches/jacob.jpg",
  },
];

/** Look up a coach by their stable id (used by the timetable). */
export function coachById(id: string): Coach | undefined {
  return coaches.find((c) => c.id === id);
}

/** Initials for the placeholder monogram when no photo is supplied. */
export function coachMonogram(name: string): string {
  const words = name.split(" ").filter(Boolean);
  if (words.length === 1) return words[0]!.slice(0, 2).toUpperCase();
  return (words[0]![0]! + words[words.length - 1]![0]!).toUpperCase();
}
