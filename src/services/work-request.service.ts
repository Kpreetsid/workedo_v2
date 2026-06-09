
import { sendRequest } from "./api/api.service";
import { endpoints } from "./api/endpoints";

export const createWorkOrder = async (payload: any) => {
    return await sendRequest('POST', `${endpoints.workOrders.createWorkOrder}`, payload);
};

export const getWorkRequests = async (statuses: string[] = ["Open", "Rejected", "Approved"]) => {
    const query = statuses.length ? `?status=${statuses.join(",")}` : "";
    return await sendRequest('GET', `${endpoints.workOrders.requests}${query}`);
};

export const createWorkRequest = async (payload: any) => {
    return await sendRequest('POST', `${endpoints.workOrders.requests}`, payload);
};

export const approveWorkRequest = async (id: string) => {
    return await sendRequest('PATCH', `${endpoints.workOrders.approveRequest}/${id}`, {});
};

export const rejectWorkRequest = async (id: string, remarks: string) => {
    return await sendRequest('PATCH', `${endpoints.workOrders.rejectRequest}/${id}`, {remarks: remarks});
};

export const deleteWorkRequest = async (id: string) => {
    return await sendRequest('DELETE', `${endpoints.workOrders.requests}/${id}`);
};

export const editWorkRequest = async (id: string, payload: any) => {
    return await sendRequest('PUT', `${endpoints.workOrders.requests}/${id}`, payload);
};

export const getWorkRequestDetails = async (id: string) => {
    return await sendRequest('GET', `${endpoints.workOrders.requests}/${id}`);
}
