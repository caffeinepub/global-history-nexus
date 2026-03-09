import { CategoryBadge } from "@/components/shared/CategoryBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useGetEventsByYear } from "@/hooks/useQueries";
import type { HistoricalEvent } from "@/hooks/useQueries";
import {
  CATEGORY_HEX,
  CATEGORY_LABELS,
  formatYear,
} from "@/utils/categoryColors";
import { Search } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type React from "react";
import { useCallback, useState } from "react";

interface MapViewProps {
  onEventClick: (event: HistoricalEvent) => void;
}

// Equirectangular projection
function latLonToXY(lat: number, lon: number, width: number, height: number) {
  const x = ((lon + 180) / 360) * width;
  const y = ((90 - lat) / 180) * height;
  return { x, y };
}

// Unused but kept for reference

// Simplified continent shapes as SVG paths with proper geographic coverage
const CONTINENTS = [
  {
    name: "North America",
    d: "M 60,45 L 80,40 L 100,38 L 120,40 L 135,45 L 140,52 L 145,58 L 148,65 L 145,72 L 140,78 L 135,82 L 130,85 L 125,88 L 120,90 L 118,95 L 120,100 L 125,105 L 120,108 L 115,110 L 110,108 L 105,105 L 100,102 L 95,100 L 90,98 L 85,95 L 80,92 L 75,90 L 70,88 L 65,85 L 60,82 L 55,78 L 52,72 L 50,65 L 52,58 L 55,52 L 60,45 Z",
  },
  {
    name: "South America",
    d: "M 105,112 L 115,110 L 125,112 L 130,118 L 132,125 L 130,132 L 128,138 L 125,145 L 120,150 L 115,155 L 110,158 L 105,160 L 100,158 L 95,155 L 92,150 L 90,145 L 88,138 L 88,132 L 90,125 L 92,118 L 95,112 L 105,112 Z",
  },
  {
    name: "Europe",
    d: "M 230,40 L 245,38 L 258,40 L 268,44 L 275,48 L 278,54 L 275,58 L 270,62 L 265,65 L 260,68 L 255,70 L 250,68 L 245,65 L 240,62 L 238,58 L 235,55 L 232,52 L 230,48 L 230,40 Z",
  },
  {
    name: "Africa",
    d: "M 235,80 L 250,78 L 262,80 L 272,85 L 278,92 L 280,100 L 278,108 L 275,115 L 270,122 L 265,128 L 260,132 L 255,135 L 250,136 L 245,135 L 240,132 L 235,128 L 232,122 L 230,115 L 228,108 L 228,100 L 230,92 L 232,85 L 235,80 Z",
  },
  {
    name: "Asia",
    d: "M 290,35 L 310,32 L 330,30 L 350,28 L 375,30 L 395,33 L 410,38 L 420,44 L 418,52 L 415,58 L 410,64 L 405,70 L 400,76 L 395,80 L 388,84 L 380,88 L 370,90 L 360,88 L 350,85 L 340,82 L 330,80 L 320,78 L 312,75 L 305,70 L 300,65 L 295,60 L 292,54 L 290,48 L 290,35 Z",
  },
  {
    name: "Australia",
    d: "M 370,120 L 390,118 L 405,120 L 415,126 L 418,133 L 415,140 L 408,145 L 400,148 L 390,148 L 380,145 L 375,140 L 370,133 L 368,126 L 370,120 Z",
  },
];

export const MapView: React.FC<MapViewProps> = ({ onEventClick }) => {
  const [yearInput, setYearInput] = useState("1453");
  const [activeYear, setActiveYear] = useState<number | null>(1453);
  const [hoveredEvent, setHoveredEvent] = useState<HistoricalEvent | null>(
    null,
  );
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const { data: events, isLoading } = useGetEventsByYear(activeYear);

  const MAP_WIDTH = 520;
  const MAP_HEIGHT = 260;

  const handleSearch = () => {
    const year = Number.parseInt(yearInput);
    if (!Number.isNaN(year)) setActiveYear(year);
  };

  const getMarkerPos = useCallback((event: HistoricalEvent) => {
    return latLonToXY(event.latitude, event.longitude, MAP_WIDTH, MAP_HEIGHT);
  }, []);

  const categoryColors = Object.entries(CATEGORY_HEX);

  return (
    <div className="flex flex-col h-full p-6 gap-4">
      {/* Controls */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-xs">
          <Input
            data-ocid="map.year.input"
            value={yearInput}
            onChange={(e) => setYearInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Enter year (e.g. 1453)"
            className="font-mono text-sm h-9"
            style={{
              background: "oklch(0.13 0.02 255)",
              border: "1px solid oklch(0.25 0.03 255)",
            }}
          />
          <Button
            onClick={handleSearch}
            size="icon"
            className="h-9 w-9 flex-shrink-0"
          >
            <Search className="w-4 h-4" />
          </Button>
        </div>

        {activeYear !== null && (
          <div className="font-mono text-sm text-muted-foreground">
            Showing{" "}
            <span className="text-primary font-semibold">
              {formatYear(activeYear)}
            </span>
            {events &&
              ` — ${events.length} event${events.length !== 1 ? "s" : ""}`}
          </div>
        )}
      </div>

      {/* Map container */}
      <div className="flex-1 flex flex-col gap-4 min-h-0">
        <div
          data-ocid="map.canvas_target"
          className="relative rounded-xl overflow-hidden"
          style={{
            background: "oklch(0.1 0.03 225)",
            border: "1px solid oklch(0.22 0.025 255)",
            aspectRatio: `${MAP_WIDTH}/${MAP_HEIGHT}`,
            maxHeight: "420px",
          }}
        >
          <svg
            viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
            className="w-full h-full"
            style={{ display: "block" }}
            aria-label="World map showing historical events"
            role="img"
          >
            <title>World map showing historical events</title>
            {/* Ocean background */}
            <rect
              width={MAP_WIDTH}
              height={MAP_HEIGHT}
              fill="oklch(0.1 0.03 225)"
            />

            {/* Grid lines */}
            {[
              30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330, 360, 390, 420,
              450, 480,
            ].map((x) => (
              <line
                key={`v${x}`}
                x1={x}
                y1={0}
                x2={x}
                y2={MAP_HEIGHT}
                stroke="oklch(0.18 0.02 225)"
                strokeWidth="0.5"
              />
            ))}
            {[45, 90, 130, 175, 220].map((y) => (
              <line
                key={`h${y}`}
                x1={0}
                y1={y}
                x2={MAP_WIDTH}
                y2={y}
                stroke="oklch(0.18 0.02 225)"
                strokeWidth="0.5"
              />
            ))}

            {/* Equator */}
            <line
              x1={0}
              y1={MAP_HEIGHT / 2}
              x2={MAP_WIDTH}
              y2={MAP_HEIGHT / 2}
              stroke="oklch(0.28 0.03 225)"
              strokeWidth="0.8"
            />

            {/* Continents */}
            {CONTINENTS.map((c) => (
              <path
                key={c.name}
                d={c.d}
                fill="oklch(0.22 0.02 240)"
                stroke="oklch(0.3 0.025 240)"
                strokeWidth="0.8"
              />
            ))}

            {/* Event markers */}
            {isLoading
              ? null
              : events?.map((event) => {
                  const { x, y } = getMarkerPos(event);
                  const color =
                    CATEGORY_HEX[event.category.toLowerCase()] || "#888";
                  const isHovered = hoveredEvent?.id === event.id;

                  return (
                    <g key={event.id}>
                      {/* Glow ring for hovered */}
                      {isHovered && (
                        <circle
                          cx={x}
                          cy={y}
                          r={12}
                          fill="none"
                          stroke={color}
                          strokeWidth="1.5"
                          opacity={0.4}
                        />
                      )}
                      <circle
                        data-ocid="map.map_marker"
                        cx={x}
                        cy={y}
                        r={isHovered ? 7 : 5}
                        fill={color}
                        fillOpacity={isHovered ? 1 : 0.85}
                        stroke="oklch(0.08 0.01 260)"
                        strokeWidth={1}
                        style={{
                          cursor: "pointer",
                          transition: "r 0.15s, fill-opacity 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          setHoveredEvent(event);
                          const rect = (e.target as SVGElement)
                            .closest("svg")
                            ?.getBoundingClientRect();
                          if (rect) {
                            const svgX = x / MAP_WIDTH;
                            const svgY = y / MAP_HEIGHT;
                            setTooltipPos({
                              x: rect.left + svgX * rect.width,
                              y: rect.top + svgY * rect.height,
                            });
                          }
                        }}
                        onMouseLeave={() => setHoveredEvent(null)}
                        onClick={() => onEventClick(event)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && onEventClick(event)
                        }
                        role="button"
                        tabIndex={0}
                        aria-label={event.title}
                      />
                    </g>
                  );
                })}
          </svg>

          {/* Tooltip */}
          <AnimatePresence>
            {hoveredEvent && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="fixed z-50 pointer-events-none rounded-lg px-3 py-2 text-xs max-w-[200px]"
                style={{
                  left: tooltipPos.x + 12,
                  top: tooltipPos.y - 40,
                  background: "oklch(0.14 0.025 260)",
                  border: "1px solid oklch(0.28 0.04 255)",
                  boxShadow: "0 4px 20px oklch(0 0 0 / 0.4)",
                }}
              >
                <div className="font-display font-semibold text-foreground line-clamp-2 mb-1">
                  {hoveredEvent.title}
                </div>
                <CategoryBadge category={hoveredEvent.category} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading overlay */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50">
              <div className="text-sm text-muted-foreground font-mono">
                Loading events…
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div
          className="flex items-center flex-wrap gap-3 px-4 py-2.5 rounded-lg"
          style={{
            background: "oklch(0.12 0.02 255)",
            border: "1px solid oklch(0.2 0.025 255)",
          }}
        >
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mr-1">
            Categories:
          </span>
          {categoryColors.map(([category, color]) => (
            <div key={category} className="flex items-center gap-1.5">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: color }}
              />
              <span className="text-[10px] font-mono text-muted-foreground capitalize">
                {CATEGORY_LABELS[category] || category}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MapView;
