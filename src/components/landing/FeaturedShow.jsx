import React from 'react';
import { Link } from 'react-router-dom';
import TornPaper from '../TornPaper';
import { Calendar, Clock, Radio, ArrowRight, Linkedin } from 'lucide-react';

/**
 * FeaturedShow — the homepage slot for the current live Risk Takers show, hosted on
 * Showrunner (registration -> live -> replay). Styled to match the rest of the site
 * (torn-paper headers, #1F1F1F borders, red accent).
 *
 * Showrunner app:  https://webinar-show.vercel.app
 * Event slug:      building-resilient-systems-insig-s1pc
 *   "Unpopular Opinion: Using AI to Cut Headcount Is Playing Small" — with Joshua Copeland
 *
 * The banner is composed from Showrunner's stored, background-removed assets (a clean guest
 * cutout + the on-brand AI background) served from the stable /api/file endpoint, with the
 * title/date drawn here as real HTML — so the text never overflows or collides the way the
 * baked-in PNG banner did.
 *
 * The "Save my spot" CTA routes to the on-site /Join page (which embeds the Showrunner signup),
 * so visitors stay on risktakers.show and the sr.js pixel attributes them.
 */

const SHOWRUNNER_ORIGIN = 'https://webinar-show.vercel.app';
const EVENT_SLUG = 'building-resilient-systems-insig-s1pc';
const FILE_BASE = `${SHOWRUNNER_ORIGIN}/api/file/${EVENT_SLUG}/banners`;

const BANNER_BG = `${FILE_BASE}/bg-1781533968437.png`; // on-brand dark/red AI background
const GUEST_CUTOUT = `${FILE_BASE}/cut-0-1781533968437.png`; // Joshua Copeland, background removed (transparent PNG)
const LINKEDIN_EVENT_URL = 'https://www.linkedin.com/events/7472673999731347456/';

export default function FeaturedShow() {
  return null;











































































































}