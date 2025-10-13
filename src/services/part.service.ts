import { sendRequest } from "../api/api.service";
import { endpoints } from "../api/endpoints";

export const createPart = async (payload: any) => {
    const url = `${endpoints.parts.createPart}`;
    return await sendRequest("POST", url, payload);
};

export const getParts = async () => {
    const url = `${endpoints.parts.getParts}`;
    return await sendRequest("GET", url);
};