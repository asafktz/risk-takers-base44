// ── Event date/time: single source of truth for the website. ──
// To change the date/time everywhere on the site, edit ONLY this file.
// Two other places hold their own copy (update them when this changes):
//   • Email copy:    base44/functions/submitVendorApplication/entry.ts
//                    base44/functions/submitAIDefenseStackLead/entry.ts  (const EVENT)
//   • Calendar invite: Google Calendar event on asaf@linkedotter.com
export const EVENT = {
  dateLabel: 'Tuesday, September 1, 2026',
  shortDate: 'Sep 1, 2026',
  timeShort: '1 PM ET / 10 AM PT',
  timeLong: '8:00 PM Israel · 1:00 PM New York (ET) · 10:00 AM Los Angeles (PT)',
  // ISO 8601 with offset, for schema.org Event. 1 PM ET on Sep 1 = EDT (UTC-4).
  startISO: '2026-09-01T13:00:00-04:00',
  endISO: '2026-09-01T14:30:00-04:00'
};
