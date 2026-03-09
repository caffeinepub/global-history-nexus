import type React from "react";

interface LoadingSkeletonProps {
  count?: number;
}

export const EventCardSkeleton: React.FC = () => (
  <div
    className="rounded-md p-3 space-y-2"
    style={{
      background: "oklch(0.12 0.02 255 / 0.8)",
      border: "1px solid oklch(0.22 0.025 255)",
      borderLeft: "3px solid oklch(0.22 0.025 255)",
    }}
  >
    <div className="flex justify-between gap-2">
      <div className="shimmer h-4 rounded w-3/4" />
      <div className="shimmer h-3 rounded w-12" />
    </div>
    <div className="flex gap-1.5">
      <div className="shimmer h-4 rounded-full w-16" />
      <div className="shimmer h-4 rounded w-14" />
    </div>
    <div className="space-y-1">
      <div className="shimmer h-3 rounded w-full" />
      <div className="shimmer h-3 rounded w-4/5" />
    </div>
  </div>
);

export const EventCardSkeletonList: React.FC<LoadingSkeletonProps> = ({
  count = 3,
}) => (
  <div className="space-y-2">
    {Array.from({ length: count }, (_, i) => (
      <EventCardSkeleton key={`skeleton-${i}-${count}`} />
    ))}
  </div>
);

export const TextSkeleton: React.FC<{ lines?: number; className?: string }> = ({
  lines = 3,
  className = "",
}) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }, (_, i) => {
      const isLast = i === lines - 1;
      return (
        <div
          key={isLast ? "skeleton-last" : `skeleton-full-${i}`}
          className="shimmer h-3.5 rounded"
          style={{ width: isLast ? "60%" : "100%" }}
        />
      );
    })}
  </div>
);
