const http = require('http');
const https = require('https');
const crypto = require('crypto');

const PORT = 3457;

// Читаем ключи из .env (рядом с payment.js)
const fs = require('fs');
const envPath = __dirname + '/.env';
let SHOP_ID = '1367335';
let SECRET_KEY = '';

try {
  const env = fs.readFileSync(envPath, 'utf-8');
  env.split('\n').forEach(line => {
    const [key, ...vals] = line.split('=');
    if (key === 'YOOKASSA_SHOP_ID') SHOP_ID = vals.join('=').trim();
    if (key === 'YOOKASSA_SECRET_KEY') SECRET_KEY = vals.join('=').trim();
  });
} catch (e) {
  console.error('No .env found, using defaults');
}

function createPayment(amount, description, returnUrl) {
  return new Promise((resolve, reject) => {
    const idempotenceKey = crypto.randomUUID();
    const auth = Buffer.from(SHOP_ID + ':' + SECRET_KEY).toString('base64');
    const body = JSON.stringify({
      amount: { value: amount.toFixed(2), currency: 'RUB' },
      confirmation: { type: 'embedded' },
      capture: true,
      description: description
    });

    const options = {
      hostname: 'api.yookassa.ru',
      path: '/v3/payments',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + auth,
        'Idempotence-Key': idempotenceKey,
        'Content-Length': Buffer.byteLength(body)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode === 200 || res.statusCode === 201) {
            resolve(parsed);
          } else {
            reject(new Error(parsed.description || 'YooKassa API error'));
          }
        } catch (e) {
          reject(new Error('Failed to parse YooKassa response'));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

http.createServer((req, res) => {
  // CORS for frontend
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // POST /create-payment
  if (req.method === 'POST' && req.url === '/create-payment') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        const amount = parseFloat(data.amount) || 2900;
        const description = data.description || 'API Практикум';

        const payment = await createPayment(amount, description);
        const token = payment.confirmation.confirmation_token;

        console.log('[payment] Created:', payment.id, 'amount:', amount);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          payment_id: payment.id,
          confirmation_token: token,
          status: payment.status
        }));
      } catch (e) {
        console.error('[payment] Error:', e.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: e.message }));
      }
    });
    return;
  }

  // 404
  res.writeHead(404);
  res.end('Not found');
}).listen(PORT, () => {
  console.log(`[payment] YooKassa server running on port ${PORT}`);
  console.log(`[payment] Shop ID: ${SHOP_ID}`);
});