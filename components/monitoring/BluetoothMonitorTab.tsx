import Fonts from "@/constants/Typography";
import MacIdInput from "@/components/monitoring/MacIdInput";
import RadioSelector from "@/components/monitoring/RadioSelector";
import {
  BLE_DEFAULT_CA_BASE64,
  BLE_DEFAULT_CERTIFICATE_PASS,
  BLE_DEFAULT_P12_BASE64,
} from "@/src/config/bleMonitorCertificates";
import { createMonitoringBrokerConfig, normalizePayloadPreview, startBleMonitorSession } from "@/src/services/mqtt-monitor.service";
import { useBleMonitoringStore } from "@/src/store/useBleMonitoringStore";
import { MonitoringBrokerConfig, MonitoringPhase } from "@/src/types/monitoring";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface BluetoothMonitorTabProps {
  active: boolean;
}

const WAIT_TIMEOUT_MS = 5 * 60_000;
const DEFAULT_BROKER = {
  host: "a12rinclmy9hw6-ats.iot.ap-south-1.amazonaws.com",
  port: 8883,
  username: "admin",
  password: "123456",
};

const phaseLabels: Record<MonitoringPhase, string> = {
  idle: "Ready to connect",
  connecting: "Connecting to broker",
  connected: "Connected to broker",
  subscribed: "Topics subscribed",
  waiting: "Waiting for data",
  success: "Data received",
  timeout: "No data received yet",
  error: "Connection failed",
  disconnected: "Disconnected",
};

const phaseTones: Record<MonitoringPhase, { background: string; border: string; text: string }> = {
  idle: { background: "#F8FAFC", border: "#CBD5E1", text: "#475569" },
  connecting: { background: "#EEF2FF", border: "#C7D2FE", text: "#4338CA" },
  connected: { background: "#EEF2FF", border: "#C7D2FE", text: "#4338CA" },
  subscribed: { background: "#F5F3FF", border: "#DDD6FE", text: "#6D28D9" },
  waiting: { background: "#FEF3C7", border: "#FCD34D", text: "#92400E" },
  success: { background: "#DCFCE7", border: "#86EFAC", text: "#166534" },
  timeout: { background: "#FFF7ED", border: "#FDBA74", text: "#C2410C" },
  error: { background: "#FEE2E2", border: "#FCA5A5", text: "#B91C1C" },
  disconnected: { background: "#F8FAFC", border: "#CBD5E1", text: "#475569" },
};

const generateClientId = () => `workedo-ble-${Date.now()}`;

const formatDateTime = (value: string | null) => {
  if (!value) return "-";
  return new Date(value).toLocaleString();
};

export default function BluetoothMonitorTab({ active }: BluetoothMonitorTabProps) {
  const mode = useBleMonitoringStore((state) => state.mode);
  const macId = useBleMonitoringStore((state) => state.macId);
  const host = useBleMonitoringStore((state) => state.host);
  const port = useBleMonitoringStore((state) => state.port);
  const username = useBleMonitoringStore((state) => state.username);
  const password = useBleMonitoringStore((state) => state.password);
  const session = useBleMonitoringStore((state) => state.session);
  const setMode = useBleMonitoringStore((state) => state.setMode);
  const setDraftField = useBleMonitoringStore((state) => state.setDraftField);
  const setSession = useBleMonitoringStore((state) => state.setSession);
  const resetSession = useBleMonitoringStore((state) => state.resetSession);

  const clientRef = useRef<{ disconnect: () => void } | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const manualDisconnectRef = useRef(false);
  const currentSessionRef = useRef(0);
  const [showPassword, setShowPassword] = useState(false);

  const tone = phaseTones[session.phase];
  const isSessionActive = ["connecting", "connected", "subscribed", "waiting", "success"].includes(session.phase);

  const canConnect = useMemo(() => {
    const trimmedMac = macId.trim();
    if (!trimmedMac) return false;
    if (mode === "default") return true;

    return Boolean(host.trim() && port.trim() && username.trim() && password.trim());
  }, [host, macId, mode, password, port, username]);

  useEffect(() => {
    if (!active) {
      disconnectSession(false);
    }
  }, [active]);

  useEffect(() => {
    return () => {
      disconnectSession(true);
    };
  }, []);

  const clearWaitTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const disconnectSession = (silent = false) => {
    clearWaitTimer();
    manualDisconnectRef.current = true;
    clientRef.current?.disconnect();
    clientRef.current = null;

    if (!silent) {
      setSession({
        phase: "disconnected",
      });
    }
  };

  const startWaitTimer = () => {
    clearWaitTimer();
    timeoutRef.current = setTimeout(() => {
      setSession({
        phase: "timeout",
        errorMessage: "No data received in the last 5 minutes.",
      });
    }, WAIT_TIMEOUT_MS);
  };

  const handleModeChange = (value: string) => {
    const nextMode = value.toLowerCase() === "custom" ? "custom" : "default";
    setMode(nextMode);
  };

  const buildConfig = (): MonitoringBrokerConfig => {
    const trimmedHost = host.trim();
    const trimmedPort = port.trim();
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();
    const resolvedPort = Number(trimmedPort || "1883");

    return createMonitoringBrokerConfig({
      mode,
      host: mode === "default" ? DEFAULT_BROKER.host : trimmedHost,
      port: mode === "default" ? DEFAULT_BROKER.port : Number.isFinite(resolvedPort) ? resolvedPort : 1883,
      username: mode === "default" ? DEFAULT_BROKER.username : trimmedUsername,
      password: mode === "default" ? DEFAULT_BROKER.password : trimmedPassword,
      clientId: generateClientId(),
      tls: mode === "default",
      protocol: mode === "default" ? "mqtts" : "mqtt",
      certificate: mode === "default" ? BLE_DEFAULT_P12_BASE64 : undefined,
      certificatePass: mode === "default" ? BLE_DEFAULT_CERTIFICATE_PASS : undefined,
      ca: mode === "default" ? BLE_DEFAULT_CA_BASE64 : undefined,
    });
  };

  const handleConnect = async () => {
    const trimmedMacId = macId.trim().toUpperCase();
    if (!trimmedMacId) {
      ToastAndroid.show("MAC ID is required", ToastAndroid.SHORT);
      return;
    }

    if (mode === "custom") {
      const trimmedHost = host.trim();
      const trimmedPort = port.trim();
      const trimmedUsername = username.trim();
      const trimmedPassword = password.trim();

      setDraftField("host", trimmedHost);
      setDraftField("port", trimmedPort);
      setDraftField("username", trimmedUsername);
      setDraftField("password", trimmedPassword);

      if (!trimmedHost || !trimmedPort || !trimmedUsername || !trimmedPassword) {
        ToastAndroid.show("Complete all custom broker fields", ToastAndroid.SHORT);
        return;
      }
    }

    setDraftField("macId", trimmedMacId);

    disconnectSession(true);
    resetSession();
    manualDisconnectRef.current = false;
    currentSessionRef.current += 1;
    const sessionToken = currentSessionRef.current;
    const config = buildConfig();

    setSession({
      phase: "connecting",
      topics: [],
      packetCount: 0,
      lastMessageAt: null,
      lastTopic: null,
      lastPayloadPreview: null,
      errorMessage: null,
    });

    try {
      const client = await startBleMonitorSession(config, trimmedMacId, {
        onConnected: () => {
          if (sessionToken !== currentSessionRef.current) return;
          setSession({
            phase: "connected",
            errorMessage: null,
          });
        },
        onSubscribed: (topics) => {
          if (sessionToken !== currentSessionRef.current) return;
          setSession({
            phase: "waiting",
            topics,
            errorMessage: null,
          });
          startWaitTimer();
        },
        onMessage: (message) => {
          if (sessionToken !== currentSessionRef.current) return;
          clearWaitTimer();
          useBleMonitoringStore.setState((state) => ({
            session: {
              ...state.session,
              phase: "success",
              packetCount: state.session.packetCount + 1,
              lastMessageAt: new Date().toISOString(),
              lastTopic: message.topic,
              lastPayloadPreview: normalizePayloadPreview(message.data),
              errorMessage: null,
            },
          }));
        },
        onClosed: () => {
          if (sessionToken !== currentSessionRef.current) return;
          clearWaitTimer();
          if (!manualDisconnectRef.current) {
            setSession({
              phase: "disconnected",
            });
          }
        },
        onError: (message) => {
          if (sessionToken !== currentSessionRef.current) return;
          clearWaitTimer();
          setSession({
            phase: "error",
            errorMessage: message,
          });
        },
      });

      clientRef.current = client;
      ToastAndroid.show("BLE MQTT session started", ToastAndroid.SHORT);
    } catch (error: any) {
      const message = error?.message || "Unable to start the MQTT session.";
      setSession({
        phase: "error",
        errorMessage: message,
      });
      Alert.alert("MQTT unavailable", message);
    }
  };

  const metrics = [
    { label: "Packet count", value: `${session.packetCount}` },
    { label: "Last message", value: formatDateTime(session.lastMessageAt) },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>BLE Sensor Monitoring</Text>
        <Text style={styles.sectionText}>
          Verify that a BLE sensor is publishing through the default AWS IoT path or your custom broker for the entered MAC ID.
        </Text>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.eyebrow}>Connection Mode</Text>
        <RadioSelector selected={mode === "custom" ? "Custom" : "Default"} onSelect={handleModeChange} />

        {mode === "custom" ? (
          <View style={styles.formGrid}>
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>Host</Text>
              <TextInput
                style={styles.input}
                value={host}
                onChangeText={(value) => setDraftField("host", value)}
                placeholder="Enter MQTT host"
                placeholderTextColor="#94A3B8"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>Port</Text>
              <TextInput
                style={styles.input}
                value={port}
                onChangeText={(value) => setDraftField("port", value)}
                placeholder="1883"
                placeholderTextColor="#94A3B8"
                keyboardType="number-pad"
              />
            </View>

            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>Username</Text>
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={(value) => setDraftField("username", value)}
                placeholder="Enter username"
                placeholderTextColor="#94A3B8"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>Password</Text>
              <View style={styles.passwordInputWrap}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  value={password}
                  onChangeText={(value) => setDraftField("password", value)}
                  placeholder="Enter password"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <Pressable
                  style={styles.passwordToggle}
                  onPress={() => setShowPassword((prev) => !prev)}
                  hitSlop={8}
                >
                  <MaterialCommunityIcons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#64748B"
                  />
                </Pressable>
              </View>
            </View>
          </View>
        ) : null}

        <MacIdInput
          label="MAC ID"
          value={macId}
          onChangeText={(value) => setDraftField("macId", value)}
          placeholder="Enter the BLE sensor MAC ID"
        />

        <View style={styles.buttonRow}>
          <Pressable
            style={[styles.primaryButton, !canConnect && styles.primaryButtonDisabled]}
            onPress={handleConnect}
            disabled={!canConnect || session.phase === "connecting"}
          >
            {session.phase === "connecting" ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText}>Connect & Listen</Text>
            )}
          </Pressable>

          {isSessionActive ? (
            <Pressable style={styles.secondaryButton} onPress={() => disconnectSession(false)}>
              <Text style={styles.secondaryButtonText}>Disconnect</Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      <View style={styles.sectionCard}>
        <View style={styles.statusHeaderRow}>
          <View style={styles.statusCopy}>
            <Text style={styles.sectionTitle}>Session Status</Text>
            <Text style={styles.sectionText}>
              The first message received on either BLE topic confirms a healthy installation path.
            </Text>
          </View>
          <View style={[styles.phasePill, { backgroundColor: tone.background, borderColor: tone.border }]}>
            <Text style={[styles.phasePillText, { color: tone.text }]}>{phaseLabels[session.phase]}</Text>
          </View>
        </View>

        <View style={styles.metricGrid}>
          {metrics.map((metric, index) => (
            <View
              key={metric.label}
              style={[
                styles.metricCard,
                index === 0 ? styles.metricCardCompact : styles.metricCardExpanded,
              ]}
            >
              <Text style={styles.metricLabel}>{metric.label}</Text>
              <Text style={styles.metricValue} numberOfLines={1}>
                {metric.value}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.detailCard}>
          <Text style={styles.detailLabel}>Last payload preview</Text>
          <Text style={styles.payloadPreview}>
            {session.lastPayloadPreview || "Waiting for the first message..."}
          </Text>
        </View>

        {session.errorMessage ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>Connection detail</Text>
            <Text style={styles.errorText}>{session.errorMessage}</Text>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  contentContainer: {
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 28,
    gap: 14,
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E9DDFC",
  },
  eyebrow: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    letterSpacing: 0.8,
    color: "#7C3AED",
    textTransform: "uppercase",
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 16,
    color: "#111827",
    marginBottom: 6,
  },
  sectionText: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 20,
    color: "#64748B",
  },
  formGrid: {
    gap: 12,
    marginBottom: 12,
  },
  fieldBlock: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: "#201F23",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DCE4EC",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: "#111827",
  },
  passwordInputWrap: {
    position: "relative",
  },
  passwordInput: {
    paddingRight: 44,
  },
  passwordToggle: {
    position: "absolute",
    right: 12,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: "#742BDE",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonDisabled: {
    opacity: 0.45,
  },
  primaryButtonText: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: "#FFFFFF",
  },
  secondaryButton: {
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  secondaryButtonText: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    color: "#475569",
  },
  statusHeaderRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },
  statusCopy: {
    flex: 1,
    minWidth: 0,
    paddingRight: 4,
  },
  phasePill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 1,
    flexShrink: 1,
    alignSelf: "flex-start",
    maxWidth: "38%",
  },
  phasePillText: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
  },
  metricGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  metricCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  metricCardCompact: {
    flexBasis: "30%",
    flexGrow: 0,
    flexShrink: 0,
  },
  metricCardExpanded: {
    flexBasis: "67%",
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 0,
  },
  metricLabel: {
    fontFamily: Fonts.medium,
    fontSize: 11,
    color: "#64748B",
    marginBottom: 6,
    textTransform: "uppercase",
  },
  metricValue: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    lineHeight: 18,
    color: "#111827",
  },
  detailCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 10,
  },
  detailLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: "#334155",
    marginBottom: 8,
  },
  payloadPreview: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    color: "#0F172A",
  },
  errorCard: {
    backgroundColor: "#FEF2F2",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#FECACA",
    padding: 14,
  },
  errorTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: "#991B1B",
    marginBottom: 6,
  },
  errorText: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    color: "#B91C1C",
  },
});
