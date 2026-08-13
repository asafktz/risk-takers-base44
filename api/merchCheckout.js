import { readBody } from './_lib.js';
import { createMerchCheckout, sendMerchError } from './_merch.js';

export default async function merchCheckout(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  res.setHeader('Cache-Control', 'private, no-store');
  try {
    const body = await readBody(req);
    const checkout = await createMerchCheckout(body, req);
    res.status(200).json(checkout);
  } catch (error) {
    sendMerchError(res, error);
  }
}
