
// src/api/endpoints.ts
export const endpoints = {
  baseURL: 'https://new.presageinsights.ai/cmms_express/',
  // baseURL: 'https://app.presageinsights.ai/cmms_express/',
  auth: {
    login: 'users/login',
    details: 'users/',
    logout: '/',
    profile: 'users/profile',
    verifyOTP: 'registration/verifyOTP',
    resetPassword: 'reset-password/send-verification-email',
    verifyOTPResetPassword: 'reset-password/verify-otp',
    changePassword: 'reset-password/change-password',
  },
  cmms: {
    woStatus: 'work/orders/status',
    woPriority: 'work/orders/priority',
    monthlyCount: 'work/orders/monthly-count',
    plannedUnplanned: 'work/orders/planned-unplanned',
    woSummary: 'work/orders/summary',
    woPending: 'work/orders/pending'
  },
  user: {
    uploadProfileImage: 'upload/user_profile_img',
    updateUser: 'master/users',
    profile: 'master/users',
  },
  overview: {
    kpi: 'master/locations/kpi-filter',
    locationDetails: 'master/locations',
    childAssets: 'master/locations/child-assets',
    assetHealthKPIHistory: 'get_asset_health_kpi_summary/',
    alarmsHistory: 'get_alarm_history_data/',
    alarmsSummary: 'get_alarm_history_summary/',
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
    createNewLocation: 'master/locations',
    tree: 'master/locations/tree',
    get: 'master/locations',
    topLevelAssets: 'master/assets',
    assetsHealthLocation: 'get_asset_health_location_api/',
    mapUserToLocations: 'map/userToLocations',
    uploadImage: 'upload/locations',
    copy: 'master/locations/make-copy'
  },
  asset: {
    add: 'master/assets/old',
    edit: 'master/assets/old-edit',
    userToAssets: 'map/userToAssets',
    assetData: 'master/assets',
    tree: 'master/assets/tree',
    children: 'asset_master/get_children',
    asset_endpoints: 'getAllEndPoints/',
    singleAssetHealthHistory: 'single_asset_health_history/',
    graphData: 'get_function_trend_data_v2/',
    sensorConfig: 'get_device_config/',
    bearingDetails: 'get_bearing_details/',
    createEndpoint: 'endPointApi/',
    updateEndpoint: 'update_endpoint/',
    deleteEndpoint: 'deleteEndPointApi/',
    assetHealthStatus: 'asset_health_status_summary/',
    copy: 'master/assets/make-copy',
    get_acceleration_data: 'get_acceleration_data/',
    get_velocity_data: 'get_velocity_data/',
    get_displacement_data: 'get_displacement_data/',
    
    get_envelope_data: 'get_envelope_data/',
    addSensor: 'add_sensor/',
    uploadImage: 'upload/assets',
    envelopePlay: 'envelope_play/'
  },
  workOrders: {
    workOrders: 'work/orders',
    updateWorkOrder: 'work/orders/status',
    createWorkOrder: 'work/orders',
    requests: 'work/requests',
    approveRequest: 'work/requests/approve',
    rejectRequest: 'work/requests/reject',
    postComments: 'comments',
    uploadImage: 'upload/work_request'
  },
  gateways: {
    sensorsList: 'master/locations/sensor-list',
    get: 'get_gateway_list/',
    validate: 'validate_sensor/',
    save: 'save_gateway_devices/'
  }
};