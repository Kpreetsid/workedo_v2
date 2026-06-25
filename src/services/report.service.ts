import { sendRequestDemo } from "./api/api.service";
import { endpoints } from "./api/endpoints";

export const reportOverview = async (payload: any) => {
  return await sendRequestDemo("POST", endpoints.reports.overview, payload);
};

export const reportCards = async (payload: any) => {
  return await sendRequestDemo("POST", endpoints.reports.cards, payload);
};

export const reportHealthList = async (payload: any) => {
  return await sendRequestDemo("POST", endpoints.reports.healthList, payload);
};

export const reportSensorUptime = async (payload: any) => {
  return await sendRequestDemo("POST", endpoints.reports.sensorUptime, payload);
};

export const requestReportDownload = async (payload: any) => {
  return await sendRequestDemo("POST", endpoints.reports.request, payload);
};

export const getReportTasks = async (payload: any) => {
  return await sendRequestDemo("POST", endpoints.reports.tasks, payload);
};
