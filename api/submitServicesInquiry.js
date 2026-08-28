import { handler, sendEmail } from './_lib.js';

export const SERVICES_EMAIL = 'asaf@risktakers.show';

export const SERVICE_OPTIONS = new Set([
  'Specific content creation',
  'Market research',
  'Facilitated session',
]);

const cleanText = (value, maxLength) => String(value || '').trim().replace(/\s+/g, ' ').slice(0, maxLength);

export function normalizeServicesInquiry(body = {}) {
  const inquiry = {
    name: cleanText(body.name, 120),
    email: cleanText(body.email, 254).toLowerCase(),
    organization: cleanText(body.organization, 160),
    service: cleanText(body.service, 80),
    details: String(body.details || '').trim().slice(0, 5000),
  };

  if (!inquiry.name || !inquiry.email || !inquiry.service || !inquiry.details) {
    const error = new Error('Missing required fields');
    error.status = 400;
    throw error;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inquiry.email)) {
    const error = new Error('Enter a valid email address');
    error.status = 400;
    throw error;
  }
  if (!SERVICE_OPTIONS.has(inquiry.service)) {
    const error = new Error('Choose a valid service');
    error.status = 400;
    throw error;
  }

  return inquiry;
}

export function buildServicesInquiryEmail(inquiry) {
  return {
    to: SERVICES_EMAIL,
    replyTo: inquiry.email,
    subject: `Services inquiry: ${inquiry.service} - ${inquiry.name}`,
    text: [
      'New Risk Takers services inquiry',
      '',
      'Source: /services',
      `Name: ${inquiry.name}`,
      `Email: ${inquiry.email}`,
      `Organization: ${inquiry.organization || '(not provided)'}`,
      `Requested service: ${inquiry.service}`,
      '',
      'Request details:',
      inquiry.details,
    ].join('\n'),
  };
}

export default handler(async (body) => {
  const inquiry = normalizeServicesInquiry(body);
  const delivery = await sendEmail(buildServicesInquiryEmail(inquiry));

  if (!delivery?.sent) {
    console.error('services_inquiry_email_failure', JSON.stringify({
      recipient: SERVICES_EMAIL,
      status: delivery?.status || null,
      code: delivery?.error?.name || delivery?.error?.code || 'unknown_error',
    }));
    const error = new Error('Unable to deliver inquiry');
    error.status = 502;
    throw error;
  }

  return { success: true, delivery: { sent: true, id: delivery.id } };
});
