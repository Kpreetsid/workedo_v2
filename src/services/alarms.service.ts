import {  sendRequestDemo } from './api/api.service';
import { endpoints } from './api/endpoints';

export const alarmsHistory = async (payload: any) => {
    const url = `${endpoints.overview.alarmsHistory}`;
    return await sendRequestDemo('POST', url, payload);
};

export const alarmsSummary = async (payload: any) => {
    const url = `${endpoints.overview.alarmsSummary}`;
    return await sendRequestDemo('POST', url, payload);
};

export const alarmOverview = async (payload: any) => {
    const url = `${endpoints.alarms.overview}`;
    return await sendRequestDemo('POST', url, payload);
};

export const alarmEndpoints = async (payload: any) => {
    const url = `${endpoints.alarms.endpoints}`;
    return await sendRequestDemo('POST', url, payload);
};

export const alarmPlotData = async (payload: any) => {
    const url = `${endpoints.alarms.plotData}`;
    return await sendRequestDemo('POST', url, payload);
};

export const saveAlarmThreshold = async (payload: any) => {
    const url = `${endpoints.alarms.saveThreshold}`;
    return await sendRequestDemo('POST', url, payload);
};

export const setDynamicAlarmThreshold = async (payload: any) => {
    const url = `${endpoints.alarms.setDynamicThreshold}`;
    return await sendRequestDemo('POST', url, payload);
};
