import type { HistoricalEvent } from "@/hooks/useQueries";
import { CATEGORY_COLORS, formatYear } from "@/utils/categoryColors";
import { motion } from "motion/react";
import type React from "react";
import { CategoryBadge, RegionBadge } from "./CategoryBadge";

interface EventCardProps {
  event: HistoricalEvent;
  onClick: (event: HistoricalEvent) => void;
  index?: number;
  "data-ocid"?: string;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  onClick,
  index = 0,
  "data-ocid": dataOcid,
}) => {
  const year = Number(event.year);
  const rawColor =
    CATEGORY_COLORS[event.category.toLowerCase()] || "oklch(0.55 0.03 255)";

  return (
    <motion.div
      data-ocid={dataOcid}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      onClick={() => onClick(event)}
      className="group relative cursor-pointer rounded-lg overflow-hidden"
      style={{
        // True glass: translucent background over the page's dark surface
        background: "oklch(0.13 0.025 258 / 0.75)",
        backdropFilter: "blur(10px) saturate(150%)",
        WebkitBackdropFilter: "blur(10px) saturate(150%)",
        border: "1px solid oklch(0.28 0.03 258 / 0.45)",
        // Category accent: thick vivid left border
        borderLeft: `4px solid ${rawColor}`,
        boxShadow:
          "0 2px 12px oklch(0 0 0 / 0.3), inset 0 1px 0 oklch(1 0 0 / 0.04)",
      }}
      whileHover={{
        scale: 1.008,
        transition: { duration: 0.15 },
      }}
    >
      {/* Inner top highlight — glass depth cue */}
      <div
        className="absolute inset-x-0 top-0 h-px pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, oklch(1 0 0 / 0.08) 20%, oklch(1 0 0 / 0.06) 80%, transparent 100%)",
        }}
      />

      <div className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-display font-semibold text-foreground leading-snug group-hover:text-primary transition-colors duration-150 line-clamp-2">
            {event.title}
          </h4>
          <span className="font-mono text-[10px] text-muted-foreground whitespace-nowrap mt-0.5 tabular-nums flex-shrink-0">
            {formatYear(year)}
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <CategoryBadge category={event.category} />
          <RegionBadge region={event.region} />
        </div>

        <p
          className="text-[11px] leading-relaxed line-clamp-2"
          style={{ color: "oklch(0.65 0.018 258)" }}
        >
          {event.shortSummary}
        </p>
      </div>

      {/* Category-colored bottom edge glow on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none rounded-lg"
        style={{
          background: `radial-gradient(ellipse at 0% 100%, ${rawColor.replace(")", " / 0.1)")} 0%, transparent 60%)`,
          boxShadow: `inset 0 0 0 1px ${rawColor.replace(")", " / 0.12)")}`,
        }}
      />
    </motion.div>
  );
};

export default EventCard;
