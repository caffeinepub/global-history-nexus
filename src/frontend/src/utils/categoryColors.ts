export const CATEGORIES = [
  "political",
  "war",
  "science",
  "culture",
  "exploration",
  "economics",
  "religion",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const REGIONS = [
  "Europe",
  "Asia",
  "Middle East",
  "India",
  "Americas",
  "Africa",
  "Global",
] as const;

export type Region = (typeof REGIONS)[number];

// Raw oklch color strings (no wrapper) for use in inline styles and canvas
export const CATEGORY_COLORS: Record<string, string> = {
  political: "oklch(0.6 0.2 250)",
  war: "oklch(0.6 0.22 20)",
  science: "oklch(0.65 0.18 155)",
  culture: "oklch(0.72 0.18 75)",
  exploration: "oklch(0.68 0.2 45)",
  economics: "oklch(0.78 0.18 95)",
  religion: "oklch(0.65 0.2 310)",
};

// For canvas/SVG where CSS vars aren't available
export const CATEGORY_HEX: Record<string, string> = {
  political: "#4a7cdc",
  war: "#dc4a3e",
  science: "#4adc8a",
  culture: "#dcb84a",
  exploration: "#dc8a4a",
  economics: "#d4dc4a",
  religion: "#9a4adc",
};

export const CATEGORY_LABELS: Record<string, string> = {
  political: "Political",
  war: "War",
  science: "Science",
  culture: "Culture",
  exploration: "Exploration",
  economics: "Economics",
  religion: "Religion",
};

export const REGION_COLORS: Record<string, string> = {
  Europe: "oklch(0.65 0.18 255)",
  Asia: "oklch(0.68 0.18 35)",
  "Middle East": "oklch(0.7 0.18 55)",
  India: "oklch(0.72 0.2 65)",
  Americas: "oklch(0.68 0.18 155)",
  Africa: "oklch(0.7 0.2 80)",
  Global: "oklch(0.72 0.18 45)",
};

export const REGION_HEX: Record<string, string> = {
  Europe: "#5080d0",
  Asia: "#d08050",
  "Middle East": "#c8a040",
  India: "#c8a030",
  Americas: "#50b880",
  Africa: "#c88040",
  Global: "#d4b050",
};

export const ERA_LABELS: Record<string, string> = {
  ancient: "Ancient Era",
  medieval: "Medieval Era",
  "early-modern": "Early Modern Era",
  modern: "Modern Era",
};

export function getEra(year: number): string {
  if (year <= 500) return "ancient";
  if (year <= 1500) return "medieval";
  if (year <= 1800) return "early-modern";
  return "modern";
}

export function getEraLabel(year: number): string {
  return ERA_LABELS[getEra(year)] || "Modern Era";
}

export function formatYear(year: number): string {
  if (year < 0) return `${Math.abs(year)} BCE`;
  return `${year} CE`;
}

export function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category.toLowerCase()] || "oklch(0.55 0.03 255)";
}

export function getCategoryHex(category: string): string {
  return CATEGORY_HEX[category.toLowerCase()] || "#888888";
}
