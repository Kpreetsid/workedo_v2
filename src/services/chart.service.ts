import { sendRequestDemo } from "./api/api.service";
import { endpoints } from "./api/endpoints";

export const getAccelerationData = async (payload: any) => {
  const url = `${endpoints.asset.get_acceleration_data}`;
  return await sendRequestDemo("POST", url, payload);
};

export const getVelocityData = async (payload: any) => {
  const url = `${endpoints.asset.get_velocity_data}`;
  return await sendRequestDemo("POST", url, payload);
};

export const getDisplacementData = async (payload: any) => {
  const url = `${endpoints.asset.get_displacement_data}`;
  return await sendRequestDemo("POST", url, payload);
};

export const getEnvelopeData = async (payload: any) => {
  const url = `${endpoints.asset.get_envelope_data}`;
  return await sendRequestDemo("POST", url, payload);
};