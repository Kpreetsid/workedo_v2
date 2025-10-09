import { sendRequest, sendRequestDemo } from '../api/api.service';
import { endpoints } from '../api/endpoints';

export const assetTree = async (payload: Record<string, any>) => {
    const url = `${endpoints.asset.tree}?accountId=${payload.account_id}&user_id=${payload.user_id}`;
    return await sendRequest('GET', url);
};

export const getChildren = async (assetId: string) => {
    const url = `${endpoints.asset.children}?asset_id=${assetId}`;
    return await sendRequest('GET', url);
};

export const getAllEndpoints = async (payload: string[]) => {
    const url = `${endpoints.asset.asset_endpoints}`;
    console.log('final payload = ', { asset_id: payload });
    return await sendRequestDemo('POST', url, JSON.stringify({ asset_id: payload }), {
        headers: { 'Content-Type': 'application/json' },
    });
};

export const getSingleAssetHealthHistory = async (assetId: string) => {
    var payload = { asset_id: assetId }
    const url = `${endpoints.asset.singleAssetHealthHistory}`;
    return await sendRequestDemo('POST', url, payload);
};