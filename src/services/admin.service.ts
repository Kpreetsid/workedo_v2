import { sendRequest } from "./api/api.service";
import { endpoints } from "./api/endpoints";

export const getAdminUsers = async () => {
  return await sendRequest("GET", endpoints.admin.users);
};

export const updateAdminUser = async (id: string, payload: any) => {
  return await sendRequest("PUT", `${endpoints.admin.users}/${id}`, payload);
};

export const patchAdminUser = async (id: string, payload: any) => {
  return await sendRequest("PATCH", `${endpoints.admin.users}/${id}`, payload);
};

export const deleteAdminUser = async (id: string) => {
  return await sendRequest("DELETE", `${endpoints.admin.users}/${id}`);
};

export const getUserRolePermissions = async (userId: string) => {
  return await sendRequest("GET", `${endpoints.admin.roles}?user_id=${userId}`);
};

export const updateUserRolePermissions = async (roleId: string, payload: any) => {
  return await sendRequest("PUT", `${endpoints.admin.roles}/${roleId}`, payload);
};

export const getUserAssetMailPermissions = async (userId: string) => {
  return await sendRequest("GET", `${endpoints.admin.userAssets}?userId=${userId}&populate=assetId`);
};

export const updateAssetMailFlags = async (payload: any[]) => {
  return await sendRequest("POST", endpoints.admin.updateAssetMailFlags, payload);
};
