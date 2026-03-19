export interface Testimonial {
  name: string;
  handle: string;
  text: string;
  rating: number;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Priya K.",
    handle: "@priyasolves",
    text: "The anti-cheat system is legitimately impressive. No more worrying about opponents googling answers. This is actual skill testing.",
    rating: 5,
  },
  {
    name: "Marcus T.",
    handle: "@mtcode",
    text: "I've used Codeforces, LeetCode, HackerRank. Nothing hits the same adrenaline as a live 1v1 with a 45-minute clock.",
    rating: 5,
  },
  {
    name: "Ananya R.",
    handle: "@ananya_dev",
    text: "Got a FAANG offer last month. CodeArena was my secret weapon — nothing else trains you to code fast under real pressure.",
    rating: 5,
  },
  {
    name: "Jake L.",
    handle: "@jakeleetcode",
    text: "The leaderboard is addictive. Went from Bronze to Gold in two weeks just by grinding ranked battles every evening.",
    rating: 5,
  },
];
