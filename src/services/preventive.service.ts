import { sendRequest } from "../api/api.service";
import { endpoints } from "../api/endpoints";

export const getUsers = async () => {
    const url = `${endpoints.preventive.users}`;
    return await sendRequest("GET", url);
};

export const createPreventive = async (data: any) => {
    const url = `${endpoints.preventive.create}`;
    return await sendRequest("POST", url, data);
};

export const getFilteredAssets = async (payload: any) => {
    const url = `${endpoints.preventive.getFilteredAssets}`;
    return await sendRequest("POST", url, payload);
};

export const getSOPs = async () => {
    const url = `${endpoints.preventive.getSOPs}`;
    return await sendRequest("GET", url);
};

export const getPreventives = async () => {
    const url = `${endpoints.preventive.preventives}`;
    return await sendRequest("GET", url);
};

export const toggleWorkOrderStatus = async (id: string, payload: any) => {
    console.log('payload item = ', payload);
    const url = `${endpoints.preventive.preventives}/${id}`;
    return await sendRequest("PUT", url, payload);
};