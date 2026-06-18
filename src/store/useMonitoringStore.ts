import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { storage } from "@/src/storage/mmkv";
import { MonitoringMode, MonitoringSessionState } from "@/src/types/monitoring";

export interface MonitoringDraftState {
  mode: MonitoringMode;
  macId: string;
  host: string;
  port: string;
  username: string;
  password: string;
}

interface MonitoringStore extends MonitoringDraftState {
  session: MonitoringSessionState;
  setDraftField: (key: keyof MonitoringDraftState, value: string) => void;
  setMode: (mode: MonitoringMode) => void;
  setSession: (session: Partial<MonitoringSessionState>) => void;
  resetSession: () => void;
}

const defaultSessionState: MonitoringSessionState = {
  phase: "idle",
  topics: [],
  packetCount: 0,
  lastMessageAt: null,
  lastTopic: null,
  lastPayloadPreview: null,
  errorMessage: null,
};

const defaultDraftState: MonitoringDraftState = {
  mode: "default",
  macId: "",
  host: "",
  port: "",
  username: "",
  password: "",
};

export const useMonitoringStore = create<MonitoringStore>()(
  persist(
    (set) => ({
      ...defaultDraftState,
      session: defaultSessionState,

      setDraftField: (key, value) =>
        set((state) => ({
          ...state,
          [key]: value,
        })),

      setMode: (mode) =>
        set((state) => ({
          ...state,
          mode,
          ...(mode === "custom"
            ? {
                host: "",
                port: "",
                username: "",
                password: "",
              }
            : {}),
        })),

      setSession: (session) =>
        set((state) => ({
          session: {
            ...state.session,
            ...session,
          },
        })),

      resetSession: () =>
        set(() => ({
          session: defaultSessionState,
        })),

    }),
    {
      name: "sensor-monitor-storage",
      storage: createJSONStorage(() => ({
        setItem: (name, value) => storage.set(name, value),
        getItem: (name) => storage.getString(name) ?? null,
        removeItem: (name) => storage.delete(name),
      })),
      partialize: (state) => ({
        mode: state.mode,
        macId: state.macId,
        host: state.host,
        port: state.port,
        username: state.username,
        password: state.password,
      }),
    }
  )
);
