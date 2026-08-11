// ── Event date/time: single source of truth for the website. ──
// To change the date/time everywhere on the site, edit ONLY this file.
// Two other places hold their own copy (update them when this changes):
//   • Email copy:    base44/functions/submitVendorApplication/entry.ts
//                    base44/functions/submitAIDefenseStackLead/entry.ts  (const EVENT)
//   • Calendar invite: Google Calendar event on asaf@linkedotter.com
export const EVENT = {
  dateLabel: 'Wednesday, September 23, 2026',
  shortDate: 'Sep 23, 2026',
  timeShort: '12 PM ET / 9 AM PT / 7 PM Israel',
  timeLong: '7:00 PM Israel · 12:00 PM New York (ET) · 9:00 AM Los Angeles (PT)',
  // ISO 8601 with offset, for schema.org Event. 12 PM ET on Sep 23 = EDT (UTC-4).
  startISO: '2026-09-23T12:00:00-04:00',
  endISO: '2026-09-23T13:30:00-04:00'
};
