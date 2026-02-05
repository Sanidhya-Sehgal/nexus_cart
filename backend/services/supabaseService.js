const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const supabaseService = {
  logSync: async (productName, platform, status, liveLink = '') => {
    const { data, error } = await supabase
      .from('sync_logs')
      .insert([
        {
          product_name: productName,
          platform: platform,
          status: status,
          live_link: liveLink,
          synced_at: new Date(),
        },
      ]);

    if (error) {
      console.error('Error logging to Supabase:', error);
      return null;
    }
    return data;
  },

  getSyncLogs: async () => {
    const { data, error } = await supabase
      .from('sync_logs')
      .select('*')
      .order('synced_at', { ascending: false });

    if (error) {
      console.error('Error fetching logs from Supabase:', error);
      throw new Error('Failed to fetch sync logs');
    }
    return data;
  },
};

module.exports = supabaseService;
