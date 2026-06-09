import { sendRequest } from "./api/api.service";
import { endpoints } from "./api/endpoints";

export const createPart = async (payload: any) => {
    const url = `${endpoints.parts.createPart}`;
    return await sendRequest("POST", url, payload);
};

export const updatePart = async (id: string, qty: string) => {
    const url = `${endpoints.parts.createPart}/${id}`;
    return await sendRequest("PUT", url, { quantity: qty });
};

export const updatePartStock = async (id: string, payload: {
    mode: "add" | "remove" | "set" | "transfer";
    quantity: number;
    note: string;
    destination_part_id?: string;
}) => {
    const url = `${endpoints.parts.createPart}/${id}`;
    return await sendRequest("PATCH", url, payload);
};

export const updateFullPart = async (id: string, payload: any) => {
    const url = `${endpoints.parts.createPart}/${id}`;
    return await sendRequest("PUT", url, payload);
};

export const getParts = async (location_id?: string) => {
    let url = `${endpoints.parts.getParts}`;
    if (location_id) {
        url = `${endpoints.parts.getParts}?location_id=${location_id}`;
    }
    return await sendRequest("GET", url);
};

export const deletePart = async (id: string) => {
    const url = `${endpoints.parts.getParts}/${id}`;
    return await sendRequest("DELETE", url);
};

export const getPartById = async (id: string) => {
    const url = `${endpoints.parts.getParts}/${id}`;
    return await sendRequest("GET", url);
};

export const getPartHistory = async (id: string) => {
    const url = `${endpoints.parts.getParts}/${id}/history`;
    return await sendRequest("GET", url);
};

export const getPartTypes = async () => {
    const url = `${endpoints.parts.getPartTypes}`;
    return await sendRequest("GET", url);
};
