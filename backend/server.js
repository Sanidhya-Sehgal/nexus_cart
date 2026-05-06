const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const https = require('https');

// GLOBAL FIX: Allow legacy SSL renegotiation for all connections (Shopify, Supabase, etc.)
try {
  const crypto = require('crypto');
  if (crypto.constants.SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION) {
    https.globalAgent.options.secureOptions = crypto.constants.SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION;
  }
} catch (e) {
  console.warn('Could not set global SSL renegotiation flag');
}
const shopifyService = require("./services/shopifyService");
const wordpressService = require("./services/wordpressService");
const aiService = require("./services/aiService");
const supabaseService = require("./services/supabaseService");
// Load .env from root
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Get Shopify Inventory
app.get('/api/shopify/products', async (req, res) => {
  try {
    const products = await shopifyService.getProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Sync Product to WordPress
app.post('/api/sync', async (req, res) => {
  const { product } = req.body;
  
  if (!product) {
    return res.status(400).json({ error: 'Product data is required' });
  }

  try {
    // 1. Generate AI Content
    const generatedContent = await aiService.generateWordPressContent(product);
    
    // Extract meta description from comment if exists
    const metaMatch = generatedContent.match(/<!-- meta_description: (.*?) -->/);
    const excerpt = metaMatch ? metaMatch[1] : '';
    const cleanContent = generatedContent.replace(/<!-- meta_description: .*? -->/, '').trim();

    // 2. Publish to WordPress
    console.log('📤 Publishing to WordPress...');
    const rawImageUrl = product.image?.src || product.images?.[0]?.src || '';
    const imageUrl = rawImageUrl.split('?')[0]; // Strip tracking parameters
    
    const wpResult = await wordpressService.publishPost(product.title, cleanContent, excerpt, imageUrl);

    // 3. Log to Supabase
    console.log('📝 Logging to Supabase...');
    const finalLink = typeof wpResult.link === 'string' ? wpResult.link : String(wpResult.link);
    await supabaseService.logSync(product.title, 'WordPress', 'Synced', finalLink);

    res.json({ success: true, link: finalLink });
  } catch (error) {
    console.error('❌ Sync Error Details:', {
      message: error.message,
      stack: error.stack,
      data: error.response?.data
    });
    
    await supabaseService.logSync(product.title, 'WordPress', 'Error', '');
    res.status(500).json({ 
      error: error.message,
      details: error.response?.data || 'No additional details'
    });
  }
});

// Get Sync History
app.get('/api/history', async (req, res) => {
  try {
    const logs = await supabaseService.getSyncLogs();
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Clear Sync History
app.delete('/api/history', async (req, res) => {
  try {
    await supabaseService.clearSyncLogs();
    res.json({ success: true, message: 'History cleared' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/get-token", async (req, res) => {
  try {
    const response = await fetch(
      `https://${process.env.SHOPIFY_STORE_URL}/admin/oauth/access_token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "client_credentials",
          client_id: process.env.SHOPIFY_CLIENT_ID,
          client_secret: process.env.SHOPIFY_CLIENT_SECRET,
        }),
      }
    );

    const data = await response.json();

    console.log("\n🔥 ========================");
    console.log("ACCESS TOKEN:");
    console.log(data.access_token);
    console.log("========================\n");

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error generating token");
  }
});

app.listen(PORT, () => {
  console.log(`NexusCart Backend running on port ${PORT}`);
});

