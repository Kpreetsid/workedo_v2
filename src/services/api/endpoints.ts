
// src/services/api/endpoints.ts
import { appConfig } from "@/config/app.config";

export const endpoints = {
  baseURL: appConfig.urls.cmmsBase,
  ...appConfig.endpoints,
};
