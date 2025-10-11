// src/api/endpoints.ts
export const endpoints = {
  baseURL: 'https://new.presageinsights.ai/cmms_express/',
  auth: {
    login: 'users/login',
    details: 'users/',
    logout: '/',
    profile: 'users/profile',
  },
  location: {
    tree: 'master/locations/tree',
    kpiFitler: 'location_master/getKPIFilterLocations',
    topLevelAssets: 'master/assets',
    assetsHealthLocation: 'get_asset_health_location_api/'
  },
  asset: {
    tree: 'master/assets/tree',
    children: 'asset_master/get_children',
    asset_endpoints: 'getAllEndPointsMobile/',
    singleAssetHealthHistory: 'single_asset_health_history/'
  }
};