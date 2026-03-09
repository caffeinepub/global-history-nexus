import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGetEventsByYear, useGetRelatedEvents } from "@/hooks/useQueries";
import type { HistoricalEvent } from "@/hooks/useQueries";
import { CATEGORY_COLORS, formatYear } from "@/utils/categoryColors";
import {
  Calendar,
  ChevronRight,
  ExternalLink,
  MapPin,
  MessageSquare,
  User,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type React from "react";
import { useMemo } from "react";
import { CategoryBadge, RegionBadge } from "./CategoryBadge";
import { EventCardSkeleton } from "./LoadingSkeleton";

interface EventDetailModalProps {
  event: HistoricalEvent | null;
  onClose: () => void;
  onEventClick: (event: HistoricalEvent) => void;
  onAskAI: (event: HistoricalEvent) => void;
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className="space-y-3">
    <h3 className="font-display font-semibold text-sm uppercase tracking-widest text-primary/80">
      {title}
    </h3>
    {children}
    <div className="border-t border-border mt-4" />
  </div>
);

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  onClose,
  onEventClick,
  onAskAI,
}) => {
  const year = event ? Number(event.year) : null;
  const categoryColor = event
    ? CATEGORY_COLORS[event.category.toLowerCase()] || "oklch(0.55 0.03 255)"
    : "";

  const { data: sameYearEvents, isLoading: sameYearLoading } =
    useGetEventsByYear(year);
  const { data: relatedEvents, isLoading: relatedLoading } =
    useGetRelatedEvents(event?.id || null);

  const otherYearEvents =
    sameYearEvents?.filter((e) => e.id !== event?.id).slice(0, 4) || [];

  // Client-side related events fallback: backend getRelatedEvents may return []
  // In that case, cross-reference relatedEventIds against sameYearEvents
  const clientRelatedEvents = useMemo(() => {
    if (relatedEvents && relatedEvents.length > 0) return relatedEvents;
    if (!event || !sameYearEvents) return [];
    return sameYearEvents.filter(
      (e) => event.relatedEventIds.includes(e.id) && e.id !== event.id,
    );
  }, [relatedEvents, event, sameYearEvents]);

  return (
    <AnimatePresence>
      {event && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40"
            style={{
              background: "oklch(0 0 0 / 0.7)",
              backdropFilter: "blur(4px)",
            }}
          />

          {/* Modal */}
          <motion.div
            data-ocid="event_detail.modal"
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full z-50 w-full max-w-2xl"
            style={{
              background: "oklch(0.1 0.015 260)",
              borderLeft: "1px solid oklch(0.22 0.025 255)",
              boxShadow: "-20px 0 60px oklch(0 0 0 / 0.5)",
            }}
          >
            <ScrollArea className="h-full">
              <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    {/* Category glow accent */}
                    <div
                      className="w-1 h-8 rounded-full"
                      style={{ background: categoryColor }}
                    />

                    <div className="flex items-center gap-2 flex-wrap">
                      <CategoryBadge category={event.category} size="md" />
                      <RegionBadge region={event.region} />
                    </div>

                    <h1 className="font-display text-2xl font-bold text-foreground leading-tight">
                      {event.title}
                    </h1>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="font-mono">
                          {event.exactDate ? `${event.exactDate}, ` : ""}
                          {formatYear(Number(event.year))}
                        </span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        {event.locationName}
                      </span>
                    </div>

                    <div className="text-xs font-mono text-muted-foreground">
                      {event.civilization}
                    </div>
                  </div>

                  <Button
                    data-ocid="event_detail.close_button"
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="text-muted-foreground hover:text-foreground flex-shrink-0 mt-1"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Divider with glow */}
                <div
                  className="h-px"
                  style={{
                    background: `linear-gradient(to right, ${categoryColor.replace(")", " / 0.6)")}, transparent)`,
                  }}
                />

                {/* Overview */}
                <Section title="Overview">
                  <p className="text-sm text-foreground/90 leading-relaxed">
                    {event.fullDescription}
                  </p>
                </Section>

                {/* Background & Causes */}
                {event.causes.length > 0 && (
                  <Section title="Background & Causes">
                    <ul className="space-y-2">
                      {event.causes.map((cause) => (
                        <li
                          key={cause}
                          className="flex items-start gap-2 text-sm text-foreground/80"
                        >
                          <ChevronRight
                            className="w-3.5 h-3.5 mt-0.5 flex-shrink-0"
                            style={{ color: categoryColor }}
                          />
                          {cause}
                        </li>
                      ))}
                    </ul>
                  </Section>
                )}

                {/* Consequences */}
                {event.consequences.length > 0 && (
                  <Section title="Consequences">
                    <ul className="space-y-2">
                      {event.consequences.map((consequence) => (
                        <li
                          key={consequence}
                          className="flex items-start gap-2 text-sm text-foreground/80"
                        >
                          <ChevronRight
                            className="w-3.5 h-3.5 mt-0.5 flex-shrink-0"
                            style={{ color: categoryColor }}
                          />
                          {consequence}
                        </li>
                      ))}
                    </ul>
                  </Section>
                )}

                {/* Key Figures */}
                {event.keyFigures.length > 0 && (
                  <Section title="Key Figures">
                    <div className="grid grid-cols-2 gap-2">
                      {event.keyFigures.map((figure) => (
                        <div
                          key={figure.name}
                          className="p-2.5 rounded-md space-y-0.5"
                          style={{
                            background: "oklch(0.14 0.02 255)",
                            border: "1px solid oklch(0.22 0.025 255)",
                          }}
                        >
                          <div className="flex items-center gap-1.5">
                            <User className="w-3 h-3 text-primary/60" />
                            <span className="text-xs font-display font-semibold text-foreground">
                              {figure.name}
                            </span>
                          </div>
                          <p className="text-[10px] text-muted-foreground pl-4.5">
                            {figure.role}
                          </p>
                        </div>
                      ))}
                    </div>
                  </Section>
                )}

                {/* Global Context */}
                <Section title="Global Context">
                  <p className="text-xs text-muted-foreground mb-3">
                    Other events happening in {formatYear(Number(event.year))}:
                  </p>
                  {sameYearLoading ? (
                    <div className="space-y-2">
                      {[1, 2].map((i) => (
                        <EventCardSkeleton key={i} />
                      ))}
                    </div>
                  ) : otherYearEvents.length > 0 ? (
                    <div className="space-y-2">
                      {otherYearEvents.map((e) => (
                        <button
                          type="button"
                          key={e.id}
                          onClick={() => onEventClick(e)}
                          className="w-full text-left p-2.5 rounded-md hover:bg-muted/50 transition-colors group"
                          style={{
                            background: "oklch(0.13 0.02 255)",
                            border: "1px solid oklch(0.2 0.02 255)",
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <CategoryBadge category={e.category} />
                            <span className="text-xs font-display text-foreground/80 group-hover:text-foreground line-clamp-1">
                              {e.title}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">
                      No other events recorded for this year.
                    </p>
                  )}
                </Section>

                {/* Related Events */}
                <Section title="Related Events">
                  {relatedLoading && sameYearLoading ? (
                    <div className="space-y-2">
                      {[1, 2].map((i) => (
                        <EventCardSkeleton key={i} />
                      ))}
                    </div>
                  ) : clientRelatedEvents.length > 0 ? (
                    <div className="space-y-2">
                      {clientRelatedEvents.slice(0, 4).map((e, i) => (
                        <button
                          type="button"
                          data-ocid={`event_detail.related_event.item.${i + 1}`}
                          key={e.id}
                          onClick={() => onEventClick(e)}
                          className="w-full text-left p-2.5 rounded-md hover:bg-muted/50 transition-colors group"
                          style={{
                            background: "oklch(0.13 0.02 255)",
                            border: "1px solid oklch(0.2 0.02 255)",
                          }}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-1 flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <CategoryBadge category={e.category} />
                                <span className="font-mono text-[10px] text-muted-foreground">
                                  {formatYear(Number(e.year))}
                                </span>
                              </div>
                              <p className="text-xs font-display text-foreground/80 group-hover:text-foreground line-clamp-1">
                                {e.title}
                              </p>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50 mt-1 flex-shrink-0" />
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">
                      No related events found.
                    </p>
                  )}
                </Section>

                {/* Sources */}
                {event.sources.length > 0 && (
                  <Section title="Sources">
                    <ul className="space-y-1.5">
                      {event.sources.map((source) => (
                        <li
                          key={source}
                          className="flex items-start gap-2 text-xs text-muted-foreground"
                        >
                          <ExternalLink className="w-3 h-3 mt-0.5 flex-shrink-0 text-primary/50" />
                          {source}
                        </li>
                      ))}
                    </ul>
                  </Section>
                )}

                {/* Ask AI Button */}
                <Button
                  data-ocid="event_detail.ask_ai.button"
                  onClick={() => onAskAI(event)}
                  className="w-full font-display font-semibold gap-2"
                  style={{
                    background: "oklch(0.16 0.04 255)",
                    border: "1px solid oklch(0.28 0.06 255)",
                    color: "oklch(0.8 0.12 250)",
                  }}
                >
                  <MessageSquare className="w-4 h-4" />
                  Ask AI Historian about this event
                </Button>

                <div className="h-8" />
              </div>
            </ScrollArea>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default EventDetailModal;
