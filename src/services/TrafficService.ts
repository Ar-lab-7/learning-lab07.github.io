
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Website ID for the Learning Lab
const WEBSITE_ID = '550e8400-e29b-41d4-a716-446655440000';

export const TrafficService = {
  recordPageview: async () => {
    try {
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
      let query = supabase.from('pageviews').select('*');
      
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
        .select('browser, count')
        .not('browser', 'is', null)
        .then(result => ({
          ...result,
          data: result.data?.reduce((acc, item) => {
            const browser = item.browser || 'Unknown';
            acc[browser] = (acc[browser] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        }));
      
      if (error) {
        console.error('Error fetching browser stats:', error);
        return {};
      }
      
      return data || {};
    } catch (error) {
      console.error('Error in getBrowserStats:', error);
      return {};
    }
  },
  
  getDeviceStats: async () => {
    try {
      const { data, error } = await supabase
        .from('pageviews')
        .select('device, count')
        .not('device', 'is', null)
        .then(result => ({
          ...result,
          data: result.data?.reduce((acc, item) => {
            const device = item.device || 'Unknown';
            acc[device] = (acc[device] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        }));
      
      if (error) {
        console.error('Error fetching device stats:', error);
        return {};
      }
      
      return data || {};
    } catch (error) {
      console.error('Error in getDeviceStats:', error);
      return {};
    }
  }
};
