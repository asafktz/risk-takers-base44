import {
  getMerchServerConfig,
  readRawRequestBody,
  sendMerchError,
  validateWebhookEnvelope,
  verifyFourthwallWebhookSignature,
} from './_merch.js';

// Keep the raw request bytes intact. Re-serializing parsed JSON does not produce
// a valid Fourthwall signature input.
export const config = { api: { bodyParser: false } };

export default async function fourthwallWebhook(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  res.setHeader('Cache-Control', 'no-store');
  try {
    const merchConfig = getMerchServerConfig();
    if (!merchConfig.webhookSecret) {
      res.status(503).json({ error: 'Webhook verification is not configured', code: 'WEBHOOK_NOT_CONFIGURED' });
      return;
    }

    const rawBody = await readRawRequestBody(req);
    if (!rawBody) {
      res.status(400).json({ error: 'Raw webhook body is required', code: 'RAW_WEBHOOK_BODY_REQUIRED' });
      return;
    }
    const signature = req.headers?.['x-fourthwall-hmac-sha256'];
    if (!verifyFourthwallWebhookSignature(rawBody, signature, merchConfig.webhookSecret)) {
      res.status(401).json({ error: 'Invalid webhook signature', code: 'INVALID_WEBHOOK_SIGNATURE' });
      return;
    }

    let event;
    try {
      event = JSON.parse(rawBody.toString('utf8'));
    } catch {
      res.status(400).json({ error: 'Invalid webhook JSON', code: 'INVALID_WEBHOOK_JSON' });
      return;
    }
    const envelope = validateWebhookEnvelope(event, merchConfig);

    // Log only the common envelope. Event data can contain email, address,
    // product provider IDs, and order amounts, so it is intentionally omitted.
    console.info('Fourthwall webhook received', {
      eventId: envelope.id,
      type: envelope.type,
      apiVersion: envelope.apiVersion,
      createdAt: envelope.createdAt,
      testMode: envelope.testMode,
    });
    res.status(200).json({ received: true });
  } catch (error) {
    sendMerchError(res, error);
  }
}
