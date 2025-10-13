import { sendRequest, sendRequestDemo } from '../api/api.service';
import { endpoints } from '../api/endpoints';

export const assetTree = async () => {
    const url = `${endpoints.asset.tree}`;
    return await sendRequest('POST', url, {});
};

export const getChildren = async (assetId: string) => {
    const url = `${endpoints.asset.children}?asset_id=${assetId}`;
    return await sendRequest('GET', url);
};

export const getAllEndpoints = async (payload: string[]) => {
    const url = `${endpoints.asset.asset_endpoints}`;
    console.log('final payload = ', { asset_id: payload });
    return await sendRequestDemo('POST', url, JSON.stringify({ asset_id: payload }));
};

export const getSingleAssetHealthHistory = async (assetId: string) => {
    var payload = { asset_id: assetId, end_date: null, start_date: null };
    const url = `${endpoints.asset.singleAssetHealthHistory}`;
    return await sendRequestDemo('POST', url, payload);
};

export const getGraphTrendData = async (payload: any) => {
    const url = `${endpoints.asset.graphData}`;
    return await sendRequestDemo("POST", url, payload);
};

export const getSensorConfig = async (payload: any) => {
    const url = `${endpoints.asset.sensorConfig}`;
    console.log('request url = get_device_config/ payload = ', url, payload);
    return await sendRequestDemo("POST", url, payload);
};