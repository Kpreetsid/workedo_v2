import { MonitoringBrokerConfig, MonitoringMessageSnapshot } from "@/src/types/monitoring";

export interface MonitoringClientHandle {
  disconnect: () => void;
}

interface MqttClient {
  on(event: "closed", cb: (msg: string) => void): void;
  on(event: "error", cb: (msg: string) => void): void;
  on(event: "message", cb: (msg: MonitoringMessageSnapshot) => void): void;
  on(event: "connect", cb: (msg: { reconnect: boolean }) => void): void;
  connect: () => void;
  disconnect: () => void;
  subscribe: (topic: string, qos: 0 | 1 | 2) => void;
}

interface MqttModule {
  createClient: (options: {
    clientId: string;
    uri: string;
    host?: string;
    port?: number;
    protocol?: "mqtt" | "tcp" | "wss" | "mqtts" | "ws";
    tls?: boolean;
    certificate?: string;
    certificatePass?: string;
    ca?: string;
    keepalive?: number;
    clean?: boolean;
    auth?: boolean;
    user?: string;
    pass?: string;
    automaticReconnect?: boolean;
  }) => Promise<MqttClient>;
  removeClient?: (client: MqttClient) => void;
}

const MQTT_MODULE_NAME = "sp-react-native-mqtt";

const resolveMqttModule = (): MqttModule => {
  try {
    const requiredModule = require(MQTT_MODULE_NAME);
    return requiredModule?.default || requiredModule;
  } catch (error) {
    throw new Error(
      "The MQTT client package is missing. Install sp-react-native-mqtt, rebuild the Android app, and try again."
    );
  }
};

export const buildWiredTopics = (macId: string) => {
  const trimmedMacId = macId.trim();
  return [`wired/rms/${trimmedMacId}`, `wired/rawdata/${trimmedMacId}`];
};

export const buildBleTopics = (macId: string) => {
  const trimmedMacId = macId.trim();
  return [`raw/ble/${trimmedMacId}`, `rms/ble/${trimmedMacId}`];
};

export const normalizePayloadPreview = (payload: string) => {
  if (!payload) return "";
  return payload.length > 320 ? `${payload.slice(0, 320)}...` : payload;
};

export const createMonitoringBrokerConfig = (input: MonitoringBrokerConfig): MonitoringBrokerConfig => ({
  ...input,
  host: input.host.trim(),
  username: input.username.trim(),
  password: input.password.trim(),
});

const startMonitorSession = async (
  config: MonitoringBrokerConfig,
  topics: string[],
  callbacks: {
    onConnected: () => void;
    onSubscribed: (topics: string[]) => void;
    onMessage: (message: MonitoringMessageSnapshot) => void;
    onClosed: () => void;
    onError: (message: string) => void;
  }
): Promise<MonitoringClientHandle> => {
  const mqtt = resolveMqttModule();
  const protocol = config.tls ? "mqtts" : "mqtt";
  const uri = `${protocol}://${config.host}:${config.port}`;

  const client = await mqtt.createClient({
    clientId: config.clientId,
    uri,
    host: config.host,
    port: config.port,
    protocol,
    tls: Boolean(config.tls),
    certificate: config.certificate,
    certificatePass: config.certificatePass,
    ca: config.ca,
    keepalive: 30,
    clean: true,
    auth: Boolean(config.username || config.password),
    user: config.username,
    pass: config.password,
    automaticReconnect: false,
  });

  client.on("error", (message) => {
    callbacks.onError(String(message || "Unable to connect to the MQTT broker."));
  });

  client.on("closed", () => {
    callbacks.onClosed();
  });

  client.on("message", (message) => {
    callbacks.onMessage(message);
  });

  client.on("connect", () => {
    callbacks.onConnected();
    topics.forEach((topic) => client.subscribe(topic, 0));
    callbacks.onSubscribed(topics);
  });

  client.connect();

  return {
    disconnect: () => {
      try {
        client.disconnect();
      } finally {
        mqtt.removeClient?.(client);
      }
    },
  };
};

export const startWiredMonitorSession = async (
  config: MonitoringBrokerConfig,
  macId: string,
  callbacks: {
    onConnected: () => void;
    onSubscribed: (topics: string[]) => void;
    onMessage: (message: MonitoringMessageSnapshot) => void;
    onClosed: () => void;
    onError: (message: string) => void;
  }
) => startMonitorSession(config, buildWiredTopics(macId), callbacks);

export const startBleMonitorSession = async (
  config: MonitoringBrokerConfig,
  macId: string,
  callbacks: {
    onConnected: () => void;
    onSubscribed: (topics: string[]) => void;
    onMessage: (message: MonitoringMessageSnapshot) => void;
    onClosed: () => void;
    onError: (message: string) => void;
  }
) => startMonitorSession(config, buildBleTopics(macId), callbacks);
