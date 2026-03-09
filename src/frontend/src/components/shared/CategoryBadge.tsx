import { CATEGORY_COLORS, CATEGORY_LABELS } from "@/utils/categoryColors";
import type React from "react";

interface CategoryBadgeProps {
  category: string;
  size?: "sm" | "md";
  className?: string;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  category,
  size = "sm",
  className = "",
}) => {
  const color =
    CATEGORY_COLORS[category.toLowerCase()] || "oklch(0.55 0.03 255)";
  const label = CATEGORY_LABELS[category.toLowerCase()] || category;

  const sizeClasses =
    size === "sm" ? "text-[9px] px-1.5 py-0.5" : "text-[11px] px-2.5 py-1";

  // Build bg and border with higher chroma for vivid feel
  const bg = color.replace("oklch(", "oklch(").replace(")", " / 0.15)");
  const border = color.replace("oklch(", "oklch(").replace(")", " / 0.45)");

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-sm font-display font-bold uppercase tracking-widest ${sizeClasses} ${className}`}
      style={{
        color,
        backgroundColor: bg,
        border: `1px solid ${border}`,
        // Faint inner glow for depth
        boxShadow: `inset 0 0 0 0 transparent, 0 0 6px ${color.replace(")", " / 0.12)")}`,
        letterSpacing: "0.12em",
      }}
    >
      {label}
    </span>
  );
};

interface RegionBadgeProps {
  region: string;
  className?: string;
}

export const RegionBadge: React.FC<RegionBadgeProps> = ({
  region,
  className = "",
}) => {
  return (
    <span
      className={`inline-flex items-center rounded-sm text-[9px] px-1.5 py-0.5 font-mono uppercase tracking-widest ${className}`}
      style={{
        color: "oklch(0.5 0.025 255)",
        background: "oklch(0.18 0.02 258 / 0.6)",
        border: "1px solid oklch(0.28 0.025 258 / 0.5)",
        letterSpacing: "0.1em",
      }}
    >
      {region}
    </span>
  );
};
