export type Status = "confirmed" | "provisional" | "placeholder" | "approval";

export const recoveryRooms = [
  { slug: "crisis", forWhen: "You feel unsafe, panicked or overwhelmed right now", stage: 1, name: "Crisis", blurb: "For the hardest moments. Steady yourself first.", color: "bg-primary" },
  { slug: "clarity", forWhen: "You're trying to understand what happened", stage: 2, name: "Clarity", blurb: "Make sense of what happened, gently.", color: "bg-teal" },
  { slug: "safety", forWhen: "You need practical steps and steadier routines", stage: 3, name: "Safety & Stability", blurb: "Build steadier ground under your feet.", color: "bg-lavender" },
  { slug: "healing", forWhen: "You're ready to tend to sleep, grief and your body", stage: 4, name: "Healing", blurb: "Tend to sleep, grief, body and heart.", color: "bg-plum" },
  { slug: "rebuilding", forWhen: "You want confidence, skills and new habits", stage: 5, name: "Rebuilding", blurb: "Confidence, routines and new skills.", color: "bg-coral" },
  { slug: "future", forWhen: "You're imagining and planning what comes next", stage: 6, name: "Future", blurb: "Imagine and plan what comes next.", color: "bg-calm" },
] as const;

export const calmMedia = [
  { id: "breath", kind: "Breathing", title: "Breathing exercise (placeholder)", length: "5 min" },
  { id: "ground", kind: "Grounding", title: "Grounding audio (placeholder)", length: "7 min" },
  { id: "video", kind: "Video", title: "Calming nature video (placeholder)", length: "10 min" },
  { id: "audio", kind: "Guided audio", title: "Guided audio (placeholder)", length: "8 min" },
] as const;

export const libraryCategories = [
  { slug: "understanding-abuse", name: "Understanding Abuse", count: 3 },
  { slug: "trauma-and-the-body", name: "Trauma & the Body", count: 3 },
  { slug: "relationships", name: "Healthy Relationships", count: 3 },
  { slug: "self-care", name: "Self-Care Basics", count: 3 },
  { slug: "legal-basics", name: "Legal & Practical Basics", count: 3 },
  { slug: "for-supporters", name: "For Friends & Family", count: 3 },
] as const;

export type Resource = {
  id: string; category: string; title: string; type: string;
  formatNote: string; minutes: number; external: boolean; contentNote?: string | undefined;
};

export const resources: Resource[] = libraryCategories.flatMap((c) =>
  [1, 2, 3].map((n) => ({
    id: `${c.slug}-${n}`,
    category: c.slug,
    title: `${c.name} — sample resource ${n}`,
    type: n === 1 ? "Article" : n === 2 ? "Downloadable guide" : "External resource",
    formatNote: n === 1 ? "Text you read on screen" : n === 2 ? "PDF you can save to your device" : "Partner website",
    minutes: n === 1 ? 5 : n === 2 ? 10 : 8,
    external: n === 3,
    contentNote: c.slug === "understanding-abuse" || c.slug === "trauma-and-the-body" ? "Describes forms of abuse. Go at your own pace." : undefined,
  })),
);

export const notBrokenModules = [
  { slug: "module-1", title: "Module 1 (title TBC)", steps: 4 },
  { slug: "module-2", title: "Module 2 (title TBC)", steps: 4 },
  { slug: "module-3", title: "Module 3 (title TBC)", steps: 4 },
  { slug: "module-4", title: "Module 4 (title TBC)", steps: 4 },
] as const;

export const opportunityCategories = [
  "Education", "Scholarships", "Employment", "Training", "Mentorship",
  "Career Development", "Financial Opportunities", "Community Programs",
  "Entrepreneurship", "Personal Growth",
] as const;

export const opportunities = opportunityCategories.flatMap((cat, i) =>
  [1, 2].map((n) => ({
    id: `${cat.toLowerCase().replace(/[^a-z]+/g, "-")}-${n}`,
    category: cat,
    title: `Sample ${cat.toLowerCase()} opportunity ${n}`,
    org: "Partner organization (placeholder)",
    idx: i,
  })),
);

export const partners = [
  { name: "Partner A (placeholder)", focus: "Movement & yoga sessions" },
  { name: "Partner B (placeholder)", focus: "Breathwork" },
  { name: "Partner C (placeholder)", focus: "Expressive writing" },
  { name: "Partner D (placeholder)", focus: "Financial education" },
] as const;

export const needs = [
  { label: "I feel overwhelmed", to: "/calm-room" },
  { label: "I want to express myself", to: "/art-room" },
  { label: "I need to understand what's happening", to: "/library" },
  { label: "I want to work through something", to: "/recovery-rooms" },
  { label: "I'm thinking about what's next", to: "/opportunities" },
  { label: "I just want to look around", to: "/not-broken" },
] as const;
