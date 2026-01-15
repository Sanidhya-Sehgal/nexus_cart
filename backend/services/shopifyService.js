const axios = require('axios');
const path = require('path');
const https = require('https');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const httpsAgent = new https.Agent({
  secureOptions: require('constants').SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION
});

const shopifyService = {
  getProducts: async () => {
    try {
      const response = await axios.get(
        `https://${process.env.SHOPIFY_STORE_URL}/admin/api/2024-01/products.json`,
        {
          headers: {
            'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN,
            'Content-Type': 'application/json',
          },
          httpsAgent: httpsAgent
        }
      );
      return response.data.products;
    } catch (error) {
      console.error('Error fetching Shopify products:', error.response?.data || error.message);
      throw new Error('Failed to fetch Shopify products');
    }
  },
};

module.exports = shopifyService;
