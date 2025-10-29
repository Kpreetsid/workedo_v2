import { sendRequest, sendRequestDemo, sendRequestValidate } from '../api/api.service';
import { endpoints } from '../api/endpoints';

export const alarmsHistory = async (payload: any) => {
    const url = `${endpoints.overview.alarmsHistory}`;
    return await sendRequestDemo('POST', url, payload);
};