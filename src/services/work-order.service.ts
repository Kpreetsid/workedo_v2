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

export const getWorkOrderDetails = async (id: string) => {
    return await sendRequest('GET', `${endpoints.workOrders.workOrders}/${id}`);
}

export const updateWorkOrderStatus = async (id: string, payload: any) => {
    return await sendRequest('PUT', `${endpoints.workOrders.updateWorkOrder}/${id}`, payload);
};

export const postComments = async (id: string, payload: any) => {
    return await sendRequest('POST', `${endpoints.workOrders.workOrders}/${id}/${endpoints.workOrders.postComments}`, payload);
};

export const getWorkOrderComments = async (id: string) => {
    return await sendRequest('GET', `${endpoints.workOrders.workOrders}/${id}/${endpoints.workOrders.postComments}`);
};

export const deleteWorkOrderComment = async (workOrderID: string, commentID: string) => {
    return await sendRequest('DELETE', `${endpoints.workOrders.workOrders}/${workOrderID}/${endpoints.workOrders.postComments}/${commentID}`);
};