import { sendRequest } from "../api/api.service";
import { endpoints } from "../api/endpoints";

export const woStatus = async (fromDate: string, toDate: string, assetIds: string) => {
    const url = `${endpoints.cmms.woStatus}`;
    // console.log('url = ', url);
    let toSend = {
        fromDate: fromDate,
        toDate: toDate,
        wo_asset_id: assetIds
    }
    return await sendRequest('POST', url, toSend);
}

export const woPriority = async (fromDate: string, toDate: string, assetIds: string) => {
    const url = `${endpoints.cmms.woPriority}`;
    // console.log('url = ', url);
    let toSend = {
        fromDate: fromDate,
        toDate: toDate,
        wo_asset_id: assetIds
    }
    return await sendRequest('POST', url, toSend);
}

export const monthlyCount = async (fromDate: string, toDate: string, assetIds: string) => {
    const url = `${endpoints.cmms.monthlyCount}`;
    // console.log('url = ', url);
    let toSend = {
        fromDate: fromDate,
        toDate: toDate,
        wo_asset_id: assetIds
    }
    return await sendRequest('POST', url, toSend);
}

export const plannedUnplanned = async (fromDate: string, toDate: string, assetIds: string) => {
    const url = `${endpoints.cmms.plannedUnplanned}`;
    // console.log('url = ', url);
    let toSend = {
        fromDate: fromDate,
        toDate: toDate,
        wo_asset_id: assetIds
    }
    return await sendRequest('POST', url, toSend);
}

export const woSummary = async (payload: any) => {
    const url = `${endpoints.cmms.woSummary}`;
    // console.log('url = ', url);
    let toSend = {
        fromDate: payload.startDate,
        toDate: payload.endDate,
        wo_asset_id: payload.assetIds
    }
    
    return await sendRequest('POST', url, toSend);
}

export const woPending = async (fromDate: string, toDate: string, assetIds: string) => {
    const url = `${endpoints.cmms.woPending}`;
    // console.log('url = ', url);
    let toSend = {
        fromDate: fromDate,
        toDate: toDate,
        wo_asset_id: assetIds
    }
    return await sendRequest('POST', url, toSend);
}