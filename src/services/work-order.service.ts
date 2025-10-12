import { sendRequest } from "../api/api.service";
import { endpoints } from "../api/endpoints";

export const getWorkOrders = async (type: string) => {
    let url = '';
    if(type === 'todo') {
        url = `${endpoints.workOrders.workOrders}?status=Open&status=In-Progress&status=On-Hold`;
    } else if(type === 'done') {
        url = `${endpoints.workOrders.workOrders}?status=Completed`;
    }
    return await sendRequest('GET', url);
};

export const updateWorkOrderStatus = async (id: string, payload: any) => {
    return await sendRequest('PUT', `${endpoints.workOrders.updateWorkOrder}/${id}`, payload);
};