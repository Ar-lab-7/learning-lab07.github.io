
import { supabase } from '@/integrations/supabase/client';
import { StatRecord } from './TrafficTypes';

export const BrowserService = {
  // Get browser usage statistics
  getBrowserStats: async (websiteId: string): Promise<StatRecord> => {
    try {
      const { data, error } = await supabase
        .from('pageviews')
        .select('browser')
        .eq('website_id', websiteId)
        .not('browser', 'is', null);
      
      if (error) {
        console.error('Error fetching browser stats:', error);
        return {};
      }
      
      // Process data to get counts by browser
      const browserCounts: StatRecord = {};
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
  }
};
