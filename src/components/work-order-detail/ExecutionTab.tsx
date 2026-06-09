import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import moment from "moment";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";

import Fonts from "@/constants/Typography";
import ActionButton from "../auth-screens/ActionButton";
import { WorkOrder, WorkOrderLaborEntry } from "@/src/types/workOrder";
import { WorkOrderActivityRecord } from "@/src/types/workOrderActivity";
import { getWorkOrderActivity, patchWorkOrder, uploadWorkOrderAttachment } from "@/src/services/work-order.service";
import { useAuthStore } from "@/src/state/auth/useAuthStore";
import { getWorkOrderActivityIcon, getWorkOrderActivityLabel, getWorkOrderActivityTone } from "@/src/utils/workOrderActivity";
import { endpoints } from "@/src/services/api/endpoints";

interface Props {
  params: WorkOrder;
  onSaved?: () => void;
}

type EditableLaborEntry = {
  key: string;
  user_id?: string;
  contributorLabel?: string;
  vendor_name?: string;
  work_date?: string;
  hours: string;
  notes?: string;
  source: "user" | "vendor";
};

const normalizeStatus = (value?: string | null) => String(value || "").trim().toLowerCase();

const formatDateTimeLabel = (value?: string | null) => {
  if (!value) return "Not captured";
  const parsed = moment(value);
  return parsed.isValid() ? parsed.format("DD MMM YYYY, hh:mm A") : String(value);
};

const nowIso = () => new Date().toISOString();

const toDateInputValue = (value?: string | null) => {
  if (!value) return moment().format("YYYY-MM-DD");
  const parsed = moment(value);
  return parsed.isValid() ? parsed.format("YYYY-MM-DD") : moment().format("YYYY-MM-DD");
};

const toEditableLaborEntry = (entry: WorkOrderLaborEntry, index: number): EditableLaborEntry => ({
  key: `${entry.user_id || entry.vendor_name || "labor"}-${index}`,
  user_id: entry.user_id,
  contributorLabel: entry.user?.firstName ? `${entry.user.firstName} ${entry.user.lastName || ""}`.trim() : undefined,
  vendor_name: entry.vendor_name || "",
  work_date: toDateInputValue(entry.work_date || undefined),
  hours: entry.hours !== undefined && entry.hours !== null ? String(entry.hours) : "",
  notes: entry.notes || "",
  source: entry.user_id ? "user" : "vendor",
});

const buildCurrentUserEntry = (user?: any): EditableLaborEntry => ({
  key: `user-${Date.now()}`,
  user_id: String(user?.id || user?._id || user?.userId || ""),
  contributorLabel: [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() || "Current user",
  work_date: moment().format("YYYY-MM-DD"),
  hours: "",
  notes: "",
  source: "user",
});

const buildVendorEntry = (): EditableLaborEntry => ({
  key: `vendor-${Date.now()}`,
  vendor_name: "",
  work_date: moment().format("YYYY-MM-DD"),
  hours: "",
  notes: "",
  source: "vendor",
});

const sanitizeLaborEntries = (entries: EditableLaborEntry[]) =>
  entries
    .map((entry) => {
      const numericHours = Number(entry.hours);
      return {
        user_id: entry.source === "user" ? entry.user_id || undefined : undefined,
        vendor_name: entry.source === "vendor" ? String(entry.vendor_name || "").trim() : "",
        work_date: entry.work_date ? moment(entry.work_date, "YYYY-MM-DD", true).isValid() ? entry.work_date : null : null,
        hours: Number.isFinite(numericHours) ? numericHours : null,
        notes: String(entry.notes || "").trim(),
      };
    })
    .filter((entry) => entry.hours !== null && (entry.user_id || entry.vendor_name));

const getAttachmentUri = (file: any) => {
  if (!file) return "";
  if (file?.fileUrl) return String(file.fileUrl);
  if (file?.folderName && file?.fileName) {
    return `${endpoints.baseURL}${file.folderName}/${file.fileName}`;
  }
  if (file?.image_path) {
    return `${endpoints.baseURL}${file.image_path}`;
  }
  if (file?.fileName) {
    return `${endpoints.baseURL}${file.fileName}`;
  }
  return "";
};

export default function ExecutionTab({ params, onSaved }: Props) {
  const { user } = useAuthStore();
  const [actualStartDate, setActualStartDate] = useState<string | null>(params?.actual_start_date || null);
  const [actualEndDate, setActualEndDate] = useState<string | null>(params?.actual_end_date || null);
  const [actualTime, setActualTime] = useState<string>(params?.actual_time !== null && params?.actual_time !== undefined ? String(params.actual_time) : "");
  const [laborEntries, setLaborEntries] = useState<EditableLaborEntry[]>([]);
  const [saving, setSaving] = useState(false);
  const [refreshingActivity, setRefreshingActivity] = useState(false);
  const [activityLoading, setActivityLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<WorkOrderActivityRecord[]>([]);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);

  const readOnly = Boolean(params?.hierarchy?.executionOwnedByChildren) || normalizeStatus(params?.status) === "completed";

  useEffect(() => {
    setActualStartDate(params?.actual_start_date || null);
    setActualEndDate(params?.actual_end_date || null);
    setActualTime(params?.actual_time !== null && params?.actual_time !== undefined ? String(params.actual_time) : "");
    setLaborEntries(
      Array.isArray(params?.labor_entries) ? params.labor_entries.map((entry, index) => toEditableLaborEntry(entry, index)) : []
    );
  }, [params?.actual_start_date, params?.actual_end_date, params?.actual_time, params?.labor_entries]);

  useEffect(() => {
    if (!actualStartDate || !actualEndDate) return;
    const start = new Date(actualStartDate);
    const end = new Date(actualEndDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return;
    if (end.getTime() < start.getTime()) return;

    const derivedHours = Number((((end.getTime() - start.getTime()) / 3600000)).toFixed(2));
    if (Number.isFinite(derivedHours)) {
      setActualTime(String(derivedHours));
    }
  }, [actualEndDate, actualStartDate]);

  const fetchRecentActivity = useCallback(async (showLoader = true) => {
    if (!params?.id) {
      setActivityLoading(false);
      setRefreshingActivity(false);
      return;
    }

    if (showLoader) {
      setActivityLoading(true);
    }

    try {
      const response = await getWorkOrderActivity(params.id);
      const allEntries = Array.isArray(response?.data) ? (response.data as WorkOrderActivityRecord[]) : [];
      const filteredEntries = allEntries
        .filter((entry) => ["execution-updated", "status-changed", "tasks-updated", "attachments-added"].includes(String(entry?.action_type || "").trim()))
        .sort((first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime())
        .slice(0, 4);
      setRecentActivity(filteredEntries);
    } catch {
      setRecentActivity([]);
    } finally {
      setActivityLoading(false);
      setRefreshingActivity(false);
    }
  }, [params?.id]);

  useEffect(() => {
    fetchRecentActivity();
  }, [fetchRecentActivity]);

  const totalLoggedHours = useMemo(
    () => laborEntries.reduce((total, entry) => total + (Number(entry.hours) || 0), 0),
    [laborEntries]
  );

  const attachmentFiles = useMemo(
    () => (Array.isArray(params?.files) ? params.files : []),
    [params?.files]
  );

  const updateLaborEntry = (key: string, field: keyof EditableLaborEntry, value: string) => {
    setLaborEntries((prev) =>
      prev.map((entry) => (entry.key === key ? { ...entry, [field]: value } : entry))
    );
  };

  const removeLaborEntry = (key: string) => {
    setLaborEntries((prev) => prev.filter((entry) => entry.key !== key));
  };

  const addCurrentUserEntry = () => {
    setLaborEntries((prev) => [...prev, buildCurrentUserEntry(user)]);
  };

  const addVendorEntry = () => {
    setLaborEntries((prev) => [...prev, buildVendorEntry()]);
  };

  const saveExecution = async () => {
    if (!params?.id || readOnly) return;

    if (actualStartDate && actualEndDate) {
      const start = new Date(actualStartDate);
      const end = new Date(actualEndDate);
      if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && end.getTime() < start.getTime()) {
        ToastAndroid.show("Actual end must be after actual start.", ToastAndroid.SHORT);
        return;
      }
    }

    const sanitizedLabor = sanitizeLaborEntries(laborEntries);
    const numericActualTime = actualTime === "" ? null : Number(actualTime);

    if (actualTime !== "" && !Number.isFinite(numericActualTime || NaN)) {
      ToastAndroid.show("Actual time must be a valid number.", ToastAndroid.SHORT);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        actual_start_date: actualStartDate || null,
        actual_end_date: actualEndDate || null,
        actual_time: numericActualTime,
        labor_entries: sanitizedLabor,
      };

      const response = await patchWorkOrder(params.id, payload);
      if (response?.status) {
        ToastAndroid.show("Execution progress saved", ToastAndroid.SHORT);
        onSaved?.();
        fetchRecentActivity(false);
        return;
      }

      ToastAndroid.show(response?.message || "Unable to save execution progress", ToastAndroid.SHORT);
    } catch (error: any) {
      ToastAndroid.show(error?.message || "Unable to save execution progress", ToastAndroid.LONG);
    } finally {
      setSaving(false);
    }
  };

  const handleAttachmentResponse = async (response: any) => {
    if (response?.didCancel || response?.errorCode) {
      return;
    }

    const asset = response?.assets?.[0];
    if (!asset?.uri || !params?.id) {
      return;
    }

    setUploadingAttachment(true);
    try {
      const uploadResponse = await uploadWorkOrderAttachment(params.id, asset, user);
      if (uploadResponse?.status) {
        onSaved?.();
        fetchRecentActivity(false);
      }
    } catch (error) {
      console.log("work order attachment upload error", error);
    } finally {
      setUploadingAttachment(false);
    }
  };

  const openAttachmentPicker = () => {
    launchImageLibrary({ mediaType: "photo", selectionLimit: 1 }, handleAttachmentResponse);
  };

  const openAttachmentCamera = () => {
    launchCamera({ mediaType: "photo", saveToPhotos: true }, handleAttachmentResponse);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshingActivity}
          onRefresh={() => {
            setRefreshingActivity(true);
            fetchRecentActivity(false);
          }}
        />
      }
    >
      <View style={styles.heroCard}>
        <Text style={styles.heroEyebrow}>Execution Log</Text>
        <Text style={styles.heroTitle}>Capture work as it happens</Text>
        <Text style={styles.heroSubtitle}>
          Record actual start and end times, log labor, and keep execution updates current before closing the work order.
        </Text>
      </View>

      {readOnly ? (
        <View style={styles.infoBanner}>
          <Text style={styles.infoBannerTitle}>
            {normalizeStatus(params?.status) === "completed" ? "Execution is locked after completion" : "Execution belongs on child work orders"}
          </Text>
          <Text style={styles.infoBannerText}>
            {normalizeStatus(params?.status) === "completed"
              ? "Actuals and labor remain visible for audit consistency, but they can no longer be edited from mobile."
              : "This parent work order rolls up child execution. Record execution details on the child work orders instead."}
          </Text>
        </View>
      ) : null}

      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Actual Execution</Text>
          <Text style={styles.sectionMeta}>{actualTime ? `${actualTime}h logged` : "No actual hours yet"}</Text>
        </View>

        <View style={styles.metricGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Actual Start</Text>
            <Text style={styles.metricValue}>{formatDateTimeLabel(actualStartDate)}</Text>
            {!readOnly ? (
              <View style={styles.inlineActionsRow}>
                <Pressable style={styles.inlineButton} onPress={() => setActualStartDate(nowIso())}>
                  <Text style={styles.inlineButtonText}>Start now</Text>
                </Pressable>
                {actualStartDate ? (
                  <Pressable style={styles.inlineButtonMuted} onPress={() => setActualStartDate(null)}>
                    <Text style={styles.inlineButtonMutedText}>Clear</Text>
                  </Pressable>
                ) : null}
              </View>
            ) : null}
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Actual End</Text>
            <Text style={styles.metricValue}>{formatDateTimeLabel(actualEndDate)}</Text>
            {!readOnly ? (
              <View style={styles.inlineActionsRow}>
                <Pressable style={styles.inlineButton} onPress={() => setActualEndDate(nowIso())}>
                  <Text style={styles.inlineButtonText}>End now</Text>
                </Pressable>
                {actualEndDate ? (
                  <Pressable style={styles.inlineButtonMuted} onPress={() => setActualEndDate(null)}>
                    <Text style={styles.inlineButtonMutedText}>Clear</Text>
                  </Pressable>
                ) : null}
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.actualHoursCard}>
          <Text style={styles.metricLabel}>Actual Hours</Text>
          <TextInput
            editable={!readOnly}
            style={[styles.input, readOnly && styles.inputDisabled]}
            keyboardType="decimal-pad"
            value={actualTime}
            onChangeText={(text) => setActualTime(text.replace(/[^0-9.]/g, ""))}
            placeholder="0.00"
            placeholderTextColor="#94A3B8"
          />
          <Text style={styles.helperText}>
            When both actual start and end are captured, mobile will derive the hours automatically. You can still adjust them if needed.
          </Text>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Labor Entries</Text>
          <Text style={styles.sectionMeta}>{totalLoggedHours.toFixed(2)}h total</Text>
        </View>

        {!readOnly ? (
          <View style={styles.laborActionRow}>
            <Pressable style={styles.addEntryButton} onPress={addCurrentUserEntry}>
              <Ionicons name="person-add-outline" size={16} color="#1D4ED8" />
              <Text style={styles.addEntryButtonText}>Log My Time</Text>
            </Pressable>
            <Pressable style={styles.addEntryButton} onPress={addVendorEntry}>
              <Ionicons name="briefcase-outline" size={16} color="#1D4ED8" />
              <Text style={styles.addEntryButtonText}>Log Vendor Time</Text>
            </Pressable>
          </View>
        ) : null}

        {laborEntries.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No labor entries captured yet.</Text>
          </View>
        ) : (
          laborEntries.map((entry, index) => (
            <View key={entry.key} style={styles.laborCard}>
              <View style={styles.rowBetween}>
                <Text style={styles.laborTitle}>
                  {entry.source === "user" ? entry.contributorLabel || `Contributor ${index + 1}` : `Vendor entry ${index + 1}`}
                </Text>
                {!readOnly ? (
                  <Pressable onPress={() => removeLaborEntry(entry.key)} hitSlop={8}>
                    <Ionicons name="trash-outline" size={18} color="#DC2626" />
                  </Pressable>
                ) : null}
              </View>

              {entry.source === "vendor" ? (
                <View style={styles.fieldWrap}>
                  <Text style={styles.fieldLabel}>Vendor Name</Text>
                  <TextInput
                    editable={!readOnly}
                    style={[styles.input, readOnly && styles.inputDisabled]}
                    value={entry.vendor_name || ""}
                    onChangeText={(text) => updateLaborEntry(entry.key, "vendor_name", text)}
                    placeholder="Vendor or external contributor"
                    placeholderTextColor="#94A3B8"
                  />
                </View>
              ) : null}

              <View style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>Work Date</Text>
                <TextInput
                  editable={!readOnly}
                  style={[styles.input, readOnly && styles.inputDisabled]}
                  value={entry.work_date || ""}
                  onChangeText={(text) => updateLaborEntry(entry.key, "work_date", text)}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>Hours</Text>
                <TextInput
                  editable={!readOnly}
                  style={[styles.input, readOnly && styles.inputDisabled]}
                  keyboardType="decimal-pad"
                  value={entry.hours}
                  onChangeText={(text) => updateLaborEntry(entry.key, "hours", text.replace(/[^0-9.]/g, ""))}
                  placeholder="0.00"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>Notes</Text>
                <TextInput
                  editable={!readOnly}
                  multiline
                  style={[styles.input, styles.notesInput, readOnly && styles.inputDisabled]}
                  value={entry.notes || ""}
                  onChangeText={(text) => updateLaborEntry(entry.key, "notes", text)}
                  placeholder="Shift, vendor, rework, breakdown details..."
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>
          ))
        )}
      </View>

      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Execution Activity</Text>
          <Text style={styles.sectionMeta}>Latest worker-facing updates</Text>
        </View>

        {activityLoading ? (
          <View style={styles.emptyCard}>
            <ActivityIndicator size="small" color="#742BDE" />
            <Text style={styles.emptyText}>Loading recent execution updates...</Text>
          </View>
        ) : recentActivity.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No execution-related activity recorded yet.</Text>
          </View>
        ) : (
          recentActivity.map((entry, index) => {
            const tone = getWorkOrderActivityTone(entry.action_type);
            return (
              <View key={entry.id || entry._id || `${entry.action_type}-${index}`} style={[styles.activityCard, { backgroundColor: tone.bg, borderColor: tone.border }]}>
                <View style={styles.activityHeader}>
                  <Ionicons name={getWorkOrderActivityIcon(entry.action_type)} size={16} color={tone.icon} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.activityTitle, { color: tone.text }]}>{getWorkOrderActivityLabel(entry.action_type)}</Text>
                    <Text style={styles.activityMeta}>
                      {(entry.actor_name || "System")} - {moment(entry.createdAt).format("DD MMM YYYY, hh:mm A")}
                    </Text>
                  </View>
                </View>
                <Text style={styles.activityNote}>{entry.note || "No execution note provided."}</Text>
              </View>
            );
          })
        )}
      </View>

      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Field Evidence</Text>
          <Text style={styles.sectionMeta}>{attachmentFiles.length} file{attachmentFiles.length === 1 ? "" : "s"}</Text>
        </View>

        {!readOnly ? (
          <View style={styles.laborActionRow}>
            <Pressable style={styles.addEntryButton} onPress={openAttachmentCamera} disabled={uploadingAttachment}>
              <Ionicons name="camera-outline" size={16} color="#1D4ED8" />
              <Text style={styles.addEntryButtonText}>{uploadingAttachment ? "Uploading..." : "Take Photo"}</Text>
            </Pressable>
            <Pressable style={styles.addEntryButton} onPress={openAttachmentPicker} disabled={uploadingAttachment}>
              <Ionicons name="images-outline" size={16} color="#1D4ED8" />
              <Text style={styles.addEntryButtonText}>Add from Gallery</Text>
            </Pressable>
          </View>
        ) : null}

        {attachmentFiles.length === 0 ? (
          <View style={styles.emptyCard}>
            {uploadingAttachment ? <ActivityIndicator size="small" color="#742BDE" /> : null}
            <Text style={styles.emptyText}>
              {uploadingAttachment ? "Uploading attachment..." : "No field photos or files uploaded yet."}
            </Text>
          </View>
        ) : (
          attachmentFiles.map((file, index) => {
            const fileUri = getAttachmentUri(file);
            const fileName = file?.originalName || file?.fileName || `Attachment ${index + 1}`;
            const uploadedAt = file?.createdAt ? moment(file.createdAt).format("DD MMM YYYY, hh:mm A") : null;

            return (
              <View key={`${fileName}-${index}`} style={styles.attachmentCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.attachmentTitle} numberOfLines={1}>{fileName}</Text>
                  <Text style={styles.attachmentMeta}>
                    {file?.type || "File"}
                    {uploadedAt ? ` | ${uploadedAt}` : ""}
                  </Text>
                </View>
                {fileUri ? <Text style={styles.attachmentLink}>Saved</Text> : null}
              </View>
            );
          })
        )}
      </View>

      {!readOnly ? (
        <ActionButton
          label={saving ? "Saving..." : "Save Execution Progress"}
          onPress={saveExecution}
          disabled={saving}
          style={styles.saveButton}
        />
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    paddingBottom: 36,
    gap: 12,
  },
  heroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  heroEyebrow: {
    fontSize: 11,
    fontFamily: Fonts.semiBold,
    color: "#1D4ED8",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  heroTitle: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: "#0F172A",
    marginTop: 8,
  },
  heroSubtitle: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: "#475569",
    lineHeight: 17,
    marginTop: 6,
  },
  infoBanner: {
    backgroundColor: "#FFF7ED",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#FDBA74",
  },
  infoBannerTitle: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    color: "#C2410C",
  },
  infoBannerText: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: "#9A3412",
    lineHeight: 16,
    marginTop: 4,
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 14,
    fontFamily: Fonts.bold,
    color: "#0F172A",
  },
  sectionMeta: {
    fontSize: 10,
    fontFamily: Fonts.medium,
    color: "#64748B",
  },
  metricGrid: {
    gap: 10,
  },
  metricCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  metricLabel: {
    fontSize: 10,
    fontFamily: Fonts.medium,
    color: "#64748B",
  },
  metricValue: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    color: "#0F172A",
    marginTop: 6,
  },
  inlineActionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },
  inlineButton: {
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "#DBEAFE",
  },
  inlineButtonText: {
    fontSize: 10,
    fontFamily: Fonts.medium,
    color: "#1D4ED8",
  },
  inlineButtonMuted: {
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "#F1F5F9",
  },
  inlineButtonMutedText: {
    fontSize: 10,
    fontFamily: Fonts.medium,
    color: "#475569",
  },
  actualHoursCard: {
    gap: 8,
  },
  input: {
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: "#0F172A",
  },
  inputDisabled: {
    backgroundColor: "#F1F5F9",
    color: "#64748B",
  },
  helperText: {
    fontSize: 10,
    fontFamily: Fonts.regular,
    color: "#64748B",
    lineHeight: 15,
  },
  laborActionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  addEntryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  addEntryButtonText: {
    fontSize: 11,
    fontFamily: Fonts.medium,
    color: "#1D4ED8",
  },
  laborCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 10,
  },
  laborTitle: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    color: "#0F172A",
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  fieldWrap: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 10,
    fontFamily: Fonts.medium,
    color: "#64748B",
  },
  notesInput: {
    minHeight: 74,
    textAlignVertical: "top",
  },
  emptyCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  emptyText: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: "#64748B",
    textAlign: "center",
  },
  activityCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 8,
  },
  activityHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  activityTitle: {
    fontSize: 11,
    fontFamily: Fonts.semiBold,
  },
  activityMeta: {
    fontSize: 9,
    fontFamily: Fonts.regular,
    color: "#64748B",
    marginTop: 2,
  },
  activityNote: {
    fontSize: 10,
    fontFamily: Fonts.regular,
    color: "#334155",
    lineHeight: 15,
  },
  attachmentCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  attachmentTitle: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    color: "#0F172A",
  },
  attachmentMeta: {
    marginTop: 4,
    fontSize: 10,
    fontFamily: Fonts.regular,
    color: "#64748B",
  },
  attachmentLink: {
    fontSize: 11,
    fontFamily: Fonts.semiBold,
    color: "#1D4ED8",
  },
  saveButton: {
    marginTop: 4,
    marginBottom: 8,
  },
});
