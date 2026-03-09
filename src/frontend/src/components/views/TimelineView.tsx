import EventCard from "@/components/shared/EventCard";
import { EventCardSkeletonList } from "@/components/shared/LoadingSkeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useGetAllYears, useGetEventsByYear } from "@/hooks/useQueries";
import type { HistoricalEvent } from "@/hooks/useQueries";
import { formatYear, getEraLabel } from "@/utils/categoryColors";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type ZoomLevel = "century" | "decade" | "year";

interface TimelineViewProps {
  onEventClick: (event: HistoricalEvent) => void;
}

const ERA_ZONES = [
  {
    start: -3000,
    end: 500,
    label: "Ancient",
    // Warm violet-rose — civilizational dawn
    gradient:
      "linear-gradient(180deg, oklch(0.18 0.06 320) 0%, oklch(0.11 0.04 310) 60%, oklch(0.09 0.03 310) 100%)",
    edgeGlow: "oklch(0.55 0.12 320)",
    textColor: "oklch(0.78 0.12 320)",
    labelBg: "oklch(0.18 0.07 320 / 0.7)",
  },
  {
    start: 500,
    end: 1500,
    label: "Medieval",
    // Deep teal-cyan — age of cathedrals and crusades
    gradient:
      "linear-gradient(180deg, oklch(0.16 0.06 195) 0%, oklch(0.10 0.04 190) 60%, oklch(0.08 0.03 190) 100%)",
    edgeGlow: "oklch(0.5 0.1 195)",
    textColor: "oklch(0.72 0.1 195)",
    labelBg: "oklch(0.16 0.07 195 / 0.7)",
  },
  {
    start: 1500,
    end: 1800,
    label: "Early Modern",
    // Cool indigo — age of exploration and reason
    gradient:
      "linear-gradient(180deg, oklch(0.17 0.06 255) 0%, oklch(0.11 0.04 252) 60%, oklch(0.08 0.03 252) 100%)",
    edgeGlow: "oklch(0.52 0.12 255)",
    textColor: "oklch(0.72 0.11 255)",
    labelBg: "oklch(0.17 0.07 255 / 0.7)",
  },
  {
    start: 1800,
    end: 2025,
    label: "Modern",
    // Slate-blue — industrial and digital age
    gradient:
      "linear-gradient(180deg, oklch(0.17 0.04 235) 0%, oklch(0.11 0.025 232) 60%, oklch(0.09 0.02 232) 100%)",
    edgeGlow: "oklch(0.48 0.08 235)",
    textColor: "oklch(0.68 0.07 235)",
    labelBg: "oklch(0.17 0.05 235 / 0.7)",
  },
];

function getZoomTickInterval(zoom: ZoomLevel): number {
  switch (zoom) {
    case "century":
      return 100;
    case "decade":
      return 10;
    case "year":
      return 1;
  }
}

function getTickSpacing(zoom: ZoomLevel): number {
  switch (zoom) {
    case "century":
      return 120;
    case "decade":
      return 80;
    case "year":
      return 48;
  }
}

export const TimelineView: React.FC<TimelineViewProps> = ({ onEventClick }) => {
  const [selectedYear, setSelectedYear] = useState<number>(1453);
  const [zoom, setZoom] = useState<ZoomLevel>("century");
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, scrollLeft: 0 });

  const { data: allYears } = useGetAllYears();
  const { data: yearEvents, isLoading: eventsLoading } =
    useGetEventsByYear(selectedYear);

  const YEAR_START = -3000;
  const YEAR_END = 2025;
  const tickInterval = getZoomTickInterval(zoom);
  const tickSpacing = getTickSpacing(zoom);

  const ticks = useMemo(() => {
    const result: number[] = [];
    const start = Math.ceil(YEAR_START / tickInterval) * tickInterval;
    for (let y = start; y <= YEAR_END; y += tickInterval) {
      result.push(y);
    }
    return result;
  }, [tickInterval]);

  const yearHasEvent = useMemo(() => {
    if (!allYears) return new Set<number>();
    return new Set(allYears.map((y) => Number(y)));
  }, [allYears]);

  const yearToX = useCallback(
    (year: number): number => {
      return ((year - YEAR_START) / tickInterval) * tickSpacing;
    },
    [tickInterval, tickSpacing],
  );

  const totalWidth =
    ((YEAR_END - YEAR_START) / tickInterval) * tickSpacing + 200;

  // Scroll to selected year
  // biome-ignore lint/correctness/useExhaustiveDependencies: zoom triggers re-scroll
  useEffect(() => {
    if (containerRef.current) {
      const x = yearToX(selectedYear);
      const containerWidth = containerRef.current.clientWidth;
      containerRef.current.scrollLeft = x - containerWidth / 2;
    }
  }, [selectedYear, yearToX, zoom]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    isDragging.current = true;
    dragStart.current = {
      x: e.clientX,
      scrollLeft: containerRef.current.scrollLeft,
    };
    containerRef.current.style.cursor = "grabbing";
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.current || !containerRef.current) return;
    const dx = e.clientX - dragStart.current.x;
    containerRef.current.scrollLeft = dragStart.current.scrollLeft - dx;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    if (containerRef.current) containerRef.current.style.cursor = "grab";
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: stable handlers for window events
  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const handleTickClick = (year: number) => {
    if (!isDragging.current) setSelectedYear(year);
  };

  const navigateYear = (direction: -1 | 1) => {
    const step = tickInterval;
    setSelectedYear((prev) =>
      Math.max(YEAR_START, Math.min(YEAR_END, prev + direction * step)),
    );
  };

  const eraLabel = getEraLabel(selectedYear);

  return (
    <div className="flex flex-col h-full">
      {/* Controls */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigateYear(-1)}
            className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="text-center">
            <div className="font-display font-bold text-xl text-foreground glow-gold">
              {formatYear(selectedYear)}
            </div>
            <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
              {eraLabel}
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigateYear(1)}
            className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <ToggleGroup
          type="single"
          value={zoom}
          onValueChange={(v) => v && setZoom(v as ZoomLevel)}
          className="gap-1"
        >
          <ToggleGroupItem
            data-ocid="timeline.zoom_century.toggle"
            value="century"
            className="text-xs font-mono h-7 px-3 data-[state=on]:bg-primary/20 data-[state=on]:text-primary"
          >
            100yr
          </ToggleGroupItem>
          <ToggleGroupItem
            data-ocid="timeline.zoom_decade.toggle"
            value="decade"
            className="text-xs font-mono h-7 px-3 data-[state=on]:bg-primary/20 data-[state=on]:text-primary"
          >
            10yr
          </ToggleGroupItem>
          <ToggleGroupItem
            data-ocid="timeline.zoom_year.toggle"
            value="year"
            className="text-xs font-mono h-7 px-3 data-[state=on]:bg-primary/20 data-[state=on]:text-primary"
          >
            1yr
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Timeline */}
      <div
        data-ocid="timeline.canvas_target"
        ref={containerRef}
        className="relative overflow-x-auto overflow-y-hidden select-none"
        style={{ height: "160px", cursor: "grab" }}
        onMouseDown={handleMouseDown}
      >
        <div
          style={{ width: totalWidth, height: "100%", position: "relative" }}
        >
          {/* Era zones */}
          {ERA_ZONES.map((era) => {
            const x = yearToX(era.start);
            const w = yearToX(era.end) - x;
            return (
              <div
                key={era.label}
                style={{
                  position: "absolute",
                  left: x,
                  top: 0,
                  width: w,
                  height: "100%",
                  background: era.gradient,
                }}
              >
                {/* Right-edge boundary glow */}
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: 0,
                    bottom: 0,
                    width: "2px",
                    background: `linear-gradient(180deg, transparent, ${era.edgeGlow} 40%, ${era.edgeGlow} 60%, transparent)`,
                    opacity: 0.5,
                    pointerEvents: "none",
                  }}
                />
                {/* Era label with backdrop */}
                <div className="absolute top-2 left-3 flex items-center gap-1.5 pointer-events-none">
                  {/* Color pip */}
                  <div
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: era.edgeGlow,
                      boxShadow: `0 0 6px ${era.edgeGlow}`,
                      flexShrink: 0,
                    }}
                  />
                  <span
                    className="text-[9px] font-display font-bold uppercase tracking-[0.18em]"
                    style={{
                      color: era.textColor,
                      textShadow: `0 0 12px ${era.edgeGlow}`,
                    }}
                  >
                    {era.label}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Tick marks and labels */}
          {ticks.map((year) => {
            const x = yearToX(year);
            const hasEvent = yearHasEvent.has(year);
            const isSelected = year === selectedYear;
            const isCentury = year % 100 === 0;
            const isMajor = isCentury || (zoom === "decade" && year % 50 === 0);

            return (
              <div
                key={year}
                style={{
                  position: "absolute",
                  left: x,
                  top: 0,
                  height: "100%",
                }}
                onClick={() => handleTickClick(year)}
                onKeyDown={(e) => e.key === "Enter" && handleTickClick(year)}
              >
                {/* Tick line */}
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    bottom: 48,
                    width: isSelected ? 2 : 1,
                    height: isMajor ? 28 : 14,
                    background: isSelected
                      ? "oklch(0.72 0.18 45)"
                      : hasEvent
                        ? "oklch(0.45 0.06 45 / 0.8)"
                        : "oklch(0.28 0.025 255 / 0.5)",
                  }}
                />

                {/* Event dot */}
                {hasEvent && (
                  <div
                    className={isSelected ? "pulse-glow" : ""}
                    style={{
                      position: "absolute",
                      left: -4,
                      bottom: 42,
                      width: isSelected ? 9 : 7,
                      height: isSelected ? 9 : 7,
                      borderRadius: "50%",
                      background: isSelected
                        ? "oklch(0.82 0.2 50)"
                        : "oklch(0.62 0.16 50)",
                      boxShadow: isSelected
                        ? "0 0 10px oklch(0.72 0.18 45 / 0.9), 0 0 20px oklch(0.72 0.18 45 / 0.4)"
                        : "0 0 6px oklch(0.62 0.16 50 / 0.5)",
                      cursor: "pointer",
                      border: isSelected
                        ? "1.5px solid oklch(0.92 0.12 55)"
                        : "none",
                    }}
                  />
                )}

                {/* Year label */}
                {isMajor && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: 8,
                      left: "50%",
                      transform: "translateX(-50%)",
                      fontSize: "9px",
                      fontFamily: "Geist Mono, monospace",
                      color: isSelected
                        ? "oklch(0.72 0.18 45)"
                        : "oklch(0.45 0.02 255)",
                      whiteSpace: "nowrap",
                      cursor: "pointer",
                      fontWeight: isSelected ? "700" : "400",
                    }}
                  >
                    {year < 0 ? `${Math.abs(year)}B` : year}
                  </div>
                )}

                {/* Selected indicator line */}
                {isSelected && (
                  <>
                    <div
                      style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: 2,
                        background:
                          "linear-gradient(180deg, transparent, oklch(0.72 0.18 45 / 0.6) 25%, oklch(0.72 0.18 45 / 0.6) 75%, transparent)",
                      }}
                    />
                    {/* Horizontal glow spread */}
                    <div
                      style={{
                        position: "absolute",
                        left: -8,
                        top: 0,
                        bottom: 0,
                        width: 18,
                        background:
                          "radial-gradient(ellipse at center, oklch(0.72 0.18 45 / 0.08) 0%, transparent 70%)",
                        pointerEvents: "none",
                      }}
                    />
                  </>
                )}
              </div>
            );
          })}

          {/* Center line */}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 48,
              height: 1,
              background:
                "linear-gradient(90deg, transparent 0%, oklch(0.35 0.04 255) 5%, oklch(0.35 0.04 255) 95%, transparent 100%)",
            }}
          />
        </div>
      </div>

      {/* Year Panel */}
      <div className="flex-1 overflow-hidden border-t border-border">
        <AnimatePresence mode="wait">
          <motion.div
            data-ocid="year_panel.panel"
            key={selectedYear}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            <div className="flex items-center justify-between px-6 py-3 border-b border-border">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-primary/60" />
                <h2 className="font-display font-bold text-lg">
                  <span className="text-primary">
                    {formatYear(selectedYear)}
                  </span>
                  <span className="text-muted-foreground text-sm ml-2 font-normal">
                    — {eraLabel}
                  </span>
                </h2>
              </div>
              {yearEvents && (
                <span className="text-xs font-mono text-muted-foreground">
                  {yearEvents.length} event{yearEvents.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            <ScrollArea className="h-[calc(100%-52px)]">
              <div className="p-4 space-y-2">
                {eventsLoading ? (
                  <EventCardSkeletonList count={4} />
                ) : yearEvents && yearEvents.length > 0 ? (
                  yearEvents.map((event, i) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onClick={onEventClick}
                      index={i}
                      data-ocid={`year_panel.event.item.${i + 1}`}
                    />
                  ))
                ) : (
                  <div
                    className="text-center py-12 space-y-2"
                    data-ocid="year_panel.empty_state"
                  >
                    <div className="text-3xl opacity-20">📜</div>
                    <p className="text-sm text-muted-foreground">
                      No recorded events for {formatYear(selectedYear)}
                    </p>
                    <p className="text-xs text-muted-foreground/50">
                      Try scrolling the timeline to find a year with events
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TimelineView;
