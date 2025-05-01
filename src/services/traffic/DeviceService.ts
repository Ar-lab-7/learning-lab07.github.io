
import { supabase } from '@/integrations/supabase/client';
import { StatRecord } from './TrafficTypes';

export const DeviceService = {
  // Get device type statistics
  getDeviceStats: async (websiteId: string): Promise<StatRecord> => {
    try {
      const { data, error } = await supabase
        .from('pageviews')
        .select('device')
        .eq('website_id', websiteId)
        .not('device', 'is', null);
      
      if (error) {
        console.error('Error fetching device stats:', error);
        return {};
      }
      
      // Process data to get counts by device
      const deviceCounts: StatRecord = {};
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
  }
};
