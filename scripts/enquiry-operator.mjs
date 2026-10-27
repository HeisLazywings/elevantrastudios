#!/usr/bin/env node
// Run only from a trusted terminal. Never expose the retry secret to a browser.
const [action, submissionId] = process.argv.slice(2);
const receiptPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
if (!['status', 'retry'].includes(action) || !receiptPattern.test(submissionId || '')) {
  console.error('Usage: node scripts/enquiry-operator.mjs <status|retry> <receipt-uuid>');
  process.exit(1);
}
const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const publicKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim()
  || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
const retrySecret = process.env.ENQUIRY_RETRY_SECRET;
let endpoint;
try {
  const url = new URL(projectUrl);
  if (url.username || url.password || url.search || url.hash || url.pathname !== '/' ||
      !(url.protocol === 'https:' || (url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname)))) throw new Error();
  endpoint = url.origin + '/functions/v1/submit-enquiry';
} catch {
  console.error('Configure the existing project URL in NEXT_PUBLIC_SUPABASE_URL.');
  process.exit(1);
}
if (!publicKey || !retrySecret || retrySecret.length < 32) {
  console.error('Load the public Supabase key and the server-only ENQUIRY_RETRY_SECRET from a secure environment.');
  process.exit(1);
}
try {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: publicKey, Authorization: `Bearer ${retrySecret}` },
    body: JSON.stringify({ action, submissionId: submissionId.toLowerCase() }),
    signal: AbortSignal.timeout(20000),
  });
  const result = await response.json();
  if (!response.ok || result.ok !== true) {
    // Never echo raw responses, submitted details, secrets or request headers.
    console.error(`Operator request failed (HTTP ${response.status}). Check deployment and operator authorization.`);
    process.exitCode = 1;
  } else {
    const notification = result.notification || {};
    console.log(JSON.stringify({
      receiptId: result.receiptId,
      receivedAt: result.receivedAt,
      notification: {
        state: notification.state, attempts: notification.attempts,
        providerMessageId: notification.providerMessageId,
        lastErrorCode: notification.lastErrorCode, outcome: notification.outcome,
      },
    }, null, 2));
  }
} catch {
  console.error('Operator request could not be confirmed. Use status before retrying.');
  process.exitCode = 1;
}
