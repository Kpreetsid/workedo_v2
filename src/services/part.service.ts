import { sendRequest } from "../api/api.service";
import { endpoints } from "../api/endpoints";

export const createPart = async (payload: any) => {
    const url = `${endpoints.parts.createPart}`;
    return await sendRequest("POST", url, payload);
};

export const updatePart = async (id: string, qty: string) => {
    const url = `${endpoints.parts.createPart}/${id}`;
    return await sendRequest("PUT", url, { quantity: qty });
};

export const getParts = async () => {
    const url = `${endpoints.parts.getParts}`;
    return await sendRequest("GET", url);
};