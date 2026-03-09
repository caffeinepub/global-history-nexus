import { useQuery } from "@tanstack/react-query";
import type { HistoricalEvent } from "../backend.d.ts";
import { useActor } from "./useActor";

export type { HistoricalEvent };

export function useGetAllYears() {
  const { actor, isFetching } = useActor();
  return useQuery<bigint[]>({
    queryKey: ["allYears"],
    queryFn: async () => {
      if (!actor) return [];
      const years = await actor.getAllYears();
      return years.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
    },
    enabled: !!actor && !isFetching,
    staleTime: 5 * 60 * 1000,
  });
}

export function useGetEventsByYear(year: number | null) {
  const { actor, isFetching } = useActor();
  return useQuery<HistoricalEvent[]>({
    queryKey: ["eventsByYear", year],
    queryFn: async () => {
      if (!actor || year === null) return [];
      return actor.getEventsByYear(BigInt(year));
    },
    enabled: !!actor && !isFetching && year !== null,
    staleTime: 5 * 60 * 1000,
  });
}

export function useGetEventsByYearRange(startYear: number, endYear: number) {
  const { actor, isFetching } = useActor();
  return useQuery<HistoricalEvent[]>({
    queryKey: ["eventsByYearRange", startYear, endYear],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getEventsByYearRange(BigInt(startYear), BigInt(endYear));
    },
    enabled: !!actor && !isFetching,
    staleTime: 5 * 60 * 1000,
  });
}

export function useGetEventsByRegion(region: string) {
  const { actor, isFetching } = useActor();
  return useQuery<HistoricalEvent[]>({
    queryKey: ["eventsByRegion", region],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getEventsByRegion(region);
    },
    enabled: !!actor && !isFetching && !!region,
    staleTime: 5 * 60 * 1000,
  });
}

export function useGetEventsByCategory(category: string) {
  const { actor, isFetching } = useActor();
  return useQuery<HistoricalEvent[]>({
    queryKey: ["eventsByCategory", category],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getEventsByCategory(category);
    },
    enabled: !!actor && !isFetching && !!category,
    staleTime: 5 * 60 * 1000,
  });
}

export function useGetEventById(id: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<HistoricalEvent | null>({
    queryKey: ["eventById", id],
    queryFn: async () => {
      if (!actor || !id) return null;
      return actor.getEventById(id);
    },
    enabled: !!actor && !isFetching && !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useGetRelatedEvents(eventId: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<HistoricalEvent[]>({
    queryKey: ["relatedEvents", eventId],
    queryFn: async () => {
      if (!actor || !eventId) return [];
      return actor.getRelatedEvents(eventId);
    },
    enabled: !!actor && !isFetching && !!eventId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useGetYearByRegion(year: number | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Array<[string, HistoricalEvent[]]>>({
    queryKey: ["yearByRegion", year],
    queryFn: async () => {
      if (!actor || year === null) return [];
      return actor.getYearByRegion(BigInt(year));
    },
    enabled: !!actor && !isFetching && year !== null,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSearchEvents(keyword: string) {
  const { actor, isFetching } = useActor();
  return useQuery<HistoricalEvent[]>({
    queryKey: ["searchEvents", keyword],
    queryFn: async () => {
      if (!actor || !keyword.trim()) return [];
      return actor.searchEvents(keyword.trim());
    },
    enabled: !!actor && !isFetching && keyword.trim().length > 0,
    staleTime: 30 * 1000,
  });
}
