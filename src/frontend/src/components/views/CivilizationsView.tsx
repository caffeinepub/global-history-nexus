import { EventCardSkeletonList } from "@/components/shared/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGetYearByRegion } from "@/hooks/useQueries";
import type { HistoricalEvent } from "@/hooks/useQueries";
import { REGION_HEX, formatYear } from "@/utils/categoryColors";
import { Globe } from "lucide-react";
import { motion } from "motion/react";
import React, { useState } from "react";

interface CivilizationsViewProps {
  onEventClick: (event: HistoricalEvent) => void;
}

const REGION_ORDER = [
  "Europe",
  "Asia",
  "Middle East",
  "India",
  "Americas",
  "Africa",
];

export const CivilizationsView: React.FC<CivilizationsViewProps> = ({
  onEventClick,
}) => {
  const [yearInput, setYearInput] = useState("1453");
  const [activeYear, setActiveYear] = useState<number | null>(1453);

  const { data: regionData, isLoading } = useGetYearByRegion(activeYear);

  const handleSubmit = () => {
    const year = Number.parseInt(yearInput);
    if (!Number.isNaN(year)) setActiveYear(year);
  };

  // Build a map from the response
  const regionMap = React.useMemo(() => {
    if (!regionData) return new Map<string, HistoricalEvent[]>();
    return new Map(regionData.map(([region, events]) => [region, events]));
  }, [regionData]);

  return (
    <div className="flex flex-col h-full">
      {/* Header controls */}
      <div className="flex items-center gap-4 px-6 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Input
            data-ocid="civilizations.year.input"
            value={yearInput}
            onChange={(e) => setYearInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="Year (e.g. 1000)"
            className="font-mono text-sm h-9 w-36"
            style={{
              background: "oklch(0.13 0.02 255)",
              border: "1px solid oklch(0.25 0.03 255)",
            }}
          />
          <Button
            data-ocid="civilizations.submit.button"
            onClick={handleSubmit}
            size="sm"
            className="h-9 gap-1.5 font-display"
          >
            <Globe className="w-3.5 h-3.5" />
            Explore
          </Button>
        </div>

        {activeYear !== null && (
          <div className="text-sm text-muted-foreground font-mono">
            Parallel civilizations in{" "}
            <span className="text-primary font-semibold">
              {formatYear(activeYear)}
            </span>
          </div>
        )}
      </div>

      {/* Columns */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {REGION_ORDER.map((region) => (
                <div key={region} className="space-y-3">
                  <div className="shimmer h-6 rounded w-full" />
                  <EventCardSkeletonList count={2} />
                </div>
              ))}
            </div>
          ) : activeYear !== null ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 min-w-0">
              {REGION_ORDER.map((region, regionIndex) => {
                const events = regionMap.get(region) || [];
                const hex = REGION_HEX[region] || "#888";

                return (
                  <motion.div
                    data-ocid="civilizations.region.panel"
                    key={region}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: regionIndex * 0.05 }}
                    className="flex flex-col rounded-lg overflow-hidden"
                    style={{
                      background: "oklch(0.11 0.015 260)",
                      border: "1px solid oklch(0.2 0.025 255)",
                      borderTop: `2px solid ${hex}`,
                    }}
                  >
                    {/* Region Header */}
                    <div
                      className="px-3 py-2.5"
                      style={{ background: `${hex}18` }}
                    >
                      <h3
                        className="font-display font-bold text-sm tracking-wide"
                        style={{ color: hex }}
                      >
                        {region}
                      </h3>
                      <p className="text-[10px] font-mono text-muted-foreground">
                        {events.length} event{events.length !== 1 ? "s" : ""}
                      </p>
                    </div>

                    {/* Events */}
                    <div className="flex-1 p-2 space-y-2">
                      {events.length > 0 ? (
                        events.slice(0, 6).map((event, i) => (
                          <motion.div
                            data-ocid={`civilizations.event.item.${i + 1}`}
                            key={event.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{
                              delay: regionIndex * 0.05 + i * 0.04,
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => onEventClick(event)}
                              className="w-full text-left p-2 rounded-md hover:bg-muted/30 transition-colors group"
                              style={{
                                background: "oklch(0.13 0.02 255 / 0.5)",
                                border: "1px solid oklch(0.2 0.02 255)",
                              }}
                            >
                              <div className="text-[11px] font-display font-semibold text-foreground/85 group-hover:text-foreground line-clamp-2 leading-tight mb-1">
                                {event.title}
                              </div>
                              <div className="text-[9px] font-mono text-muted-foreground capitalize">
                                {event.category}
                              </div>
                            </button>
                          </motion.div>
                        ))
                      ) : (
                        <div
                          className="text-center py-6"
                          data-ocid="civilizations.region.empty_state"
                        >
                          <div className="text-xs text-muted-foreground/50 italic">
                            No records found
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <Globe className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="text-sm">
                Enter a year to explore parallel civilizations
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default CivilizationsView;
