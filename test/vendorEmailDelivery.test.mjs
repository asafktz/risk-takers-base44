import assert from 'node:assert/strict';
import test from 'node:test';
import { buildVendorApplicantEmail, VENDOR_PACK_URL } from '../api/submitVendorApplication.js';

test('vendor applicant email includes the current event and information pack', () => {
  const email = buildVendorApplicantEmail({
    name: 'Ada Lovelace',
    company: 'Analytical Engines',
    applicationId: 'application-123',
  });

  assert.equal(email.subject, 'Your AI Defense Stack Day vendor information pack');
  assert.equal(email.replyTo, 'vendors@risktakers.show');
  assert.equal(email.idempotencyKey, 'vendor-pack-application-123');
  assert.deepEqual(email.attachments, [{
    filename: 'AI-Defense-Stack-Day-Vendor-Information-Pack.pdf',
    path: VENDOR_PACK_URL,
  }]);
  assert.match(email.html, /Tuesday, September 1, 2026/);
  assert.match(email.html, /download it here/);
  assert.match(email.html, new RegExp(VENDOR_PACK_URL.replaceAll('.', '\\.')));
});

test('Resend payload uses the authenticated Risk Takers sender and preserves failures', async () => {
  const previousKey = process.env.RESEND_API_KEY;
  const previousFrom = process.env.RESEND_FROM;
  const previousFetch = globalThis.fetch;
  process.env.RESEND_API_KEY = 're_test_key';
  delete process.env.RESEND_FROM;

  try {
    const { FROM, sendEmail } = await import(`../api/_lib.js?test=${Date.now()}`);
    assert.equal(FROM, 'Risk Takers <vendors@risktakers.show>');

    let request;
    globalThis.fetch = async (url, options) => {
      request = { url, options };
      return new Response(JSON.stringify({ id: 'email-123' }), { status: 200 });
    };

    const sent = await sendEmail({
      to: 'applicant@example.com',
      subject: 'Pack',
      html: '<p>Pack</p>',
      replyTo: 'vendors@risktakers.show',
      attachments: [{ filename: 'pack.pdf', path: VENDOR_PACK_URL }],
      idempotencyKey: 'vendor-pack-123',
    });

    assert.deepEqual(sent, { sent: true, id: 'email-123' });
    assert.equal(request.url, 'https://api.resend.com/emails');
    assert.equal(request.options.headers['Idempotency-Key'], 'vendor-pack-123');
    assert.deepEqual(JSON.parse(request.options.body), {
      from: 'Risk Takers <vendors@risktakers.show>',
      to: 'applicant@example.com',
      subject: 'Pack',
      html: '<p>Pack</p>',
      reply_to: 'vendors@risktakers.show',
      attachments: [{ filename: 'pack.pdf', path: VENDOR_PACK_URL }],
    });

    globalThis.fetch = async () => new Response(JSON.stringify({ name: 'validation_error', message: 'Domain is not verified' }), { status: 403 });
    const failed = await sendEmail({ to: 'applicant@example.com', subject: 'Pack' });
    assert.deepEqual(failed, {
      sent: false,
      status: 403,
      error: { name: 'validation_error', message: 'Domain is not verified' },
    });

    globalThis.fetch = async () => { throw new Error('socket closed'); };
    const unavailable = await sendEmail({ to: 'applicant@example.com', subject: 'Pack' });
    assert.deepEqual(unavailable, {
      sent: false,
      error: { code: 'resend_request_failed', message: 'socket closed' },
    });
  } finally {
    globalThis.fetch = previousFetch;
    if (previousKey === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = previousKey;
    if (previousFrom === undefined) delete process.env.RESEND_FROM;
    else process.env.RESEND_FROM = previousFrom;
  }
});
