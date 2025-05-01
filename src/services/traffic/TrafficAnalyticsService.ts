
import { supabase } from '@/integrations/supabase/client';
import { BasicAnalytics } from './TrafficTypes';

export const TrafficAnalyticsService = {
  // Get basic analytics data (total views and unique visitors)
  getBasicAnalytics: async (websiteId: string): Promise<BasicAnalytics> => {
    try {
      // Fetch total pageviews for this specific website
      const { count: totalViewsCount } = await supabase
        .from('pageviews')
        .select('*', { count: 'exact', head: true })
        .eq('website_id', websiteId);

      // Fetch unique visitors for this website
      const { count: uniqueVisitorsCount } = await supabase
        .from('pageviews')
        .select('ip', { count: 'exact', head: true })
        .eq('website_id', websiteId)
        .not('ip', 'is', null);

      // Ensure we have valid numbers by using nullish coalescing operator
      const totalViews = totalViewsCount ?? 0;
      const uniqueVisitors = uniqueVisitorsCount ?? 0;
      
      return {
        totalViews,
        uniqueVisitors
      };
    } catch (error) {
      console.error('Error in getBasicAnalytics:', error);
      return {
        totalViews: 0,
        uniqueVisitors: 0
      };
    }
  }
};
