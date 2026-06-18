export type MonitoringMode = "default" | "custom";

export type MonitoringPhase =
  | "idle"
  | "connecting"
  | "connected"
  | "subscribed"
  | "waiting"
  | "success"
  | "timeout"
  | "error"
  | "disconnected";

export interface MonitoringBrokerConfig {
  mode: MonitoringMode;
  host: string;
  port: number;
  username: string;
  password: string;
  clientId: string;
}

export interface MonitoringMessageSnapshot {
  topic: string;
  data: string;
  qos: 0 | 1 | 2;
  retain: boolean;
}

export interface MonitoringSessionState {
  phase: MonitoringPhase;
  topics: string[];
  packetCount: number;
  lastMessageAt: string | null;
  lastTopic: string | null;
  lastPayloadPreview: string | null;
  errorMessage: string | null;
}
