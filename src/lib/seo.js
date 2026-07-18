export const SITE = {
  name: 'Risk Takers',
  url: 'https://risktakers.show',
  description:
    'Risk Takers is a live show and interview series about real-world AI adoption, cybersecurity, governance, and technology risk.',
  image: 'https://risktakers.show/og-risk-takers.svg',
  email: 'hello@risktakers.live',
  sameAs: []
};

const ensureTag = (selector, create) => {
  let tag = document.head.querySelector(selector);
  if (!tag) {
    tag = create();
    document.head.appendChild(tag);
  }
  return tag;
};

export const absoluteUrl = (path = '/') => {
  if (/^https?:\/\//i.test(path)) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${SITE.url}${cleanPath}`;
};

export const slugify = (value = '') =>
  value
    .toString()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90);

export const episodePath = (episode) => {
  if (!episode?.id) return '/episodes';
  const slug = slugify(episode.title || 'episode');
  return `/episodes/${slug}-${episode.id}`;
};

export const episodeIdFromSlug = (slug = '') => {
  // Supabase ids are UUIDs — they CONTAIN dashes, so "last dash-segment" (fine for the old dash-less
  // Base44 ids) truncated them and every /episodes/<slug>-<uuid> link 404'd. Extract a trailing UUID
  // first; fall back to the legacy last-segment for any old dashless links still out in the wild.
  const uuid = /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i.exec(slug);
  if (uuid) return uuid[1];
  const parts = slug.split('-');
  return parts[parts.length - 1] || '';
};

export const setSEO = ({
  title,
  description = SITE.description,
  path = '/',
  image = SITE.image,
  type = 'website',
  noindex = false,
  jsonLd = []
}) => {
  if (typeof document === 'undefined') return;

  const pageTitle = title ? `${title} | ${SITE.name}` : `${SITE.name} | AI, Cybersecurity, and Risk Shows`;
  const canonical = absoluteUrl(path);
  const shareImage = image || SITE.image;

  document.title = pageTitle;
  document.documentElement.lang = 'en';

  const meta = (name, content) => {
    const tag = ensureTag(`meta[name="${name}"]`, () => {
      const el = document.createElement('meta');
      el.setAttribute('name', name);
      return el;
    });
    tag.setAttribute('content', content);
  };

  const property = (name, content) => {
    const tag = ensureTag(`meta[property="${name}"]`, () => {
      const el = document.createElement('meta');
      el.setAttribute('property', name);
      return el;
    });
    tag.setAttribute('content', content);
  };

  meta('description', description);
  meta('robots', noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large');
  meta('twitter:card', 'summary_large_image');
  meta('twitter:title', pageTitle);
  meta('twitter:description', description);
  meta('twitter:image', shareImage);

  property('og:site_name', SITE.name);
  property('og:type', type);
  property('og:title', pageTitle);
  property('og:description', description);
  property('og:url', canonical);
  property('og:image', shareImage);

  const link = ensureTag('link[rel="canonical"]', () => {
    const el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    return el;
  });
  link.setAttribute('href', canonical);

  document.head.querySelectorAll('script[data-risk-takers-jsonld="true"]').forEach((el) => el.remove());
  jsonLd.filter(Boolean).forEach((item) => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.dataset.riskTakersJsonld = 'true';
    script.textContent = JSON.stringify(item);
    document.head.appendChild(script);
  });
};

export const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE.name,
  url: SITE.url,
  email: SITE.email,
  description: SITE.description,
  sameAs: SITE.sameAs
};

export const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE.name,
  url: SITE.url,
  description: SITE.description,
  publisher: {
    '@type': 'Organization',
    name: SITE.name,
    url: SITE.url
  }
};

export const episodeJsonLd = (episode, guests = []) => {
  const path = episodePath(episode);
  const isUpcoming = episode?.date && new Date(episode.date) >= new Date();
  const people = guests.map((guest) => ({
    '@type': 'Person',
    name: guest.name,
    jobTitle: guest.title,
    url: guest.linkedin_link
  }));

  const event = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: episode.title,
    description: episode.long_description || episode.description,
    startDate: episode.date,
    eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
    eventStatus: isUpcoming ? 'https://schema.org/EventScheduled' : 'https://schema.org/EventCompleted',
    location: {
      '@type': 'VirtualLocation',
      url: episode.linkedin_live_url || episode.event_registration_url || absoluteUrl(path)
    },
    organizer: {
      '@type': 'Organization',
      name: SITE.name,
      url: SITE.url
    },
    performer: people,
    url: absoluteUrl(path),
    image: episode.hero_image ? [episode.hero_image] : [SITE.image]
  };

  const video = (episode.youtube_link || episode.recording_url) && {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: episode.title,
    description: episode.description || episode.long_description,
    thumbnailUrl: episode.hero_image ? [episode.hero_image] : [SITE.image],
    uploadDate: episode.updated_date || episode.created_date || episode.date,
    embedUrl: episode.youtube_link?.includes('watch?v=')
      ? episode.youtube_link.replace('watch?v=', 'embed/')
      : episode.youtube_link,
    contentUrl: episode.recording_url,
    publisher: {
      '@type': 'Organization',
      name: SITE.name,
      url: SITE.url
    }
  };

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Risk Takers',
        item: SITE.url
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Episodes',
        item: absoluteUrl('/episodes')
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: episode.title,
        item: absoluteUrl(path)
      }
    ]
  };

  return [event, video, breadcrumb].filter(Boolean);
};