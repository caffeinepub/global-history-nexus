import EventCard from "@/components/shared/EventCard";
import { EventCardSkeletonList } from "@/components/shared/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSearchEvents } from "@/hooks/useQueries";
import type { HistoricalEvent } from "@/hooks/useQueries";
import { CATEGORIES, CATEGORY_LABELS, REGIONS } from "@/utils/categoryColors";
import { Filter, Loader2, Search, X } from "lucide-react";
import { motion } from "motion/react";
import type React from "react";
import { useMemo, useState } from "react";

interface SearchViewProps {
  onEventClick: (event: HistoricalEvent) => void;
}

export const SearchView: React.FC<SearchViewProps> = ({ onEventClick }) => {
  const [searchInput, setSearchInput] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [activeRegion, setActiveRegion] = useState<string>("all");

  const {
    data: rawResults,
    isLoading,
    isFetching,
  } = useSearchEvents(submittedSearch);

  const filteredResults = useMemo(() => {
    if (!rawResults) return [];
    return rawResults.filter((event) => {
      const matchCat =
        activeCategory === "all" ||
        event.category.toLowerCase() === activeCategory;
      const matchRegion =
        activeRegion === "all" || event.region === activeRegion;
      return matchCat && matchRegion;
    });
  }, [rawResults, activeCategory, activeRegion]);

  const handleSearch = () => {
    if (searchInput.trim()) setSubmittedSearch(searchInput.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const clearSearch = () => {
    setSearchInput("");
    setSubmittedSearch("");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search Controls */}
      <div className="px-6 py-4 space-y-3 border-b border-border">
        {/* Search Input */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              data-ocid="search.search_input"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search events by keyword, person, place..."
              className="pl-10 pr-10 h-10 font-display"
              style={{
                background: "oklch(0.13 0.02 255)",
                border: "1px solid oklch(0.25 0.03 255)",
              }}
            />
            {searchInput && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <Button
            onClick={handleSearch}
            className="h-10 px-5 font-display font-semibold gap-2"
            disabled={!searchInput.trim()}
          >
            {isLoading || isFetching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            Search
          </Button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[11px] font-mono text-muted-foreground">
              Category:
            </span>
          </div>

          <div className="flex gap-1 flex-wrap">
            <button
              type="button"
              data-ocid="search.category.tab"
              onClick={() => setActiveCategory("all")}
              className="text-xs font-display px-2.5 py-1 rounded-md transition-colors"
              style={{
                background:
                  activeCategory === "all"
                    ? "oklch(0.72 0.18 45 / 0.2)"
                    : "oklch(0.14 0.02 255)",
                border:
                  activeCategory === "all"
                    ? "1px solid oklch(0.72 0.18 45 / 0.4)"
                    : "1px solid oklch(0.22 0.025 255)",
                color:
                  activeCategory === "all"
                    ? "oklch(0.72 0.18 45)"
                    : "oklch(0.6 0.02 255)",
              }}
            >
              All
            </button>
            {CATEGORIES.map((cat) => (
              <button
                type="button"
                data-ocid="search.category.tab"
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="text-xs font-display px-2.5 py-1 rounded-md transition-colors"
                style={{
                  background:
                    activeCategory === cat
                      ? "oklch(0.72 0.18 45 / 0.2)"
                      : "oklch(0.14 0.02 255)",
                  border:
                    activeCategory === cat
                      ? "1px solid oklch(0.72 0.18 45 / 0.4)"
                      : "1px solid oklch(0.22 0.025 255)",
                  color:
                    activeCategory === cat
                      ? "oklch(0.72 0.18 45)"
                      : "oklch(0.6 0.02 255)",
                }}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <span className="text-[11px] font-mono text-muted-foreground">
              Region:
            </span>
            <Select value={activeRegion} onValueChange={setActiveRegion}>
              <SelectTrigger
                data-ocid="search.region.select"
                className="h-7 text-xs w-36 font-display"
                style={{
                  background: "oklch(0.14 0.02 255)",
                  border: "1px solid oklch(0.22 0.025 255)",
                }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                {REGIONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Results */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {/* Status bar */}
          {submittedSearch && !isLoading && (
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-mono text-muted-foreground">
                {filteredResults.length} result
                {filteredResults.length !== 1 ? "s" : ""} for{" "}
                <span className="text-foreground">"{submittedSearch}"</span>
                {(activeCategory !== "all" || activeRegion !== "all") && (
                  <span className="text-muted-foreground/60"> (filtered)</span>
                )}
              </p>
            </div>
          )}

          {isLoading || isFetching ? (
            <EventCardSkeletonList count={5} />
          ) : submittedSearch && filteredResults.length === 0 ? (
            <motion.div
              data-ocid="search.result.empty_state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 space-y-3"
            >
              <div
                className="w-16 h-16 mx-auto rounded-full flex items-center justify-center"
                style={{
                  background: "oklch(0.14 0.02 255)",
                  border: "1px solid oklch(0.22 0.025 255)",
                }}
              >
                <Search className="w-6 h-6 text-muted-foreground/30" />
              </div>
              <p className="text-sm text-muted-foreground">
                No events found for "{submittedSearch}"
              </p>
              <p className="text-xs text-muted-foreground/50">
                Try different keywords or remove filters
              </p>
            </motion.div>
          ) : submittedSearch && filteredResults.length > 0 ? (
            <div className="space-y-2">
              {filteredResults.map((event, i) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onClick={onEventClick}
                  index={i}
                  data-ocid={`search.result.item.${i + 1}`}
                />
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 space-y-4"
            >
              <div className="text-4xl opacity-10 font-serif-display">∞</div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-display">
                  Search across all of recorded history
                </p>
                <p className="text-xs text-muted-foreground/50 max-w-xs mx-auto">
                  Find events by keyword, civilization, person, place, or topic
                </p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center max-w-sm mx-auto mt-4">
                {[
                  "1453",
                  "Constantinople",
                  "Gutenberg",
                  "Roman Empire",
                  "Silk Road",
                  "Renaissance",
                ].map((suggestion) => (
                  <button
                    type="button"
                    key={suggestion}
                    onClick={() => {
                      setSearchInput(suggestion);
                      setSubmittedSearch(suggestion);
                    }}
                    className="text-xs font-mono px-2.5 py-1 rounded-md transition-colors hover:bg-muted/50"
                    style={{
                      background: "oklch(0.14 0.02 255)",
                      border: "1px solid oklch(0.22 0.025 255)",
                      color: "oklch(0.55 0.02 255)",
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default SearchView;
