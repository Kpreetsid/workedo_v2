import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
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
import ModalCalendar from "../global/ModalCalendar";
import { WorkOrder, WorkOrderLaborEntry } from "@/src/types/workOrder";
import { WorkOrderActivityRecord } from "@/src/types/workOrderActivity";
import { getWorkOrderActivity, patchWorkOrder, uploadWorkOrderAttachment } from "@/src/services/work-order.service";
import { useAuthStore } from "@/src/store/useAuthStore";
import { getWorkOrderActivityIcon, getWorkOrderActivityLabel, getWorkOrderActivityTone } from "@/src/utils/workOrderActivity";
import { endpoints } from "@/src/api/endpoints";

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

type PendingAttachment = {
  key: string;
  uri: string;
  fileName: string;
  type: string;
};

const normalizeStatus = (value?: string | null) => String(value || "").trim().toLowerCase();

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
        work_date: entry.work_date ? (moment(entry.work_date, "YYYY-MM-DD", true).isValid() ? entry.work_date : null) : null,
        hours: Number.isFinite(numericHours) ? numericHours : null,
        notes: String(entry.notes || "").trim(),
      };
    })
    .filter((entry) => entry.hours !== null && (entry.user_id || entry.vendor_name));

const getAttachmentUri = (file: any) => {
  if (!file) return "";
  if (file?.folderName && file?.fileName) {
    return `${endpoints.baseURL}${file.folderName}/${file.fileName}`;
  }
  if (file?.fileURL) return String(file.fileURL);
  if (file?.fileUrl) {
    const rawUrl = String(file.fileUrl);
    if (/^https?:\/\//i.test(rawUrl) && !/\/work_order\//i.test(rawUrl) && file?.fileName) {
      return `${endpoints.baseURL}work_order/${file.fileName}`;
    }
    return rawUrl;
  }
  if (file?.image_path) {
    return `${endpoints.baseURL}${file.image_path}`;
  }
  if (file?.fileName) {
    return `${endpoints.baseURL}${file.fileName}`;
  }
  return "";
};

const buildPendingAttachments = (assets: any[] = []): PendingAttachment[] =>
  assets
    .filter((asset) => asset?.uri)
    .map((asset, index) => ({
      key: `${asset?.uri || "attachment"}-${Date.now()}-${index}`,
      uri: String(asset.uri),
      fileName: asset?.fileName || `attachment-${Date.now()}-${index + 1}.jpg`,
      type: asset?.type || "image/jpeg",
    }));

export default function ExecutionTab({ params, onSaved }: Props) {
  const { user } = useAuthStore();
  const [laborEntries, setLaborEntries] = useState<EditableLaborEntry[]>([]);
  const [savingLabor, setSavingLabor] = useState(false);
  const [refreshingActivity, setRefreshingActivity] = useState(false);
  const [activityLoading, setActivityLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<WorkOrderActivityRecord[]>([]);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState<PendingAttachment[]>([]);
  const [previewImageUri, setPreviewImageUri] = useState<string | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [activeLaborDateKey, setActiveLaborDateKey] = useState<string | null>(null);

  const readOnly = Boolean(params?.hierarchy?.executionOwnedByChildren) || normalizeStatus(params?.status) === "completed";

  useEffect(() => {
    setLaborEntries(
      Array.isArray(params?.labor_entries) ? params.labor_entries.map((entry, index) => toEditableLaborEntry(entry, index)) : []
    );
  }, [params?.labor_entries]);

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

  const saveLaborEntries = async () => {
    if (!params?.id || readOnly) return;

    const sanitizedLabor = sanitizeLaborEntries(laborEntries);
    if (laborEntries.length > 0 && sanitizedLabor.length === 0) {
      ToastAndroid.show("Add hours and a contributor before saving labor.", ToastAndroid.SHORT);
      return;
    }

    setSavingLabor(true);
    try {
      const response = await patchWorkOrder(params.id, {
        labor_entries: sanitizedLabor,
      });

      if (response?.status) {
        ToastAndroid.show("Labor entries saved", ToastAndroid.SHORT);
        onSaved?.();
        fetchRecentActivity(false);
        return;
      }

      ToastAndroid.show(response?.message || "Unable to save labor entries", ToastAndroid.SHORT);
    } catch (error: any) {
      ToastAndroid.show(error?.message || "Unable to save labor entries", ToastAndroid.LONG);
    } finally {
      setSavingLabor(false);
    }
  };

  const queueAttachmentsFromResponse = (response: any) => {
    if (response?.didCancel || response?.errorCode) {
      return;
    }

    const nextAttachments = buildPendingAttachments(Array.isArray(response?.assets) ? response.assets : []);
    if (!nextAttachments.length) {
      return;
    }

    setPendingAttachments((prev) => [...prev, ...nextAttachments]);
  };

  const openAttachmentPicker = () => {
    launchImageLibrary({ mediaType: "photo", selectionLimit: 0 }, queueAttachmentsFromResponse);
  };

  const openAttachmentCamera = () => {
    launchCamera({ mediaType: "photo", saveToPhotos: true }, queueAttachmentsFromResponse);
  };

  const removePendingAttachment = (key: string) => {
    setPendingAttachments((prev) => prev.filter((attachment) => attachment.key !== key));
  };

  const uploadPendingAttachments = async () => {
    if (!params?.id || readOnly || pendingAttachments.length === 0) {
      return;
    }

    setUploadingAttachment(true);
    try {
      let uploadedCount = 0;
      for (const attachment of pendingAttachments) {
        const uploadResponse = await uploadWorkOrderAttachment(
          params.id,
          {
            uri: attachment.uri,
            fileName: attachment.fileName,
            type: attachment.type,
          },
          user
        );

        if (uploadResponse?.status) {
          uploadedCount += 1;
        }
      }

      if (uploadedCount > 0) {
        setPendingAttachments([]);
        onSaved?.();
        fetchRecentActivity(false);
      }
    } catch (error) {
      console.log("work order attachment upload error", error);
    } finally {
      setUploadingAttachment(false);
    }
  };

  const openWorkDateCalendar = (entryKey: string) => {
    setActiveLaborDateKey(entryKey);
    setShowCalendar(true);
  };

  const handleLaborDateSelect = (date: string) => {
    if (!activeLaborDateKey) return;
    updateLaborEntry(activeLaborDateKey, "work_date", date);
    setActiveLaborDateKey(null);
  };

  const activeWorkDate = laborEntries.find((entry) => entry.key === activeLaborDateKey)?.work_date || moment().format("YYYY-MM-DD");

  return (
    <>
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
          <Text style={styles.heroTitle}>Keep field updates current</Text>
          <Text style={styles.heroSubtitle}>
            Log labor with the correct work date, review recent execution updates, and attach visual evidence from the field.
          </Text>
        </View>

        {readOnly ? (
          <View style={styles.infoBanner}>
            <Text style={styles.infoBannerTitle}>
              {normalizeStatus(params?.status) === "completed" ? "Execution is locked after completion" : "Execution belongs on child work orders"}
            </Text>
            <Text style={styles.infoBannerText}>
              {normalizeStatus(params?.status) === "completed"
                ? "Labor and attachments remain visible for audit consistency, but they can no longer be edited from mobile."
                : "This parent work order rolls up child execution. Record labor and field evidence on the child work orders instead."}
            </Text>
          </View>
        ) : null}

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Labor Entries</Text>
            <View style={styles.headerActionCluster}>
              <Text style={styles.sectionMeta}>{totalLoggedHours.toFixed(2)}h total</Text>
              {!readOnly ? (
                <Pressable style={styles.sectionSaveButton} onPress={saveLaborEntries} disabled={savingLabor}>
                  <Ionicons name="save-outline" size={14} color="#FFFFFF" />
                  <Text style={styles.sectionSaveButtonText}>{savingLabor ? "Saving..." : "Quick Save"}</Text>
                </Pressable>
              ) : null}
            </View>
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
                  <Pressable
                    style={[styles.calendarField, readOnly && styles.inputDisabled]}
                    onPress={() => {
                      if (!readOnly) {
                        openWorkDateCalendar(entry.key);
                      }
                    }}
                  >
                    <Text style={styles.calendarFieldValue}>
                      {entry.work_date ? moment(entry.work_date, "YYYY-MM-DD").format("DD MMM YYYY") : "Select work date"}
                    </Text>
                    <Ionicons name="calendar-outline" size={18} color="#475569" />
                  </Pressable>
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
            <View style={styles.headerActionCluster}>
              <Text style={styles.sectionMeta}>{attachmentFiles.length + pendingAttachments.length} tile{attachmentFiles.length + pendingAttachments.length === 1 ? "" : "s"}</Text>
              {!readOnly && pendingAttachments.length > 0 ? (
                <Pressable style={styles.sectionSaveButton} onPress={uploadPendingAttachments} disabled={uploadingAttachment}>
                  <Ionicons name="cloud-upload-outline" size={14} color="#FFFFFF" />
                  <Text style={styles.sectionSaveButtonText}>{uploadingAttachment ? "Uploading..." : "Upload Selected"}</Text>
                </Pressable>
              ) : null}
            </View>
          </View>

          {!readOnly ? (
            <View style={styles.laborActionRow}>
              <Pressable style={styles.addEntryButton} onPress={openAttachmentCamera} disabled={uploadingAttachment}>
                <Ionicons name="camera-outline" size={16} color="#1D4ED8" />
                <Text style={styles.addEntryButtonText}>Take Photo</Text>
              </Pressable>
              <Pressable style={styles.addEntryButton} onPress={openAttachmentPicker} disabled={uploadingAttachment}>
                <Ionicons name="images-outline" size={16} color="#1D4ED8" />
                <Text style={styles.addEntryButtonText}>Add from Gallery</Text>
              </Pressable>
            </View>
          ) : null}

          {pendingAttachments.length > 0 ? (
            <View style={styles.previewGroup}>
              <Text style={styles.previewGroupTitle}>Ready to Upload</Text>
              <View style={styles.tileGrid}>
                {pendingAttachments.map((attachment) => (
                  <Pressable key={attachment.key} style={styles.imageTile} onPress={() => setPreviewImageUri(attachment.uri)}>
                    <Image source={{ uri: attachment.uri }} style={styles.imageTilePhoto} />
                    {!readOnly ? (
                      <Pressable style={styles.imageTileRemove} onPress={() => removePendingAttachment(attachment.key)} hitSlop={6}>
                        <Ionicons name="close" size={14} color="#FFFFFF" />
                      </Pressable>
                    ) : null}
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null}

          {attachmentFiles.length === 0 && pendingAttachments.length === 0 ? (
            <View style={styles.emptyCard}>
              {uploadingAttachment ? <ActivityIndicator size="small" color="#742BDE" /> : null}
              <Text style={styles.emptyText}>
                {uploadingAttachment ? "Uploading attachment..." : "No field photos or files uploaded yet."}
              </Text>
            </View>
          ) : null}

          {attachmentFiles.length > 0 ? (
            <View style={styles.previewGroup}>
              <Text style={styles.previewGroupTitle}>Uploaded Evidence</Text>
              <View style={styles.tileGrid}>
                {attachmentFiles.map((file, index) => {
                  const fileUri = getAttachmentUri(file);
                  const fileName = file?.originalName || file?.fileName || `Attachment ${index + 1}`;
                  return (
                    <Pressable
                      key={`${fileName}-${index}`}
                      style={styles.imageTile}
                      onPress={() => {
                        if (fileUri) {
                          setPreviewImageUri(fileUri);
                        }
                      }}
                    >
                      {fileUri ? (
                        <Image source={{ uri: fileUri }} style={styles.imageTilePhoto} />
                      ) : (
                        <View style={styles.imageTileFallback}>
                          <Ionicons name="document-outline" size={18} color="#475569" />
                          <Text style={styles.imageTileFallbackText} numberOfLines={2}>{fileName}</Text>
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ) : null}
        </View>
      </ScrollView>

      <ModalCalendar
        showCalendar={showCalendar}
        setShowCalendar={(value) => {
          if (!value) {
            setActiveLaborDateKey(null);
          }
          setShowCalendar(value);
        }}
        onSelectDate={handleLaborDateSelect}
        activeDateField="work_date"
        currentDate={activeWorkDate}
      />

      <Modal visible={!!previewImageUri} transparent animationType="fade" onRequestClose={() => setPreviewImageUri(null)}>
        <Pressable style={styles.previewModalBackdrop} onPress={() => setPreviewImageUri(null)}>
          <View style={styles.previewModalContent}>
            {previewImageUri ? <Image source={{ uri: previewImageUri }} style={styles.previewModalImage} resizeMode="contain" /> : null}
            <Pressable style={styles.previewModalClose} onPress={() => setPreviewImageUri(null)}>
              <Ionicons name="close" size={20} color="#FFFFFF" />
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
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
  headerActionCluster: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },
  sectionSaveButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: "#1D4ED8",
  },
  sectionSaveButtonText: {
    fontSize: 10,
    fontFamily: Fonts.semiBold,
    color: "#FFFFFF",
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
  calendarField: {
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  calendarFieldValue: {
    flex: 1,
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: "#0F172A",
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
  previewGroup: {
    gap: 8,
  },
  previewGroupTitle: {
    fontSize: 10,
    fontFamily: Fonts.semiBold,
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tileGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  imageTile: {
    width: 88,
    height: 88,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#E2E8F0",
    position: "relative",
  },
  imageTilePhoto: {
    width: "100%",
    height: "100%",
  },
  imageTileRemove: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(15, 23, 42, 0.78)",
    alignItems: "center",
    justifyContent: "center",
  },
  imageTileFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    gap: 6,
    backgroundColor: "#F8FAFC",
  },
  imageTileFallbackText: {
    fontSize: 10,
    fontFamily: Fonts.medium,
    color: "#334155",
    textAlign: "center",
  },
  previewModalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(2, 6, 23, 0.88)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  previewModalContent: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  previewModalImage: {
    width: "100%",
    height: "82%",
  },
  previewModalClose: {
    position: "absolute",
    top: 18,
    right: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(15, 23, 42, 0.72)",
    alignItems: "center",
    justifyContent: "center",
  },
});
