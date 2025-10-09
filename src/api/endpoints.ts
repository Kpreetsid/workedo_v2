// src/api/endpoints.ts
export const endpoints = {
  auth: {
    login: 'users/login',
    details: 'users/',
    logout: '/',
    profile: 'users/profile',
  },
  location: {
    tree: 'master/locations/tree',
    kpiFitler: 'location_master/getKPIFilterLocations',
    topLevelAssets: 'location_master/getTopLevelAssets',
    assetsHealthLocation: 'get_asset_health_location_api/'
  },
  asset: {
    tree: 'asset_master/getAssetsTree',
    children: 'asset_master/get_children',
    asset_endpoints: 'getAllEndPointsMobile/',
    singleAssetHealthHistory: 'single_asset_health_history/'
  }
};