import { sendRequest } from "./api/api.service";
import { endpoints } from "./api/endpoints";

export const getInspections = async () => {
  return await sendRequest("GET", endpoints.inspections.list);
};

export const getInspection = async (id: string) => {
  return await sendRequest("GET", `${endpoints.inspections.list}/${id}`);
};

export const deleteInspection = async (id: string) => {
  return await sendRequest("DELETE", `${endpoints.inspections.list}/${id}`);
};
