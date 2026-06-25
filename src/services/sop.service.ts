import { sendRequest } from "./api/api.service";
import { endpoints } from "./api/endpoints";

export const getSopForms = async (params: { category?: string[]; location?: string[] } = {}) => {
  const searchParams = new URLSearchParams();

  if (params.category?.length) {
    searchParams.append("category", params.category.join(","));
  }

  if (params.location?.length) {
    searchParams.append("location", params.location.join(","));
  }

  const query = searchParams.toString();
  const url = query ? `${endpoints.forms.sops}?${query}` : endpoints.forms.sops;
  return await sendRequest("GET", url);
};

export const getSopForm = async (id: string) => {
  return await sendRequest("GET", `${endpoints.forms.sops}/${id}`);
};

export const deleteSopForm = async (id: string) => {
  return await sendRequest("DELETE", `${endpoints.forms.sops}/${id}`);
};

export const getSopCategories = async () => {
  return await sendRequest("GET", endpoints.forms.categories);
};
