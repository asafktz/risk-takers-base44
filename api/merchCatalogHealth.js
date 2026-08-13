import {
  fetchFourthwallCatalog,
  getConfigurationStatus,
  getMerchServerConfig,
  isAdminAuthorized,
  reconcileFourthwallCatalog,
  sendMerchError,
} from './_merch.js';

export default async function merchCatalogHealth(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const config = getMerchServerConfig();
  if (!config.adminToken) {
    res.status(503).json({ error: 'Merch health authorization is not configured', code: 'MERCH_ADMIN_NOT_CONFIGURED' });
    return;
  }
  if (!isAdminAuthorized(req, config)) {
    res.status(401).json({ error: 'Unauthorized', code: 'MERCH_ADMIN_AUTH_REQUIRED' });
    return;
  }

  res.setHeader('Cache-Control', 'private, no-store');
  try {
    const configuration = getConfigurationStatus(config);
    if (!configuration.platformCredentials) {
      res.status(503).json({
        ok: false,
        mode: config.mode,
        configuration,
        checkedAt: new Date().toISOString(),
      });
      return;
    }

    const catalog = await fetchFourthwallCatalog(config);
    const reconciliation = reconcileFourthwallCatalog(catalog, config);
    res.status(reconciliation.healthy && configuration.missingForMode.length === 0 ? 200 : 503).json({
      ok: reconciliation.healthy && configuration.missingForMode.length === 0,
      mode: config.mode,
      configuration,
      reconciliation,
      checkedAt: new Date().toISOString(),
    });
  } catch (error) {
    sendMerchError(res, error);
  }
}
