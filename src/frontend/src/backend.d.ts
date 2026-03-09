import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface HistoricalEvent {
    id: string;
    region: string;
    latitude: number;
    title: string;
    year: bigint;
    exactDate?: string;
    shortSummary: string;
    civilization: string;
    keyFigures: Array<KeyFigure>;
    longitude: number;
    category: string;
    sources: Array<string>;
    causes: Array<string>;
    relatedEventIds: Array<string>;
    fullDescription: string;
    locationName: string;
    consequences: Array<string>;
}
export interface KeyFigure {
    name: string;
    role: string;
}
export interface backendInterface {
    addEvent(event: HistoricalEvent): Promise<string>;
    getAllYears(): Promise<Array<bigint>>;
    getEventById(id: string): Promise<HistoricalEvent | null>;
    getEventsByCategory(category: string): Promise<Array<HistoricalEvent>>;
    getEventsByRegion(region: string): Promise<Array<HistoricalEvent>>;
    getEventsByYear(year: bigint): Promise<Array<HistoricalEvent>>;
    getEventsByYearRange(startYear: bigint, endYear: bigint): Promise<Array<HistoricalEvent>>;
    getRelatedEvents(eventId: string): Promise<Array<HistoricalEvent>>;
    getYearByRegion(year: bigint): Promise<Array<[string, Array<HistoricalEvent>]>>;
    searchEvents(keyword: string): Promise<Array<HistoricalEvent>>;
}
