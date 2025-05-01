
import { supabase } from '@/integrations/supabase/client';
import { StatRecord } from './TrafficTypes';

export const DateService = {
  // Get visit data grouped by date
  getDateData: async (websiteId: string): Promise<StatRecord> => {
    try {
      const { data, error } = await supabase
        .from('pageviews')
        .select('created_at')
        .eq('website_id', websiteId);
      
      if (error) {
        console.error('Error fetching date data:', error);
        return {};
      }
      
      // Process date data
      const byDate: StatRecord = {};
      data?.forEach(item => {
        if (item && item.created_at) {
          const date = new Date(item.created_at).toISOString().split('T')[0];
          byDate[date] = (byDate[date] || 0) + 1;
        }
      });
      
      return byDate;
    } catch (error) {
      console.error('Error in getDateData:', error);
      return {};
    }
  }
};
