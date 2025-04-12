
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type TrafficData = {
  id: string;
  page_url: string;
  referrer?: string;
  user_agent?: string;
  browser?: string;
  os?: string;
  device?: string;
  country?: string;
  city?: string;
  created_at: string;
};

export type TrafficStats = {
  totalViews: number;
  uniqueVisitors: number;
  byDevice: Record<string, number>;
  byBrowser: Record<string, number>;
  byPage: Record<string, number>;
  byDate: Record<string, number>;
};

export const TrafficService = {
  // Record a pageview
  recordPageview: async (): Promise<void> => {
    try {
      const websiteId = 'learning-lab'; // Default ID for this app
      const pageUrl = window.location.pathname;
      const referrer = document.referrer;
      const userAgent = navigator.userAgent;

      // Only record page views if not in development mode
      if (process.env.NODE_ENV !== 'development') {
        await supabase.rpc('record_pageview', {
          site_id: websiteId,
          page_url: pageUrl, 
          referrer: referrer,
          user_agent: userAgent
        });
      }
    } catch (error) {
      console.error('Error recording pageview:', error);
    }
  },

  // Get traffic data
  getTrafficData: async (): Promise<TrafficData[]> => {
    try {
      const { data, error } = await supabase
        .from('pageviews')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000);

      if (error) {
        console.error('Error fetching traffic data:', error);
        toast.error('Failed to fetch traffic data');
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getTrafficData:', error);
      toast.error('Failed to fetch traffic data');
      return [];
    }
  },

  // Get traffic statistics
  getTrafficStats: async (): Promise<TrafficStats> => {
    try {
      const trafficData = await TrafficService.getTrafficData();
      
      // Calculate statistics
      const stats: TrafficStats = {
        totalViews: trafficData.length,
        uniqueVisitors: new Set(trafficData.map(item => item.ip)).size,
        byDevice: {},
        byBrowser: {},
        byPage: {},
        byDate: {},
      };

      // Process data for charts
      trafficData.forEach(item => {
        // By device
        if (item.device) {
          stats.byDevice[item.device] = (stats.byDevice[item.device] || 0) + 1;
        }

        // By browser
        if (item.browser) {
          stats.byBrowser[item.browser] = (stats.byBrowser[item.browser] || 0) + 1;
        }

        // By page
        const page = item.page_url || 'unknown';
        stats.byPage[page] = (stats.byPage[page] || 0) + 1;

        // By date
        const date = new Date(item.created_at).toLocaleDateString();
        stats.byDate[date] = (stats.byDate[date] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Error in getTrafficStats:', error);
      toast.error('Failed to calculate traffic statistics');
      return {
        totalViews: 0,
        uniqueVisitors: 0,
        byDevice: {},
        byBrowser: {},
        byPage: {},
        byDate: {},
      };
    }
  }
};
