
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Define TrafficStats type
export interface TrafficStats {
  totalViews: number;
  uniqueVisitors: number;
  byDate: Record<string, number>;
  byPage: Record<string, number>;
  byDevice: Record<string, number>;
  byBrowser: Record<string, number>;
}

// Use a consistent website ID for all traffic data
const WEBSITE_ID = '550e8400-e29b-41d4-a716-446655440000';

export const TrafficService = {
  recordPageview: async () => {
    try {
      // Record the pageview on backend via Supabase RPC
      const { data, error } = await supabase.rpc('record_pageview', {
        site_id: WEBSITE_ID,
        page_url: window.location.pathname,
        referrer: document.referrer || 'direct',
        user_agent: navigator.userAgent
      });

      if (error) {
        console.error('Error recording pageview:', error);
      } else {
        console.log('Pageview recorded successfully:', data);
      }
    } catch (error) {
      console.error('Failed to record pageview:', error);
    }
  },

  getPageviews: async (period: 'today' | 'week' | 'month' | 'all' = 'all') => {
    try {
      let query = supabase
        .from('pageviews')
        .select('*')
        .eq('website_id', WEBSITE_ID);
      
      // Add time filter based on period
      const now = new Date();
      if (period === 'today') {
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        query = query.gte('created_at', today);
      } else if (period === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        query = query.gte('created_at', weekAgo);
      } else if (period === 'month') {
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).toISOString();
        query = query.gte('created_at', monthAgo);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching pageviews:', error);
        toast.error('Failed to fetch traffic data');
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in getPageviews:', error);
      toast.error('Failed to fetch traffic data');
      return [];
    }
  },
  
  getBrowserStats: async () => {
    try {
      const { data, error } = await supabase
        .from('pageviews')
        .select('browser')
        .eq('website_id', WEBSITE_ID)
        .not('browser', 'is', null);
      
      if (error) {
        console.error('Error fetching browser stats:', error);
        return {};
      }
      
      // Process data to get counts by browser
      const browserCounts: Record<string, number> = {};
      data?.forEach(item => {
        if (item.browser) {
          const browser = item.browser;
          browserCounts[browser] = (browserCounts[browser] || 0) + 1;
        }
      });
      
      return browserCounts;
    } catch (error) {
      console.error('Error in getBrowserStats:', error);
      return {};
    }
  },
  
  getDeviceStats: async () => {
    try {
      const { data, error } = await supabase
        .from('pageviews')
        .select('device')
        .eq('website_id', WEBSITE_ID)
        .not('device', 'is', null);
      
      if (error) {
        console.error('Error fetching device stats:', error);
        return {};
      }
      
      // Process data to get counts by device
      const deviceCounts: Record<string, number> = {};
      data?.forEach(item => {
        if (item.device) {
          const device = item.device;
          deviceCounts[device] = (deviceCounts[device] || 0) + 1;
        }
      });
      
      return deviceCounts;
    } catch (error) {
      console.error('Error in getDeviceStats:', error);
      return {};
    }
  },

  getTrafficStats: async (): Promise<TrafficStats> => {
    try {
      // Fetch total pageviews for this specific website
      const { count: totalViewsCount } = await supabase
        .from('pageviews')
        .select('*', { count: 'exact', head: true })
        .eq('website_id', WEBSITE_ID);

      // Fetch unique visitors for this website
      const { count: uniqueVisitorsCount } = await supabase
        .from('pageviews')
        .select('ip', { count: 'exact', head: true })
        .eq('website_id', WEBSITE_ID)
        .not('ip', 'is', null);

      // Ensure we have valid numbers by using nullish coalescing operator
      const totalViews = totalViewsCount ?? 0;
      const uniqueVisitors = uniqueVisitorsCount ?? 0;

      // Fetch visits by date for this website
      const { data: dateData } = await supabase
        .from('pageviews')
        .select('created_at')
        .eq('website_id', WEBSITE_ID);
      
      // Process date data
      const byDate: Record<string, number> = {};
      dateData?.forEach(item => {
        if (item && item.created_at) {
          const date = new Date(item.created_at).toISOString().split('T')[0];
          byDate[date] = (byDate[date] || 0) + 1;
        }
      });

      // Fetch visits by page for this website
      const { data: pageData } = await supabase
        .from('pageviews')
        .select('page_url')
        .eq('website_id', WEBSITE_ID);
      
      // Process page data
      const byPage: Record<string, number> = {};
      pageData?.forEach(item => {
        if (item && item.page_url) {
          const page = item.page_url;
          byPage[page] = (byPage[page] || 0) + 1;
        }
      });

      // Use existing methods for device and browser stats with null checking
      const byDevice = await this.getDeviceStats() || {};
      const byBrowser = await this.getBrowserStats() || {};

      return {
        totalViews,
        uniqueVisitors,
        byDate,
        byPage,
        byDevice,
        byBrowser
      };
    } catch (error) {
      console.error('Error fetching traffic stats:', error);
      toast.error('Failed to fetch traffic statistics');
      return {
        totalViews: 0,
        uniqueVisitors: 0,
        byDate: {},
        byPage: {},
        byDevice: {},
        byBrowser: {}
      };
    }
  }
};
