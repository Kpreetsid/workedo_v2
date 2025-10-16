import { deleteEndpoint } from "../services/asset.service";

// src/api/endpoints.ts
export const endpoints = {
  baseURL: 'https://new.presageinsights.ai/cmms_express/',
  auth: {
    login: 'users/login',
    details: 'users/',
    logout: '/',
    profile: 'users/profile',
  },
  overview: {
    kpi: 'master/locations/kpi-filter',
    locationDetails: 'master/locations',
    childAssets: 'master/locations/child-assets',
    assetHealthKPIHistory: 'get_asset_health_kpi_summary/'
  },
  parts: {
    createPart: 'master/parts',
    getParts: 'master/parts'
  },
  preventive: {
    users: 'master/users',
    create: 'master/schedulers',
    getFilteredAssets: 'master/assets/filter',
    getSOPs: 'master/sops',
    preventives: 'master/schedulers'
  },
  location: {
    tree: 'master/locations/tree',
    get: 'master/locations',
    topLevelAssets: 'master/assets',
    assetsHealthLocation: 'get_asset_health_location_api/'
  },
  asset: {
    tree: 'master/assets/tree',
    children: 'asset_master/get_children',
    asset_endpoints: 'getAllEndPoints/',
    singleAssetHealthHistory: 'single_asset_health_history/',
    graphData: 'get_function_trend_data_v2/',
    sensorConfig: 'get_device_config/',
    bearingDetails: 'get_bearing_details/',
    createEndpoint: 'endPointApi/',
    updateEndpoint: 'update_endpoint/',
    deleteEndpoint: 'deleteEndPointApi/'
  },
  workOrders: {
    workOrders: 'work/orders',
    updateWorkOrder: 'work/orders/status',
    createWorkOrder: 'work/orders',
    requests: 'work/requests',
    approveRequest: 'work/requests/approve',
    rejectRequest: 'work/requests/reject'
  },
  gateways: {
    sensorsList: 'master/locations/sensor-list',
    get: 'get_gateway_list/',
    validate: 'validate_sensor/',
    save: 'save_gateway_devices/'
  }
};