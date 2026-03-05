const axios = require('axios');
require('dotenv').config({ path: '../.env' });
const [user, pass] = process.env.WP_AUTH.split(':');
const xmlPayload = `<?xml version="1.0"?>
<methodCall>
  <methodName>wp.newPost</methodName>
  <params>
    <param><value><int>1</int></value></param>
    <param><value><string>${user}</string></value></param>
    <param><value><string>${pass}</string></value></param>
    <param>
      <value>
        <struct>
          <member><name>post_title</name><value><string>Test</string></value></member>
          <member><name>post_content</name><value><string>Test</string></value></member>
          <member><name>post_status</name><value><string>publish</string></value></member>
        </struct>
      </value>
    </param>
  </params>
</methodCall>`;
axios.post('https://nexuscart9.wordpress.com/xmlrpc.php', xmlPayload, { headers: { 'Content-Type': 'text/xml' } })
  .then(res => console.log('RAW XML:', res.data))
  .catch(err => console.error(err.message));
