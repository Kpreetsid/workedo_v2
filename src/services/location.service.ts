import { sendRequest, sendRequestDemo } from '../api/api.service';
import { endpoints} from '../api/endpoints';

export const locationTree = async () => {
    const url = `${endpoints.location.tree}`;
    console.log('locations tree = ', url);
    return await sendRequest('GET', url);
};

export const topLevelAssets = async (location_id: string) => {
    const url = `${endpoints.location.topLevelAssets}?location_id=${location_id}&top_level=true`;
    return await sendRequest('GET', url);
}

export const assetsHealthLocation = async (payload: {org_id: string, asset_list: string[]}) => {
    const url = `${endpoints.location.assetsHealthLocation}`;
    return await sendRequestDemo('POST', url, payload);
}