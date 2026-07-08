import { MonitoringBrokerConfig, MonitoringMessageSnapshot } from "@/src/types/monitoring";
import { Buffer } from "buffer";

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

const RAW_METADATA_SIZE = 18 + 8 + 4 + 4 + 4 + 1 + 4;

const isRawTopic = (topic?: string | null) => {
  const normalized = String(topic || "").trim().toLowerCase();
  return normalized.startsWith("wired/rawdata/") || normalized.startsWith("raw/ble/");
};

const isLikelyRawTimestamp = (value: number) => Number.isFinite(value) && value > 946684800 && value < 4102444800;

const isLikelyRawMetadata = (decoded: {
  macId: string;
  timestamp: number;
  blockSize: number;
  samplingRate: number;
  axis: string;
  temp: number;
}) => {
  return Boolean(
    decoded.macId &&
      /^[A-Za-z0-9:_-]+$/.test(decoded.macId) &&
      isLikelyRawTimestamp(decoded.timestamp) &&
      Number.isInteger(decoded.blockSize) &&
      decoded.blockSize > 0 &&
      decoded.blockSize <= 1_000_000 &&
      Number.isFinite(decoded.samplingRate) &&
      decoded.samplingRate > 0 &&
      decoded.samplingRate <= 1_000_000 &&
      /^[A-Za-z]$/.test(decoded.axis) &&
      Number.isFinite(decoded.temp) &&
      decoded.temp > -200 &&
      decoded.temp < 300
  );
};

const tryDecodeRawMetadata = (buffer: Buffer) => {
  if (buffer.length < RAW_METADATA_SIZE) {
    return null;
  }

  try {
    const macId = buffer.toString("utf8", 0, 18).replace(/\0/g, "").trim();
    const timestamp = buffer.readDoubleLE(18);
    const blockSize = buffer.readInt32LE(26);
    const samplingRate = buffer.readFloatLE(30);
    const axis = buffer.toString("utf8", 38, 39).replace(/\0/g, "").trim();
    const temp = buffer.readFloatLE(39);

    const decoded = {
      macId,
      timestamp,
      blockSize,
      samplingRate,
      axis,
      temp,
    };

    if (!isLikelyRawMetadata(decoded)) {
      return null;
    }

    return {
      mac_id: decoded.macId,
      timestamp: decoded.timestamp,
      no_of_samples: decoded.blockSize,
      fs: Math.trunc(decoded.samplingRate),
      axis: decoded.axis.toLowerCase(),
      temp: Number(decoded.temp),
    };
  } catch {
    return null;
  }
};

const decodeRawPayloadPreview = (payload: string) => {
  if (!payload) return null;

  const binaryBuffer = Buffer.from(payload, "latin1");
  const directDecoded = tryDecodeRawMetadata(binaryBuffer);
  if (directDecoded) {
    return JSON.stringify(directDecoded, null, 2);
  }

  const sanitized = payload.replace(/\s+/g, "");
  if (/^[A-Za-z0-9+/=]+$/.test(sanitized) && sanitized.length % 4 === 0) {
    try {
      const base64Buffer = Buffer.from(sanitized, "base64");
      const base64Decoded = tryDecodeRawMetadata(base64Buffer);
      if (base64Decoded) {
        return JSON.stringify(base64Decoded, null, 2);
      }
    } catch {
      return null;
    }
  }

  return null;
};

export const normalizePayloadPreview = (payload: string, topic?: string | null) => {
  if (!payload) return "";

  if (isRawTopic(topic)) {
    const decodedPreview = decodeRawPayloadPreview(payload);
    if (decodedPreview) {
      return decodedPreview;
    }
  }

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
