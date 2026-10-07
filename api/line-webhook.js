const APP_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwctlJZgrjyXUghLs_FuS7JvRH5X5ySotRJOO8TNpsZcIS62PVDrHACs4GaFbfDnjsmgg/exec';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(200).send('BNI Pavilion LINE webhook is ready');
    return;
  }

  const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
  const headers = { 'Content-Type': 'application/json' };
  const lineSignature = req.headers['x-line-signature'];
  if (lineSignature) headers['x-line-signature'] = lineSignature;

  // Acknowledge LINE immediately. Forwarding continues without delaying Verify/events.
  res.status(200).send('OK');

  try {
    let upstream = await fetch(APP_SCRIPT_URL, {
      method: 'POST', headers, body: rawBody, redirect: 'manual'
    });
    const location = upstream.headers.get('location');
    if (location && [301, 302, 303, 307, 308].includes(upstream.status)) {
      await fetch(new URL(location, APP_SCRIPT_URL), {
        method: 'POST', headers, body: rawBody, redirect: 'follow'
      });
    }
  } catch (error) {
    console.error('LINE webhook forward failed', error);
  }
}
