import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
  buildServicesInquiryEmail,
  normalizeServicesInquiry,
  SERVICES_EMAIL,
} from '../api/submitServicesInquiry.js';

test('services page is routed, discoverable, and indexable', async () => {
  const [app, navbar, footer, sitemap] = await Promise.all([
    readFile('src/App.jsx', 'utf8'),
    readFile('src/components/landing/Navbar.jsx', 'utf8'),
    readFile('src/components/landing/FooterCTA.jsx', 'utf8'),
    readFile('public/sitemap.xml', 'utf8'),
  ]);

  assert.match(app, /path="\/services"/);
  assert.match(navbar, /Services/);
  assert.match(footer, /to="\/services"/);
  assert.match(sitemap, /https:\/\/risktakers\.show\/services/);
});

test('services inquiry normalizes fields and rejects unknown services', () => {
  assert.deepEqual(normalizeServicesInquiry({
    name: '  Ada   Lovelace ',
    email: ' ADA@EXAMPLE.COM ',
    organization: ' Analytical   Engines ',
    service: 'Market research',
    details: '  Map the category.  ',
  }), {
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    organization: 'Analytical Engines',
    service: 'Market research',
    details: 'Map the category.',
  });

  assert.throws(() => normalizeServicesInquiry({
    name: 'Ada',
    email: 'ada@example.com',
    service: 'Something else',
    details: 'A request',
  }), /valid service/);
});

test('services email goes to Asaf and includes every visible form field', () => {
  const inquiry = normalizeServicesInquiry({
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    organization: 'Analytical Engines',
    service: 'Facilitated session',
    details: 'A private working session for our team.',
  });
  const email = buildServicesInquiryEmail(inquiry);

  assert.equal(SERVICES_EMAIL, 'asaf@risktakers.show');
  assert.equal(email.to, 'asaf@risktakers.show');
  assert.equal(email.replyTo, 'ada@example.com');
  assert.match(email.text, /Name: Ada Lovelace/);
  assert.match(email.text, /Email: ada@example\.com/);
  assert.match(email.text, /Organization: Analytical Engines/);
  assert.match(email.text, /Requested service: Facilitated session/);
  assert.match(email.text, /A private working session for our team\./);
});

test('services page only confirms a provider-accepted delivery', async () => {
  const page = await readFile('src/pages/Services.jsx', 'utf8');
  const endpoint = await readFile('api/submitServicesInquiry.js', 'utf8');

  assert.match(page, /data\?\.delivery\?\.sent/);
  assert.match(endpoint, /if \(!delivery\?\.sent\)/);
  assert.match(endpoint, /error\.status = 502/);
});
