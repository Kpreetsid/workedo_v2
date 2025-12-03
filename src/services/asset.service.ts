import { sendRequest, sendRequestDemo, sendRequestValidate } from '../api/api.service';
import { endpoints } from '../api/endpoints';

export const assetTree = async () => {
    const url = `${endpoints.asset.tree}`;
    return await sendRequest('POST', url, {});
};

export const getChildren = async (assetId: string) => {
    const url = `${endpoints.asset.children}?asset_id=${assetId}`;
    return await sendRequest('GET', url);
};

export const getAssetData = async (assetId: string) => {
    const url = `${endpoints.asset.assetData}/${assetId}`;
    return await sendRequest('GET', url);
}

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

export const getBearingDetails = async (payload: any) => {
    const url = `${endpoints.asset.bearingDetails}`;
    return await sendRequestValidate("POST", url, payload);
};

export const createEndpoint = async (payload: any) => {
    const url = `${endpoints.asset.createEndpoint}`;
    return await sendRequestDemo("POST", url, payload);
};

export const updateEndpoint = async (payload: any) => {
    const url = `${endpoints.asset.updateEndpoint}`;
    return await sendRequestDemo("PATCH", url, payload);
};

export const deleteEndpoint = async (id: string) => {
    const url = `${endpoints.asset.deleteEndpoint}/${id}`;
    return await sendRequestDemo("DELETE", url);
};

export const assetHealthStatus = async (payload: any) => {
    const url = `${endpoints.asset.assetHealthStatus}`;
    return await sendRequestDemo('POST', url, payload);
};

export const createNewAsset = async (payload: any) => {
    const url = `${endpoints.asset.add}`;
    return await sendRequest('POST', url, payload);
}

export const singleAssetData = async (assetId: string) => {
    const url = `${endpoints.asset.assetData}/${assetId}`;
    return await sendRequest('GET', url);
}

export const deleteAsset = async (assetId: string) => {
    const url = `${endpoints.asset.assetData}/${assetId}`;
    return await sendRequest('DELETE', url);
}

export const copyAsset = async (id: string) => {
	const url = `${endpoints.asset.copy}/${id}`;
	return await sendRequest('GET', url);
}