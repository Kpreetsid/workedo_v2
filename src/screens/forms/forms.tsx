import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
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
import { deleteSopForm, getSopCategories, getSopForms } from "@/src/services/sop.service";
import { SopCategory, SopForm, SopFormComponent } from "@/src/types/sop";

const resolveId = (value: any): string => {
  if (!value) return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  return String(value.id || value._id || "");
};

const resolveName = (value: any, fallback = "Not assigned") => {
  if (!value) return fallback;
  if (typeof value === "string") return value;
  return value.name || value.location_name || value.title || fallback;
};

const formatDate = (value?: string) => {
  if (!value) return "No date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No date";
  return date.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
};

const flattenComponents = (components: SopFormComponent[] = []): SopFormComponent[] =>
  components.flatMap((component) => [component, ...flattenComponents(component.components || [])]);

export default function FormsScreen() {
  const [forms, setForms] = useState<SopForm[]>([]);
  const [categories, setCategories] = useState<SopCategory[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [previewForm, setPreviewForm] = useState<SopForm | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await getSopCategories();
      setCategories(Array.isArray(res?.data) ? res.data : []);
    } catch {
      setCategories([]);
    }
  }, []);

  const fetchForms = useCallback(async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    try {
      const res = await getSopForms({ category: selectedCategories });
      setForms(Array.isArray(res?.data) ? res.data : []);
    } catch (error: any) {
      if (error?.status !== 404) {
        ToastAndroid.show(error?.message || "Unable to load forms", ToastAndroid.LONG);
      }
      setForms([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCategories]);

  useFocusEffect(
    useCallback(() => {
      fetchCategories();
      fetchForms();
    }, [fetchCategories, fetchForms])
  );

  const filteredForms = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return forms;
    return forms.filter((form) => {
      const haystack = [
        form.name,
        form.description,
        resolveName(form.categoryId, ""),
        resolveName(form.locationId, ""),
      ].join(" ").toLowerCase();
      return haystack.includes(term);
    });
  }, [forms, search]);

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((current) =>
      current.includes(categoryId)
        ? current.filter((id) => id !== categoryId)
        : [...current, categoryId]
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchForms(false);
  };

  const confirmDelete = (form: SopForm) => {
    const formId = resolveId(form);
    if (!formId) return;

    Alert.alert("Delete Form", `Delete "${form.name || "this form"}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const res = await deleteSopForm(formId);
            if (res?.status) {
              ToastAndroid.show("Form deleted", ToastAndroid.SHORT);
              fetchForms(false);
            }
          } catch (error: any) {
            ToastAndroid.show(error?.message || "Unable to delete form", ToastAndroid.LONG);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Header title="Forms" />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>SOP Forms</Text>
          <Text style={styles.summaryValue}>{filteredForms.length}</Text>
          <Text style={styles.summaryText}>Reusable checklists linked to work orders and preventive plans.</Text>
        </View>

        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color="#8B8B94" />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search forms, categories, or locations"
            placeholderTextColor="#8B8B94"
          />
        </View>

        {categories.length ? (
          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Category</Text>
            <View style={styles.filterRow}>
              {categories.map((category) => {
                const categoryId = resolveId(category);
                const active = selectedCategories.includes(categoryId);
                return (
                  <Pressable
                    key={categoryId}
                    style={[styles.filterChip, active && styles.filterChipActive]}
                    onPress={() => toggleCategory(categoryId)}
                  >
                    <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                      {category.name || "Category"}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : null}

        {selectedCategories.length ? (
          <Pressable style={styles.clearButton} onPress={() => setSelectedCategories([])}>
            <Ionicons name="close-circle-outline" size={16} color="#742BDE" />
            <Text style={styles.clearButtonText}>Clear category filters</Text>
          </Pressable>
        ) : null}

        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator color="#742BDE" />
            <Text style={styles.loadingText}>Loading forms...</Text>
          </View>
        ) : filteredForms.length ? (
          <View style={styles.list}>
            {filteredForms.map((form) => (
              <FormCard
                key={resolveId(form)}
                form={form}
                onPreview={() => setPreviewForm(form)}
                onDelete={() => confirmDelete(form)}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={36} color="#B8B2C8" />
            <Text style={styles.emptyTitle}>No forms found</Text>
            <Text style={styles.emptyMessage}>Adjust your filters or create forms from the web builder.</Text>
          </View>
        )}
      </ScrollView>

      <FormPreviewModal form={previewForm} onClose={() => setPreviewForm(null)} />
    </View>
  );
}

function FormCard({ form, onPreview, onDelete }: { form: SopForm; onPreview: () => void; onDelete: () => void }) {
  const fields = flattenComponents(form.json_temp?.components || []).filter((component) => component.input !== false);

  return (
    <View style={styles.formCard}>
      <View style={styles.cardHeader}>
        <View style={styles.formIcon}>
          <Ionicons name="document-text-outline" size={20} color="#742BDE" />
        </View>
        <View style={styles.cardHeaderText}>
          <Text style={styles.formTitle}>{form.name || "Untitled form"}</Text>
          <Text style={styles.formMeta}>{resolveName(form.categoryId)} • {resolveName(form.locationId)}</Text>
        </View>
      </View>
      {form.description ? <Text style={styles.description}>{form.description}</Text> : null}
      <View style={styles.statsRow}>
        <View style={styles.statPill}>
          <Text style={styles.statText}>{fields.length} fields</Text>
        </View>
        <View style={styles.statPill}>
          <Text style={styles.statText}>Updated {formatDate(form.updatedAt || form.createdAt)}</Text>
        </View>
      </View>
      <View style={styles.actions}>
        <Pressable style={styles.actionButton} onPress={onPreview}>
          <Ionicons name="eye-outline" size={17} color="#742BDE" />
          <Text style={styles.actionText}>Preview</Text>
        </Pressable>
        <Pressable style={styles.actionButton} onPress={onDelete}>
          <Ionicons name="trash-outline" size={17} color="#D63928" />
          <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );
}

function FormPreviewModal({ form, onClose }: { form: SopForm | null; onClose: () => void }) {
  const components = flattenComponents(form?.json_temp?.components || []).filter((component) => component.input !== false);

  return (
    <Modal visible={!!form} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{form?.name || "Form Preview"}</Text>
            <Pressable onPress={onClose}><Ionicons name="close" size={22} color="#222" /></Pressable>
          </View>
          <ScrollView>
            {components.length ? components.map((component, index) => (
              <View key={`${component.key || component.label || "field"}-${index}`} style={styles.previewField}>
                <Text style={styles.previewLabel}>{component.label || component.key || "Field"}</Text>
                <Text style={styles.previewType}>{component.type || "component"}</Text>
                {component.values?.length ? (
                  <Text style={styles.previewOptions}>
                    Options: {component.values.map((item) => item.label || item.value).filter(Boolean).join(", ")}
                  </Text>
                ) : null}
              </View>
            )) : (
              <Text style={styles.emptyPreview}>No form fields configured.</Text>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FA" },
  content: { padding: 16, paddingBottom: 32 },
  summaryCard: { backgroundColor: "#fff", borderRadius: 8, padding: 14, borderWidth: StyleSheet.hairlineWidth, borderColor: "#E7E4EF" },
  summaryLabel: { fontFamily: Fonts.semiBold, fontSize: 11, color: "#742BDE", textTransform: "uppercase" },
  summaryValue: { fontFamily: Fonts.semiBold, fontSize: 26, color: "#222", marginTop: 4 },
  summaryText: { fontFamily: Fonts.regular, fontSize: 12, color: "#6B6875" },
  searchBox: { marginTop: 14, minHeight: 44, backgroundColor: "#fff", borderRadius: 8, borderWidth: StyleSheet.hairlineWidth, borderColor: "#E7E4EF", flexDirection: "row", alignItems: "center", paddingHorizontal: 12, gap: 8 },
  searchInput: { flex: 1, fontFamily: Fonts.regular, fontSize: 13, color: "#222" },
  filterSection: { marginTop: 14 },
  filterTitle: { fontFamily: Fonts.semiBold, fontSize: 12, color: "#222", marginBottom: 8 },
  filterRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: "#fff", borderWidth: StyleSheet.hairlineWidth, borderColor: "#E7E4EF" },
  filterChipActive: { backgroundColor: "#742BDE", borderColor: "#742BDE" },
  filterChipText: { fontFamily: Fonts.medium, fontSize: 11, color: "#6B6875" },
  filterChipTextActive: { color: "#fff" },
  clearButton: { marginTop: 12, flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", padding: 8 },
  clearButtonText: { fontFamily: Fonts.semiBold, fontSize: 12, color: "#742BDE" },
  loading: { padding: 30, alignItems: "center" },
  loadingText: { marginTop: 8, fontFamily: Fonts.regular, fontSize: 12, color: "#6B6875" },
  list: { marginTop: 14, gap: 12 },
  formCard: { backgroundColor: "#fff", borderRadius: 8, padding: 14, borderWidth: StyleSheet.hairlineWidth, borderColor: "#E7E4EF" },
  cardHeader: { flexDirection: "row", alignItems: "center" },
  formIcon: { width: 40, height: 40, borderRadius: 8, backgroundColor: "#F2EBFF", alignItems: "center", justifyContent: "center", marginRight: 10 },
  cardHeaderText: { flex: 1 },
  formTitle: { fontFamily: Fonts.semiBold, fontSize: 15, color: "#222" },
  formMeta: { marginTop: 3, fontFamily: Fonts.regular, fontSize: 11, color: "#8B8B94" },
  description: { marginTop: 10, fontFamily: Fonts.regular, fontSize: 13, color: "#575463", lineHeight: 18 },
  statsRow: { marginTop: 10, flexDirection: "row", flexWrap: "wrap", gap: 8 },
  statPill: { borderRadius: 999, backgroundColor: "#F7F5FA", paddingHorizontal: 10, paddingVertical: 6 },
  statText: { fontFamily: Fonts.medium, fontSize: 11, color: "#6B6875" },
  actions: { marginTop: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#EEE", paddingTop: 10, flexDirection: "row", alignItems: "center", gap: 10 },
  actionButton: { flexDirection: "row", alignItems: "center", gap: 5, paddingVertical: 7, paddingHorizontal: 8 },
  actionText: { fontFamily: Fonts.medium, fontSize: 12, color: "#742BDE" },
  deleteText: { color: "#D63928" },
  emptyState: { marginTop: 14, alignItems: "center", backgroundColor: "#fff", borderRadius: 8, padding: 28, borderWidth: StyleSheet.hairlineWidth, borderColor: "#E7E4EF" },
  emptyTitle: { marginTop: 10, fontFamily: Fonts.semiBold, fontSize: 14, color: "#222" },
  emptyMessage: { marginTop: 4, fontFamily: Fonts.regular, fontSize: 12, color: "#6B6875", textAlign: "center" },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "center", padding: 18 },
  modalCard: { maxHeight: "88%", backgroundColor: "#fff", borderRadius: 8, padding: 16 },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  modalTitle: { flex: 1, paddingRight: 10, fontFamily: Fonts.semiBold, fontSize: 16, color: "#222" },
  previewField: { borderRadius: 8, borderWidth: StyleSheet.hairlineWidth, borderColor: "#E7E4EF", padding: 12, marginBottom: 10 },
  previewLabel: { fontFamily: Fonts.semiBold, fontSize: 13, color: "#222" },
  previewType: { marginTop: 4, fontFamily: Fonts.medium, fontSize: 11, color: "#742BDE", textTransform: "uppercase" },
  previewOptions: { marginTop: 6, fontFamily: Fonts.regular, fontSize: 12, color: "#575463" },
  emptyPreview: { fontFamily: Fonts.regular, fontSize: 12, color: "#8B8B94", textAlign: "center", padding: 18 },
});
