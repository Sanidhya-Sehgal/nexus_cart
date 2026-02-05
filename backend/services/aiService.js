const Groq = require('groq-sdk');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const aiService = {
  generateWordPressContent: async (product) => {
    const prompt = `
      You are an elite copywriter for a premium D2C brand (like Apple or a high-end Shopify store).
      Your task is to write incredibly persuasive, immersive, and premium product copy.
      
      CRITICAL RULES: 
      - DO NOT sound like an AI. Keep the copy human, sophisticated, and deeply engaging.
      - NO AI BUZZWORDS: "Unlock", "Pinnacle", "Boundless", "Elevate", "Revolutionize", "Ultimate".
      - RETURN ONLY VALID JSON. No markdown, no explanations, just the JSON object.

      PRODUCT DATA:
      Title: ${product.title}
      Description: ${product.body_html || 'N/A'}

      OUTPUT EXACTLY THIS JSON STRUCTURE:
      {
        "hook": "A short, powerful 3-5 word headline",
        "detailed_description": "A beautifully written, immersive 2-3 paragraph description explaining why this product is incredible and how it fits into the customer's lifestyle.",
        "benefits": [
          "Benefit 1 (focus on emotional value)",
          "Benefit 2 (focus on practical value)"
        ],
        "features": [
          "Feature 1 (short technical or material detail)",
          "Feature 2 (short)",
          "Feature 3 (short)"
        ],
        "metaDescription": "A 1-sentence meta description"
      }
    `;

    try {
      const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.4, // Slightly higher for more creative copy
        max_tokens: 600, // Increased to allow for longer detailed_description
        response_format: { type: "json_object" }, 
      });

      const responseText = chatCompletion.choices[0].message.content;
      const data = JSON.parse(responseText);
      const price = product.variants?.[0]?.price || 'N/A';
      
      // Extract Image and Handle for Checkout
      let rawImageUrl = product.image?.src || product.images?.[0]?.src || '';
      // Strip query parameters (?v=...) from Shopify CDN links because WordPress KSES often blocks them
      const imageUrl = rawImageUrl.split('?')[0];
      const productUrl = `https://${process.env.SHOPIFY_STORE_URL}/products/${product.handle}`;
      
      console.log('🛠️ [DEBUG] Extracted Image URL:', imageUrl);

      // Escape quotes for HTML attributes
      const safeTitle = (product.title || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

      // Build the beautiful HTML string programmatically
      const html = `
<!-- meta_description: ${data.metaDescription} -->
<div style="max-width: 900px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a; line-height: 1.6; padding: 2rem 0;">
  
  <div style="display: flex; flex-wrap: wrap; gap: 3rem; align-items: flex-start;">
    
    <!-- Left Column: Image -->
    ${imageUrl ? `
    <div style="flex: 1; min-width: 300px;">
      <div style="border-radius: 1.5rem; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); background: #f8fafc;">
        <img src="${imageUrl}" alt="${safeTitle}" style="width: 100%; height: auto; display: block; border-radius: 1.5rem;" />
      </div>
    </div>
    ` : ''}

    <!-- Right Column: Content -->
    <div style="flex: 1.2; min-width: 300px;">
      <h1 style="font-size: 3rem; font-weight: 800; letter-spacing: -0.04em; margin-top: 0; margin-bottom: 1.5rem; color: #020617; line-height: 1.1;">
        ${data.hook}
      </h1>
      
      <div style="font-size: 1.125rem; color: #475569; margin-bottom: 2.5rem; font-weight: 400; display: flex; flex-direction: column; gap: 1rem;">
        ${data.detailed_description.split('\\n').map(p => `<p style="margin: 0;">${p}</p>`).join('')}
      </div>
      
      <div style="margin-bottom: 2.5rem;">
        <h3 style="font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8; font-weight: 700; margin-bottom: 1rem;">Why you'll love it</h3>
        <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.75rem;">
          ${data.benefits.map(benefit => `
            <li style="display: flex; align-items: flex-start; color: #334155; font-weight: 500;">
              <span style="color: #10b981; margin-right: 0.75rem; font-size: 1.25rem; line-height: 1;">✓</span>
              <span>${benefit}</span>
            </li>
          `).join('')}
        </ul>
      </div>

      <div style="margin-bottom: 3rem;">
        <h3 style="font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8; font-weight: 700; margin-bottom: 1rem;">Key Features</h3>
        <div style="display: flex; flex-wrap: wrap; gap: 0.75rem;">
          ${data.features.map(feature => `
            <span style="background: #f1f5f9; color: #475569; padding: 0.5rem 1rem; border-radius: 9999px; font-size: 0.875rem; font-weight: 500; border: 1px solid #e2e8f0;">
              ${feature}
            </span>
          `).join('')}
        </div>
      </div>
      
      <div style="display: flex; align-items: center; gap: 1.5rem; padding-top: 2rem; border-top: 1px solid #e2e8f0;">
        <div style="font-size: 2rem; font-weight: 700; color: #0f172a;">
          $${price}
        </div>
        <a href="${productUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; flex: 1; background: linear-gradient(135deg, #0f172a, #334155); color: white; text-decoration: none; padding: 1.25rem 2rem; border-radius: 1rem; font-weight: 600; font-size: 1.125rem; box-shadow: 0 10px 15px -3px rgba(15, 23, 42, 0.2); transition: transform 0.2s; text-align: center;">
          Buy Now on Shopify
        </a>
      </div>
    </div>
  </div>
</div>
`;

      return html;
    } catch (error) {
      console.error('Error generating AI content:', error);
      throw new Error('AI Content Generation Failed');
    }
  },
};

module.exports = aiService;
