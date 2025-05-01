
// Define types used across traffic services

// Base record type for key-value statistics
export type StatRecord = Record<string, number>;

// Traffic stats type definition
export interface TrafficStats {
  totalViews: number;
  uniqueVisitors: number;
  byDate: StatRecord;
  byPage: StatRecord;
  byDevice: StatRecord;
  byBrowser: StatRecord;
}

// Type for basic analytics
export interface BasicAnalytics {
  totalViews: number;
  uniqueVisitors: number;
}

// Export types for external usage
export const TrafficTypes = {
  // This empty object allows us to namespace the types
  TrafficStats
};
