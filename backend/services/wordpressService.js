const axios = require('axios');
const path = require('path');
const https = require('https');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Create a custom agent to handle legacy SSL renegotiation for Shopify
const httpsAgent = new https.Agent({
  rejectUnauthorized: false, // Only if absolutely necessary
  secureOptions: require('constants').SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION
});

const wordpressService = {
  uploadMedia: async (imageUrl, username, password, wpUrl) => {
    if (!imageUrl) return null;
    try {
      console.log(`🖼️ Downloading image from Shopify: ${imageUrl}`);
      const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const base64Data = Buffer.from(imageResponse.data, 'binary').toString('base64');
      
      const fileName = imageUrl.split('/').pop().split('?')[0] || 'product-image.jpg';
      let mimeType = 'image/jpeg';
      if (fileName.toLowerCase().endsWith('.png')) mimeType = 'image/png';
      if (fileName.toLowerCase().endsWith('.webp')) mimeType = 'image/webp';

      const xmlRpcUrl = `${wpUrl}/xmlrpc.php`;
      console.log(`📡 Uploading image to WordPress Media Library...`);

      const xmlPayload = `<?xml version="1.0"?>
<methodCall>
  <methodName>wp.uploadFile</methodName>
  <params>
    <param><value><int>1</int></value></param>
    <param><value><string>${username}</string></value></param>
    <param><value><string>${password}</string></value></param>
    <param>
      <value>
        <struct>
          <member><name>name</name><value><string>${fileName}</string></value></member>
          <member><name>type</name><value><string>${mimeType}</string></value></member>
          <member><name>bits</name><value><base64>${base64Data}</base64></value></member>
        </struct>
      </value>
    </param>
  </params>
</methodCall>`;

      const response = await axios.post(xmlRpcUrl, xmlPayload, {
        headers: { 'Content-Type': 'text/xml', 'User-Agent': 'NexusCart-Orchestrator/1.0' },
        timeout: 15000,
      });

      const match = response.data.match(/<member><name>id<\/name><value><string>(\d+)<\/string><\/value><\/member>/) ||
                    response.data.match(/<member><name>attachment_id<\/name><value><string>(\d+)<\/string><\/value><\/member>/) ||
                    response.data.match(/<name>id<\/name><value><int>(\d+)<\/int><\/value>/) ||
                    response.data.match(/<name>attachment_id<\/name><value><string>(\d+)<\/string>/) ||
                    response.data.match(/<string>(\d+)<\/string>/); // Fallback

      if (match && match[1]) {
        console.log(`✅ Image uploaded successfully. Attachment ID: ${match[1]}`);
        return match[1];
      } else {
        console.warn(`⚠️ Failed to parse attachment ID from WordPress response.`);
        return null;
      }
    } catch (error) {
      console.warn(`⚠️ Error uploading media: ${error.message}`);
      return null;
    }
  },

  publishPost: async (title, content, excerpt, imageUrl = '') => {
    let lastError;
    const maxRetries = 3;

    for (let i = 0; i < maxRetries; i++) {
      try {
        const authRaw = process.env.WP_AUTH?.trim();
        if (!authRaw) throw new Error('WP_AUTH is missing in .env');
        
        const authParts = authRaw.split(':');
        if (authParts.length < 2) throw new Error('WP_AUTH must be in username:password format');
        
        const [username, password] = authParts;
        const wpUrl = process.env.WP_URL.replace(/\/$/, '');
        const xmlRpcUrl = `${wpUrl}/xmlrpc.php`;
        
        console.log(`📡 Sending XML-RPC request to bypass API lockdown: ${xmlRpcUrl}`);

        // Escape XML characters
        const escapeXml = (unsafe) => (unsafe || '').replace(/[<>&'"]/g, c => {
          switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
          }
        });

        // Upload media if imageUrl is provided
        let attachmentId = null;
        if (imageUrl) {
          attachmentId = await wordpressService.uploadMedia(imageUrl, username, password, wpUrl);
        }

        const thumbnailXml = attachmentId ? `<member><name>wp_post_thumbnail</name><value><int>${attachmentId}</int></value></member>` : '';

        const xmlPayload = `<?xml version="1.0"?>
<methodCall>
  <methodName>wp.newPost</methodName>
  <params>
    <param><value><int>1</int></value></param>
    <param><value><string>${escapeXml(username)}</string></value></param>
    <param><value><string>${escapeXml(password)}</string></value></param>
    <param>
      <value>
        <struct>
          <member><name>post_title</name><value><string>${escapeXml(title)}</string></value></member>
          <member><name>post_content</name><value><string>${escapeXml(content)}</string></value></member>
          <member><name>post_status</name><value><string>publish</string></value></member>
          ${thumbnailXml}
        </struct>
      </value>
    </param>
  </params>
</methodCall>`;

        const response = await axios.post(xmlRpcUrl, xmlPayload, {
          headers: {
            'Content-Type': 'text/xml',
            'User-Agent': 'NexusCart-Orchestrator/1.0'
          },
          timeout: 15000,
        });

        console.log(`✅ WordPress XML-RPC Response received.`);
        
        // Extract the post ID from the XML response
        const match = response.data.match(/<value>\s*<string>(\d+)<\/string>\s*<\/value>/) || 
                      response.data.match(/<value>\s*<int>(\d+)<\/int>\s*<\/value>/) ||
                      response.data.match(/<string>(\d+)<\/string>/) ||
                      response.data.match(/<int>(\d+)<\/int>/);
                      
        if (match && match[1]) {
          const postId = match[1];
          const liveLink = `${wpUrl}/?p=${postId}`;
          console.log(`🔗 Live Link generated:`, liveLink);
          return { link: liveLink, id: postId };
        } else if (response.data.includes('faultString')) {
          const errorMatch = response.data.match(/<name>faultString<\/name>\s*<value><string>(.*?)<\/string><\/value>/);
          throw new Error(errorMatch ? errorMatch[1] : 'XML-RPC returned a fault error');
        } else {
          console.log(`❌ RAW XML RESPONSE:\n`, response.data);
          require('fs').writeFileSync('xml_error.log', response.data);
          throw new Error('Could not parse post ID from XML-RPC response');
        }
      } catch (error) {
        lastError = error;
        console.warn(`⚠️ Attempt ${i + 1} failed. Retrying...`, error.message);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.error('❌ WordPress Publishing Failed after retries:', lastError.response?.data || lastError.message);
    throw new Error(`WordPress Sync Error: ${lastError.message}`);
  },
};

module.exports = wordpressService;
