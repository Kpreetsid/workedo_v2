
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

export const approveWorkRequest = async (id: string) => {
    return await sendRequest('PATCH', `${endpoints.workOrders.approveRequest}/${id}`, {status:  "Approved"});
};

export const rejectWorkRequest = async (id: string, remarks: string) => {
    return await sendRequest('PATCH', `${endpoints.workOrders.rejectRequest}/${id}`, {remarks: remarks});
};