import { sendRequest } from "./api/api.service";
import { endpoints } from "./api/endpoints";

export const getProcedures = async (params: {
  location_id?: string;
  asset_id?: string;
  search?: string;
} = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      searchParams.append(key, value);
    }
  });

  const query = searchParams.toString();
  const url = query ? `${endpoints.procedures.list}?${query}` : endpoints.procedures.list;
  return await sendRequest("GET", url);
};

export const getProcedure = async (id: string) => {
  return await sendRequest("GET", `${endpoints.procedures.list}/${id}`);
};

export const deleteProcedure = async (id: string) => {
  return await sendRequest("DELETE", `${endpoints.procedures.list}/${id}`);
};
