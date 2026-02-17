import { sendRequest } from "../api/api.service";
import { endpoints } from "../api/endpoints";

export const woStatus = async (fromDate: string, toDate: string, assetIds: string) => {
    const url = `${endpoints.cmms.woStatus}?
    fromDate=${fromDate}
    &toDate=${toDate}
    &wo_asset_id=${assetIds}`;
    // console.log('url = ', url);
    return await sendRequest('POST', url);
}

export const woPriority = async (fromDate: string, toDate: string, assetIds: string) => {
    const url = `${endpoints.cmms.woPriority}?
    fromDate=${fromDate}
    &toDate=${toDate}
    &wo_asset_id=${assetIds}`;
    // console.log('url = ', url);
    return await sendRequest('POST', url);
}

export const monthlyCount = async (fromDate: string, toDate: string, assetIds: string) => {
    const url = `${endpoints.cmms.monthlyCount}?
    fromDate=${fromDate}
    &toDate=${toDate}
    &wo_asset_id=${assetIds}`;
    // console.log('url = ', url);
    return await sendRequest('POST', url);
}

export const plannedUnplanned = async (fromDate: string, toDate: string, assetIds: string) => {
    const url = `${endpoints.cmms.plannedUnplanned}?
    fromDate=${fromDate}
    &toDate=${toDate}
    &wo_asset_id=${assetIds}`;
    // console.log('url = ', url);
    return await sendRequest('POST', url);
}

export const woSummary = async (payload: any) => {
    const url = `${endpoints.cmms.woSummary}?
    fromDate=${payload.startDate}
    &toDate=${payload.endDate}
    &wo_asset_id=${payload.assetIds}`;
    // console.log('url = ', url);
    return await sendRequest('POST', url);
}

export const woPending = async (fromDate: string, toDate: string, assetIds: string) => {
    const url = `${endpoints.cmms.woPending}?
    fromDate=${fromDate}
    &toDate=${toDate}
    &wo_asset_id=${assetIds}`;
    // console.log('url = ', url);
    return await sendRequest('POST', url);
}