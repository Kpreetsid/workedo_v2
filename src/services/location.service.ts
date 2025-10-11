import { sendRequest, sendRequestDemo } from '../api/api.service';
import { endpoints } from '../api/endpoints';

export const locationTree = async () => {
    const url = `${endpoints.location.tree}`;
    console.log('locations tree = ', url);
    return await sendRequest('GET', url);
};

export const topLevelAssets = async (location_id: string) => {
    const url = `${endpoints.location.topLevelAssets}?location_id=${location_id}&top_level=true`;
    return await sendRequest('GET', url);
}

export const assetsHealthLocation = async (payload: { org_id: string, asset_list: string[] }) => {
    const url = `${endpoints.location.assetsHealthLocation}`;
    return await sendRequestDemo('POST', url, payload);
}

export const fetchKPIFilterLocations = async () => {
    const url = `${endpoints.overview.kpi}`;
    return await sendRequest('GET', url);
}

export const fetchParentLocationDetails = async (data: any, type: string) => {
    let url = '';
    if (type === 'parent') {
        url = `${endpoints.overview.locationDetails}?parent_id=${data}`;
    } else {
        url = `${endpoints.overview.locationDetails}?locationId=${data}`;
    }
    console.log('url = ', url);
    return await sendRequest('GET', url);
}

export const childAssetsAgainstLocation = async (data: {levelOneLocations: string[], levelTwoLocations: string[]}) => {
    const url = `${endpoints.overview.childAssets}`;
    console.log('url = ', url);
    return await sendRequest('POST', url, data);
}

export const assetHealthKPIHistory = async (data: {org_id: string, asset_list: string[]}) => {
    const url = `${endpoints.overview.assetHealthKPIHistory}`;
    console.log('url = ', url);
    return await sendRequestDemo('POST', url, data);
}