import { sendRequest } from "./api/api.service";
import { endpoints } from "./api/endpoints";

export const getWorkOrderTemplates = async (params: {
  search?: string;
  maintenance_type?: string;
} = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      searchParams.append(key, value);
    }
  });

  const query = searchParams.toString();
  const url = query ? `${endpoints.workOrderTemplates.list}?${query}` : endpoints.workOrderTemplates.list;
  return await sendRequest("GET", url);
};

export const getWorkOrderTemplate = async (id: string) => {
  return await sendRequest("GET", `${endpoints.workOrderTemplates.list}/${id}`);
};

export const deleteWorkOrderTemplate = async (id: string) => {
  return await sendRequest("DELETE", `${endpoints.workOrderTemplates.list}/${id}`);
};
