
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { StatRecord } from './TrafficTypes';

export const PageviewService = {
  // Get pageviews filtered by time period
  getPageviews: async (websiteId: string, period: 'today' | 'week' | 'month' | 'all' = 'all') => {
    try {
      console.log('Fetching pageviews for period:', period);
      let query = supabase
        .from('pageviews')
        .select('*')
        .eq('website_id', websiteId);
      
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
      
      console.log(`Successfully fetched ${data?.length || 0} pageviews`);
      return data || [];
    } catch (error) {
      console.error('Error in getPageviews:', error);
      toast.error('Failed to fetch traffic data');
      return [];
    }
  },

  // Get page URL statistics
  getPageData: async (websiteId: string): Promise<StatRecord> => {
    try {
      console.log('Fetching page data for website:', websiteId);
      const { data, error } = await supabase
        .from('pageviews')
        .select('page_url')
        .eq('website_id', websiteId);
      
      if (error) {
        console.error('Error fetching page data:', error);
        return {};
      }
      
      // Process page data
      const byPage: StatRecord = {};
      data?.forEach(item => {
        if (item && item.page_url) {
          const page = item.page_url;
          byPage[page] = (byPage[page] || 0) + 1;
        }
      });
      
      console.log(`Successfully processed page data: ${Object.keys(byPage).length} unique pages`);
      return byPage;
    } catch (error) {
      console.error('Error in getPageData:', error);
      return {};
    }
  }
};
