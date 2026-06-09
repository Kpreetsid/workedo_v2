import { sendRequest, sendRequestDemo, sendRequestValidate } from "./api/api.service";
import { endpoints } from "./api/endpoints";

export const getSensorsList = async () => {
    const url = `${endpoints.gateways.sensorsList}`;
    return await sendRequest("GET", url);
}

export const getGateways = async (payload: any) => {
    const url = `${endpoints.gateways.get}`;
    return await sendRequestDemo("POST", url, payload);
};

export const sensorValidation = async (payload: any) => {
    const url = `${endpoints.gateways.validate}`;
    return await sendRequestValidate("POST", url, payload);
};

export const saveGateway = async (payload: any) => {
    const url = `${endpoints.gateways.save}`;
    return await sendRequestDemo("POST", url, payload);
};

export const deleteGateway = async (payload: any) => {
    const url = `${endpoints.gateways.save}`;
    return await sendRequestDemo("DELETE", url, payload);
};

export const getLocationById = async (id: any) => {
    const url = `${endpoints.location.get}/${id}`;
    return await sendRequest("GET", url);
};