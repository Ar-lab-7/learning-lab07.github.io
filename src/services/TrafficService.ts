
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { DeviceService } from './traffic/DeviceService';
import { BrowserService } from './traffic/BrowserService';
import { PageviewService } from './traffic/PageviewService';
import { DateService } from './traffic/DateService';
import { TrafficAnalyticsService } from './traffic/TrafficAnalyticsService';
import { TrafficStats } from './traffic/TrafficTypes';

// Use a consistent website ID for all traffic data
const WEBSITE_ID = '550e8400-e29b-41d4-a716-446655440000';

// Export the types from the refactored module
export type { TrafficStats } from './traffic/TrafficTypes';

// Main Traffic Service that orchestrates all traffic-related operations
export const TrafficService = {
  // Record a new pageview when a user visits a page
  recordPageview: async () => {
    try {
      console.log('Recording pageview for:', window.location.pathname);
      
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

  // Get pageviews filtered by time period
  getPageviews: async (period: 'today' | 'week' | 'month' | 'all' = 'all') => {
    try {
      console.log('Getting pageviews for period:', period);
      return await PageviewService.getPageviews(WEBSITE_ID, period);
    } catch (error) {
      console.error('Error in getPageviews:', error);
      toast.error('Failed to fetch pageviews');
      return [];
    }
  },
  
  // Get browser statistics
  getBrowserStats: async () => {
    try {
      console.log('Getting browser statistics');
      return await BrowserService.getBrowserStats(WEBSITE_ID);
    } catch (error) {
      console.error('Error in getBrowserStats:', error);
      toast.error('Failed to fetch browser statistics');
      return {};
    }
  },
  
  // Get device statistics
  getDeviceStats: async () => {
    try {
      console.log('Getting device statistics');
      return await DeviceService.getDeviceStats(WEBSITE_ID);
    } catch (error) {
      console.error('Error in getDeviceStats:', error);
      toast.error('Failed to fetch device statistics');
      return {};
    }
  },

  // Get comprehensive traffic statistics
  getTrafficStats: async (): Promise<TrafficStats> => {
    try {
      console.log('Fetching traffic statistics...');
      
      // Get total views and unique visitors
      const analyticsData = await TrafficAnalyticsService.getBasicAnalytics(WEBSITE_ID);
      console.log('Analytics data:', analyticsData);
      
      // Get date data
      const dateData = await DateService.getDateData(WEBSITE_ID);
      console.log('Date data:', dateData);
      
      // Get page data
      const pageData = await PageviewService.getPageData(WEBSITE_ID);
      console.log('Page data:', pageData);
      
      // Get device and browser stats using dedicated services
      const deviceStats = await DeviceService.getDeviceStats(WEBSITE_ID);
      console.log('Device stats:', deviceStats);
      
      const browserStats = await BrowserService.getBrowserStats(WEBSITE_ID);
      console.log('Browser stats:', browserStats);
      
      // Fix the undefined checks with proper null coalescing
      const byDevice = deviceStats || {};
      const byBrowser = browserStats || {};
      
      const result = {
        totalViews: analyticsData.totalViews,
        uniqueVisitors: analyticsData.uniqueVisitors,
        byDate: dateData || {},
        byPage: pageData || {},
        byDevice,
        byBrowser
      };
      
      console.log('Final traffic stats:', result);
      return result;
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
