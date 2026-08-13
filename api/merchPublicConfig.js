import {
  buildSafePublicConfig,
  fetchFourthwallCatalog,
  getMerchServerConfig,
  getConfigurationStatus,
  isPrivateTestAuthorized,
} from './_merch.js';

export default async function merchPublicConfig(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const config = getMerchServerConfig();
  const privateAuthorized = config.mode === 'private_test' && isPrivateTestAuthorized(req, config);
  const mayLoadCommerce = config.mode === 'live' || privateAuthorized;
  const configuration = getConfigurationStatus(config);
  const commerceConfigured = configuration.missingForMode.length === 0;
  let catalog = null;

  if (mayLoadCommerce && commerceConfigured) {
    try {
      catalog = await fetchFourthwallCatalog(config);
    } catch (error) {
      // The public configuration must fail closed to waitlist if Fourthwall is
      // unavailable. Provider errors and internal identifiers stay server-side.
      console.error('Could not load live merch catalog', { code: error?.code || 'unknown' });
    }
  }

  // Anonymous responses are identical and safe to cache at the CDN. Combined
  // with server-instance coalescing this prevents a page-view burst from
  // turning into seven privileged Platform API calls per visitor.
  res.setHeader('Cache-Control', privateAuthorized
    ? 'private, no-store'
    : 'public, max-age=0, s-maxage=30, stale-while-revalidate=120');
  res.status(200).json(buildSafePublicConfig({
    config,
    catalog,
    privateAuthorized,
  }));
}
