import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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

import Fonts from "@/constants/Typography";
import Header from "@/src/components/global/Header";
import { deleteProcedure, getProcedures } from "@/src/services/procedure.service";
import { deleteWorkOrderTemplate, getWorkOrderTemplate, getWorkOrderTemplates } from "@/src/services/work-order-template.service";
import { ProcedureTemplate } from "@/src/types/procedure";
import { WorkOrderTemplate } from "@/src/types/library";

type LibraryTab = "templates" | "procedures";

const templateTypes = ["All", "Preventive", "Reactive", "Other"];

const resolveId = (value: any): string => {
  if (!value) return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  return String(value.id || value._id || "");
};

const formatDate = (value?: string) => {
  if (!value) return "No date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No date";
  return date.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
};

const getTemplateName = (template: WorkOrderTemplate) => template.template_name || "Untitled Template";
const getTemplateTitle = (template: WorkOrderTemplate) => template.title || "No work order title added";
const getTemplateStatus = (template: WorkOrderTemplate) => template.status || (template.is_active === false ? "Inactive" : "Active");

const buildTemplateDraft = (template: WorkOrderTemplate) => {
  const today = new Date();
  const dueDate = new Date(today.getTime() + 86400000);

  const toDateInput = (date: Date) => date.toISOString().split("T")[0];
  const firstLocation = Array.isArray(template.locations) && template.locations.length ? template.locations[0] : null;
  const firstAsset = Array.isArray(template.assets) && template.assets.length ? template.assets[0] : null;

  return {
    status: "Open",
    title: template.title || "",
    description: template.description || "",
    priority: template.priority || "Medium",
    nature_of_work: template.nature_of_work || "General",
    type: template.nature_of_work || "General",
    estimated_time: template.estimated_time ?? "",
    procedure_ids: (template.procedure_ids || template.procedures || []).map((item: any) => resolveId(item)).filter(Boolean),
    procedures: template.procedures || [],
    assignedUsers: template.assignees || [],
    parts: template.parts || [],
    location: firstLocation,
    asset: firstAsset,
    start_date: toDateInput(today),
    end_date: toDateInput(dueDate),
    createdFrom: "Work Order",
    template_id: resolveId(template),
    template_name: template.template_name || "",
  };
};

export default function LibraryScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<LibraryTab>("templates");
  const [search, setSearch] = useState("");
  const [templateType, setTemplateType] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [templates, setTemplates] = useState<WorkOrderTemplate[]>([]);
  const [procedures, setProcedures] = useState<ProcedureTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<WorkOrderTemplate | null>(null);
  const [selectedProcedure, setSelectedProcedure] = useState<ProcedureTemplate | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const categoryOptions = useMemo(
    () => Array.from(new Set(procedures.map((item) => String(item.category || "").trim()).filter(Boolean))).sort(),
    [procedures]
  );

  const filteredProcedures = useMemo(() => {
    const term = search.trim().toLowerCase();
    const category = selectedCategory.trim().toLowerCase();

    return procedures.filter((procedure) => {
      const matchesSearch =
        !term ||
        String(procedure.name || "").toLowerCase().includes(term) ||
        String(procedure.description || "").toLowerCase().includes(term) ||
        String(procedure.category || "").toLowerCase().includes(term) ||
        (procedure.tags || []).some((tag) => String(tag).toLowerCase().includes(term));
      const matchesCategory = !category || String(procedure.category || "").toLowerCase() === category;
      return matchesSearch && matchesCategory;
    });
  }, [procedures, search, selectedCategory]);

  const fetchLibrary = useCallback(async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    try {
      const [templateRes, procedureRes] = await Promise.all([
        getWorkOrderTemplates({
          search: activeTab === "templates" ? search.trim() : "",
          maintenance_type: templateType !== "All" ? templateType : "",
        }),
        getProcedures({ search: activeTab === "procedures" ? search.trim() : "" }),
      ]);

      setTemplates(Array.isArray(templateRes?.data) ? templateRes.data : []);
      setProcedures(Array.isArray(procedureRes?.data) ? procedureRes.data : []);
    } catch (error: any) {
      ToastAndroid.show(error?.message || "Unable to load library", ToastAndroid.LONG);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab, search, templateType]);

  useFocusEffect(
    useCallback(() => {
      fetchLibrary();
    }, [fetchLibrary])
  );

  const refresh = () => {
    setRefreshing(true);
    fetchLibrary(false);
  };

  const clearFilters = () => {
    setSearch("");
    setTemplateType("All");
    setSelectedCategory("");
  };

  const openTemplate = async (template: WorkOrderTemplate) => {
    const templateId = resolveId(template);
    if (!templateId) {
      setSelectedTemplate(template);
      return;
    }

    try {
      const response = await getWorkOrderTemplate(templateId);
      setSelectedTemplate(response?.data || template);
    } catch {
      setSelectedTemplate(template);
    }
  };

  const useTemplate = (template: WorkOrderTemplate) => {
    router.push({
      pathname: "/createWorkOrder",
      params: {
        comingFrom: "library",
        data: JSON.stringify(buildTemplateDraft(template)),
      },
    } as never);
    setSelectedTemplate(null);
  };

  const confirmDeleteTemplate = (template: WorkOrderTemplate) => {
    const templateId = resolveId(template);
    if (!templateId) return;

    Alert.alert("Delete Work Order Template", `Delete "${getTemplateName(template)}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const res = await deleteWorkOrderTemplate(templateId);
            if (res?.status) {
              ToastAndroid.show("Template deleted", ToastAndroid.SHORT);
              fetchLibrary(false);
            }
          } catch (error: any) {
            ToastAndroid.show(error?.message || "Unable to delete template", ToastAndroid.LONG);
          }
        },
      },
    ]);
  };

  const confirmDeleteProcedure = (procedure: ProcedureTemplate) => {
    const procedureId = resolveId(procedure);
    if (!procedureId) return;

    Alert.alert("Delete Procedure", `Delete "${procedure.name}" from the library?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const res = await deleteProcedure(procedureId);
            if (res?.status) {
              ToastAndroid.show("Procedure deleted", ToastAndroid.SHORT);
              fetchLibrary(false);
            }
          } catch (error: any) {
            ToastAndroid.show(error?.message || "Unable to delete procedure", ToastAndroid.LONG);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Header title="Library" />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
      >
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons name="library-outline" size={24} color="#742BDE" />
          </View>
          <View style={styles.heroText}>
            <Text style={styles.kicker}>Planning Library</Text>
            <Text style={styles.heroTitle}>Reusable maintenance building blocks</Text>
            <Text style={styles.heroDescription}>Use work order templates and procedures from the same backend library as web.</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <Stat label="Templates" value={templates.length} />
          <Stat label="Procedures" value={procedures.length} />
          <Stat label="Preventive" value={templates.filter((item) => item.maintenance_type === "Preventive").length} />
        </View>

        <View style={styles.tabBar}>
          <TabButton label="Templates" active={activeTab === "templates"} onPress={() => setActiveTab("templates")} />
          <TabButton label="Procedures" active={activeTab === "procedures"} onPress={() => setActiveTab("procedures")} />
        </View>

        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#8B8B94" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder={activeTab === "templates" ? "Search templates" : "Search procedures"}
            placeholderTextColor="#8B8B94"
            style={styles.searchInput}
            returnKeyType="search"
          />
          {(search || templateType !== "All" || selectedCategory) ? (
            <Pressable onPress={clearFilters}>
              <Ionicons name="close-circle" size={18} color="#8B8B94" />
            </Pressable>
          ) : null}
        </View>

        {activeTab === "templates" ? (
          <View style={styles.filterRow}>
            {templateTypes.map((type) => (
              <Pressable key={type} style={[styles.filterChip, templateType === type && styles.filterChipActive]} onPress={() => setTemplateType(type)}>
                <Text style={[styles.filterChipText, templateType === type && styles.filterChipTextActive]}>{type}</Text>
              </Pressable>
            ))}
          </View>
        ) : (
          <View style={styles.filterRow}>
            <Pressable style={[styles.filterChip, !selectedCategory && styles.filterChipActive]} onPress={() => setSelectedCategory("")}>
              <Text style={[styles.filterChipText, !selectedCategory && styles.filterChipTextActive]}>All categories</Text>
            </Pressable>
            {categoryOptions.map((category) => (
              <Pressable key={category} style={[styles.filterChip, selectedCategory === category && styles.filterChipActive]} onPress={() => setSelectedCategory(category)}>
                <Text style={[styles.filterChipText, selectedCategory === category && styles.filterChipTextActive]}>{category}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator color="#742BDE" />
            <Text style={styles.loadingText}>Loading library...</Text>
          </View>
        ) : activeTab === "templates" ? (
          <View style={styles.list}>
            {templates.length ? templates.map((template) => (
              <TemplateCard
                key={resolveId(template)}
                template={template}
                onOpen={() => openTemplate(template)}
                onUse={() => useTemplate(template)}
                onDelete={() => confirmDeleteTemplate(template)}
              />
            )) : <EmptyState title="No templates found" message="Create templates from web or adjust your filters." />}
          </View>
        ) : (
          <View style={styles.list}>
            {filteredProcedures.length ? filteredProcedures.map((procedure) => (
              <ProcedureCard
                key={resolveId(procedure)}
                procedure={procedure}
                onOpen={() => setSelectedProcedure(procedure)}
                onDelete={() => confirmDeleteProcedure(procedure)}
              />
            )) : <EmptyState title="No procedures found" message="Create procedures from web or adjust your filters." />}
          </View>
        )}
      </ScrollView>

      <TemplateModal template={selectedTemplate} onClose={() => setSelectedTemplate(null)} onUse={useTemplate} />
      <ProcedureModal procedure={selectedProcedure} onClose={() => setSelectedProcedure(null)} />
    </View>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function TabButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.tabButton, active && styles.tabButtonActive]} onPress={onPress}>
      <Text style={[styles.tabButtonText, active && styles.tabButtonTextActive]}>{label}</Text>
    </Pressable>
  );
}

function TemplateCard({ template, onOpen, onUse, onDelete }: { template: WorkOrderTemplate; onOpen: () => void; onUse: () => void; onDelete: () => void }) {
  return (
    <Pressable style={styles.card} onPress={onOpen}>
      <View style={styles.cardHeader}>
        <View style={styles.cardIcon}>
          <MaterialCommunityIcons name="clipboard-text-outline" size={20} color="#742BDE" />
        </View>
        <View style={styles.cardTitleBlock}>
          <Text style={styles.cardTitle}>{getTemplateName(template)}</Text>
          <Text style={styles.cardSubtitle}>{getTemplateTitle(template)}</Text>
        </View>
        <View style={styles.statusPill}>
          <Text style={styles.statusText}>{getTemplateStatus(template)}</Text>
        </View>
      </View>
      <Text style={styles.cardDescription}>{template.description || "No description has been added yet."}</Text>
      <View style={styles.metaRow}>
        <Meta icon="sync" label={template.maintenance_type || "Other"} />
        <Meta icon="list" label={`${template.procedures?.length || 0} procedures`} />
        <Meta icon="cube" label={`${template.parts?.length || 0} parts`} />
      </View>
      <View style={styles.actionRow}>
        <Text style={styles.updatedText}>Updated {formatDate(template.updatedAt || template.createdAt)}</Text>
        <View style={styles.actions}>
          <Pressable style={styles.smallButton} onPress={onUse}>
            <Text style={styles.smallButtonText}>Use</Text>
          </Pressable>
          <Pressable style={styles.iconButton} onPress={onDelete}>
            <Ionicons name="trash-outline" size={16} color="#D63928" />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

function ProcedureCard({ procedure, onOpen, onDelete }: { procedure: ProcedureTemplate; onOpen: () => void; onDelete: () => void }) {
  return (
    <Pressable style={styles.card} onPress={onOpen}>
      <View style={styles.cardHeader}>
        <View style={styles.cardIcon}>
          <MaterialCommunityIcons name="format-list-checks" size={20} color="#742BDE" />
        </View>
        <View style={styles.cardTitleBlock}>
          <Text style={styles.cardTitle}>{procedure.name || "Untitled Procedure"}</Text>
          <Text style={styles.cardSubtitle}>{procedure.category || "Uncategorized"} · Version {procedure.version || 1}</Text>
        </View>
        <Pressable style={styles.iconButton} onPress={onDelete}>
          <Ionicons name="trash-outline" size={16} color="#D63928" />
        </Pressable>
      </View>
      <Text style={styles.cardDescription}>{procedure.description || "No description has been added yet."}</Text>
      <View style={styles.metaRow}>
        <Meta icon="list" label={`${procedure.steps?.length || 0} steps`} />
        <Meta icon="cube" label={`${procedure.required_parts?.length || 0} parts`} />
        <Meta icon="pricetag" label={(procedure.tags || []).slice(0, 2).join(", ") || "No tags"} />
      </View>
    </Pressable>
  );
}

function Meta({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View style={styles.meta}>
      <Ionicons name={icon} size={12} color="#6B6875" />
      <Text style={styles.metaText}>{label}</Text>
    </View>
  );
}

function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <View style={styles.emptyState}>
      <Ionicons name="file-tray-outline" size={34} color="#B8B2C8" />
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyMessage}>{message}</Text>
    </View>
  );
}

function TemplateModal({ template, onClose, onUse }: { template: WorkOrderTemplate | null; onClose: () => void; onUse: (template: WorkOrderTemplate) => void }) {
  return (
    <Modal visible={!!template} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{template ? getTemplateName(template) : ""}</Text>
            <Pressable onPress={onClose}>
              <Ionicons name="close" size={22} color="#222" />
            </Pressable>
          </View>
          {template ? (
            <ScrollView>
              <Text style={styles.modalSubtitle}>{getTemplateTitle(template)}</Text>
              <Text style={styles.modalBody}>{template.description || "No description added."}</Text>
              <PreviewSection title="Procedures" items={(template.procedures || []).map((item) => item.name)} />
              <PreviewSection title="Assignees" items={(template.assignees || []).map((item: any) => `${item.firstName || ""} ${item.lastName || ""}`.trim() || item.email)} />
              <PreviewSection title="Locations" items={(template.locations || []).map((item: any) => item.location_name || item.name)} />
              <PreviewSection title="Assets" items={(template.assets || []).map((item: any) => item.asset_name || item.name)} />
              <PreviewSection title="Parts" items={(template.parts || []).map((item: any) => `${item.part_name || "Part"} (${item.quantity || item.estimatedQuantity || 0})`)} />
              <Pressable style={styles.primaryModalButton} onPress={() => onUse(template)}>
                <Text style={styles.primaryModalButtonText}>Create Work Order From Template</Text>
              </Pressable>
            </ScrollView>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

function ProcedureModal({ procedure, onClose }: { procedure: ProcedureTemplate | null; onClose: () => void }) {
  return (
    <Modal visible={!!procedure} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{procedure?.name || ""}</Text>
            <Pressable onPress={onClose}>
              <Ionicons name="close" size={22} color="#222" />
            </Pressable>
          </View>
          {procedure ? (
            <ScrollView>
              <Text style={styles.modalSubtitle}>{procedure.category || "Uncategorized"} · Version {procedure.version || 1}</Text>
              <Text style={styles.modalBody}>{procedure.description || "No description added."}</Text>
              <PreviewSection title="Tags" items={procedure.tags || []} />
              <PreviewSection title="Required Parts" items={(procedure.required_parts || []).map((item) => `${item.part_name} (${item.quantity})`)} />
              <PreviewSection title="Steps" items={(procedure.steps || []).map((step, index) => `${index + 1}. ${step.title || step.type || "Step"}`)} />
            </ScrollView>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

function PreviewSection({ title, items }: { title: string; items: Array<string | undefined> }) {
  const values = items.map((item) => String(item || "").trim()).filter(Boolean);
  return (
    <View style={styles.previewSection}>
      <Text style={styles.previewTitle}>{title}</Text>
      {values.length ? values.map((item, index) => (
        <Text key={`${title}-${index}`} style={styles.previewItem}>{item}</Text>
      )) : <Text style={styles.previewEmpty}>None</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FA" },
  content: { padding: 16, paddingBottom: 32 },
  hero: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E7E4EF",
  },
  heroIcon: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: "#F2EBFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  heroText: { flex: 1 },
  kicker: { fontFamily: Fonts.semiBold, fontSize: 10, color: "#742BDE", textTransform: "uppercase" },
  heroTitle: { fontFamily: Fonts.semiBold, fontSize: 17, color: "#222", marginTop: 2 },
  heroDescription: { fontFamily: Fonts.regular, fontSize: 12, lineHeight: 17, color: "#6B6875", marginTop: 4 },
  statsRow: { flexDirection: "row", gap: 10, marginTop: 12 },
  statCard: { flex: 1, backgroundColor: "#fff", borderRadius: 8, padding: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: "#E7E4EF" },
  statValue: { fontFamily: Fonts.semiBold, fontSize: 18, color: "#222" },
  statLabel: { fontFamily: Fonts.regular, fontSize: 11, color: "#6B6875", marginTop: 2 },
  tabBar: { flexDirection: "row", backgroundColor: "#EDE7F8", borderRadius: 999, padding: 4, marginTop: 16 },
  tabButton: { flex: 1, borderRadius: 999, paddingVertical: 9, alignItems: "center" },
  tabButtonActive: { backgroundColor: "#742BDE" },
  tabButtonText: { fontFamily: Fonts.semiBold, fontSize: 12, color: "#742BDE" },
  tabButtonTextActive: { color: "#fff" },
  searchBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 8, paddingHorizontal: 12, marginTop: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: "#E1E8EE" },
  searchInput: { flex: 1, height: 42, marginLeft: 8, fontFamily: Fonts.regular, fontSize: 13, color: "#222" },
  filterRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: "#fff", borderWidth: StyleSheet.hairlineWidth, borderColor: "#E7E4EF" },
  filterChipActive: { backgroundColor: "#742BDE", borderColor: "#742BDE" },
  filterChipText: { fontFamily: Fonts.medium, fontSize: 11, color: "#6B6875" },
  filterChipTextActive: { color: "#fff" },
  loading: { padding: 28, alignItems: "center" },
  loadingText: { marginTop: 8, fontFamily: Fonts.regular, fontSize: 12, color: "#6B6875" },
  list: { marginTop: 12, gap: 10 },
  card: { backgroundColor: "#fff", borderRadius: 8, padding: 13, borderWidth: StyleSheet.hairlineWidth, borderColor: "#E7E4EF" },
  cardHeader: { flexDirection: "row", alignItems: "center" },
  cardIcon: { width: 38, height: 38, borderRadius: 8, backgroundColor: "#F2EBFF", alignItems: "center", justifyContent: "center", marginRight: 10 },
  cardTitleBlock: { flex: 1 },
  cardTitle: { fontFamily: Fonts.semiBold, fontSize: 14, color: "#222" },
  cardSubtitle: { fontFamily: Fonts.regular, fontSize: 11, color: "#6B6875", marginTop: 2 },
  cardDescription: { fontFamily: Fonts.regular, fontSize: 12, lineHeight: 17, color: "#575463", marginTop: 10 },
  statusPill: { borderRadius: 999, backgroundColor: "#EEF9F1", paddingHorizontal: 8, paddingVertical: 4 },
  statusText: { fontFamily: Fonts.semiBold, fontSize: 10, color: "#1F7A3A" },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  meta: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#F7F6FA", borderRadius: 999, paddingHorizontal: 8, paddingVertical: 5 },
  metaText: { fontFamily: Fonts.regular, fontSize: 10, color: "#6B6875" },
  actionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 12 },
  updatedText: { fontFamily: Fonts.regular, fontSize: 10, color: "#8B8B94" },
  actions: { flexDirection: "row", alignItems: "center", gap: 8 },
  smallButton: { backgroundColor: "#742BDE", borderRadius: 999, paddingHorizontal: 13, paddingVertical: 7 },
  smallButtonText: { fontFamily: Fonts.semiBold, fontSize: 11, color: "#fff" },
  iconButton: { padding: 8 },
  emptyState: { alignItems: "center", backgroundColor: "#fff", borderRadius: 8, padding: 28, borderWidth: StyleSheet.hairlineWidth, borderColor: "#E7E4EF" },
  emptyTitle: { marginTop: 10, fontFamily: Fonts.semiBold, fontSize: 14, color: "#222" },
  emptyMessage: { marginTop: 4, fontFamily: Fonts.regular, fontSize: 12, color: "#6B6875", textAlign: "center" },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "center", padding: 18 },
  modalCard: { maxHeight: "86%", backgroundColor: "#fff", borderRadius: 8, padding: 16 },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  modalTitle: { flex: 1, fontFamily: Fonts.semiBold, fontSize: 16, color: "#222", paddingRight: 12 },
  modalSubtitle: { fontFamily: Fonts.medium, fontSize: 12, color: "#742BDE", marginBottom: 8 },
  modalBody: { fontFamily: Fonts.regular, fontSize: 12, lineHeight: 18, color: "#575463", marginBottom: 8 },
  previewSection: { marginTop: 12 },
  previewTitle: { fontFamily: Fonts.semiBold, fontSize: 12, color: "#222", marginBottom: 6 },
  previewItem: { fontFamily: Fonts.regular, fontSize: 12, color: "#575463", marginBottom: 4 },
  previewEmpty: { fontFamily: Fonts.regular, fontSize: 12, color: "#8B8B94" },
  primaryModalButton: { backgroundColor: "#742BDE", borderRadius: 8, alignItems: "center", paddingVertical: 12, marginTop: 16 },
  primaryModalButtonText: { fontFamily: Fonts.semiBold, fontSize: 12, color: "#fff" },
});
