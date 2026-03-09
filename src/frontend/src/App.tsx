import { AIHistorianPanel } from "@/components/shared/AIHistorianPanel";
import { EventDetailModal } from "@/components/shared/EventDetailModal";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CivilizationsView } from "@/components/views/CivilizationsView";
import { MapView } from "@/components/views/MapView";
import { NetworkView } from "@/components/views/NetworkView";
import { SearchView } from "@/components/views/SearchView";
import { TimelineView } from "@/components/views/TimelineView";
import type { HistoricalEvent } from "@/hooks/useQueries";
import { useSeedEvents } from "@/hooks/useSeedEvents";
import {
  Clock,
  Globe,
  Map as MapIcon,
  Scroll,
  Search,
  Share2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type React from "react";
import { useCallback, useState } from "react";

type ViewId = "timeline" | "map" | "civilizations" | "network" | "search";

interface NavItem {
  id: ViewId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { id: "timeline", label: "Timeline", icon: Clock },
  { id: "map", label: "Map", icon: MapIcon },
  { id: "civilizations", label: "Civilizations", icon: Globe },
  { id: "network", label: "Network", icon: Share2 },
  { id: "search", label: "Search", icon: Search },
];

function App() {
  useSeedEvents();
  const [activeView, setActiveView] = useState<ViewId>("timeline");
  const [selectedEvent, setSelectedEvent] = useState<HistoricalEvent | null>(
    null,
  );
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [aiContextEvent, setAiContextEvent] = useState<HistoricalEvent | null>(
    null,
  );

  const handleEventClick = useCallback((event: HistoricalEvent) => {
    setSelectedEvent(event);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedEvent(null);
  }, []);

  const handleAskAI = useCallback((event: HistoricalEvent) => {
    setAiContextEvent(event);
    setAiPanelOpen(true);
    setSelectedEvent(null);
  }, []);

  const handleRelatedEventClick = useCallback((event: HistoricalEvent) => {
    setSelectedEvent(event);
  }, []);

  const currentYear = new Date().getFullYear();

  return (
    <TooltipProvider>
      <div
        className="flex flex-col h-screen overflow-hidden"
        style={{ background: "oklch(0.08 0.01 260)" }}
      >
        {/* Header */}
        <header
          className="flex-shrink-0 flex items-center justify-between px-4 md:px-6 h-14 border-b border-border relative z-30"
          style={{
            background: "oklch(0.09 0.015 260 / 0.95)",
            backdropFilter: "blur(12px)",
          }}
        >
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.72 0.18 45), oklch(0.65 0.2 35))",
                boxShadow: "0 0 12px oklch(0.72 0.18 45 / 0.3)",
              }}
            >
              <Scroll className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <h1 className="font-display font-bold text-sm tracking-wide text-foreground glow-gold">
                Global History Nexus
              </h1>
              <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">
                Explore Human History
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-0.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  type="button"
                  key={item.id}
                  data-ocid={`nav.${item.id}.link`}
                  onClick={() => setActiveView(item.id)}
                  className="relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-display font-medium transition-colors"
                  style={{
                    color: isActive
                      ? "oklch(0.72 0.18 45)"
                      : "oklch(0.55 0.02 255)",
                    background: isActive
                      ? "oklch(0.72 0.18 45 / 0.1)"
                      : "transparent",
                  }}
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="hidden md:inline">{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute inset-0 rounded-lg -z-10"
                      style={{ background: "oklch(0.72 0.18 45 / 0.08)" }}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right slot */}
          <div className="w-32 sm:w-40 flex justify-end">
            <div className="text-[10px] font-mono text-muted-foreground/40 hidden sm:block text-right">
              Est. 3000 BCE
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute inset-0"
            >
              {activeView === "timeline" && (
                <TimelineView onEventClick={handleEventClick} />
              )}
              {activeView === "map" && (
                <MapView onEventClick={handleEventClick} />
              )}
              {activeView === "civilizations" && (
                <CivilizationsView onEventClick={handleEventClick} />
              )}
              {activeView === "network" && (
                <NetworkView onEventClick={handleEventClick} />
              )}
              {activeView === "search" && (
                <SearchView onEventClick={handleEventClick} />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer
          className="flex-shrink-0 flex items-center justify-center h-8 border-t border-border"
          style={{ background: "oklch(0.09 0.015 260)" }}
        >
          <p className="text-[10px] font-mono text-muted-foreground/40">
            © {currentYear}. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground/60 hover:text-muted-foreground transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </footer>

        {/* Event Detail Modal */}
        <EventDetailModal
          event={selectedEvent}
          onClose={handleCloseModal}
          onEventClick={handleRelatedEventClick}
          onAskAI={handleAskAI}
        />

        {/* AI Historian Panel */}
        <AIHistorianPanel
          isOpen={aiPanelOpen}
          onToggle={() => setAiPanelOpen((v) => !v)}
          contextEvent={aiContextEvent}
        />

        <Toaster />
      </div>
    </TooltipProvider>
  );
}

export default App;
