import development from './development';
import production from './production';

const APP_ENV = process.env.EXPO_PUBLIC_APP_ENV || process.env.APP_ENV || 'development';

const rawConfig = APP_ENV === 'production' ? production : development;

const Config = {
  cmmsBase: rawConfig.CMMS_API,
  cmmsApi: rawConfig.CMMS_API.endsWith('/') ? rawConfig.CMMS_API + 'api/' : rawConfig.CMMS_API + '/api/',
  processorApi: rawConfig.PROCESSOR_API,
  validateApi: rawConfig.VALIDATE_API,
  fallbackAssetImage: rawConfig.FALLBACK_ASSET_IMAGE,
};

export default Config;
