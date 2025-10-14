
import { sendRequest } from "../api/api.service";
import { endpoints } from "../api/endpoints";

export const createWorkOrder = async (payload: any) => {
    return await sendRequest('POST', `${endpoints.workOrders.createWorkOrder}`, payload);
};

export const getWorkRequests = async () => {
    return await sendRequest('GET', `${endpoints.workOrders.requests}?status=Open,Rejected,Approved`);
};

export const createWorkRequest = async (payload: any) => {
    return await sendRequest('POST', `${endpoints.workOrders.requests}`, payload);
};