import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import {
  deleteAdminUser,
  getAdminUsers,
  getUserAssetMailPermissions,
  getUserRolePermissions,
  patchAdminUser,
  updateAdminUser,
  updateAssetMailFlags,
} from "@/src/services/admin.service";

type Tab = "users" | "access" | "mail";

const resolveId = (value: any): string => {
  if (!value) return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  return String(value.id || value._id || "");
};

const userName = (user: any) => {
  const name = `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
  return name || user?.username || user?.email || "Unknown user";
};

const roleLabel = (value?: string) => (value || "user").replace(/_/g, " ");

const formatLabel = (value: string) => value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

export default function AdminPanelScreen() {
  const [tab, setTab] = useState<Tab>("users");
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [search, setSearch] = useState("");
  const [roleData, setRoleData] = useState<any | null>(null);
  const [mailPermissions, setMailPermissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [savingMail, setSavingMail] = useState(false);

  const selectedUser = useMemo(
    () => users.find((user) => resolveId(user) === selectedUserId) || users[0],
    [users, selectedUserId]
  );

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return users;
    return users.filter((user) => [userName(user), user.email, user.username, user.user_role, user.user_status].join(" ").toLowerCase().includes(term));
  }, [search, users]);

  const fetchUsers = useCallback(async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    try {
      const res = await getAdminUsers();
      const list = Array.isArray(res?.data) ? res.data : [];
      setUsers(list);
      if (!selectedUserId && list.length) {
        setSelectedUserId(resolveId(list[0]));
      }
    } catch (error: any) {
      ToastAndroid.show(error?.message || "Unable to load users", ToastAndroid.LONG);
      setUsers([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedUserId]);

  const fetchUserDetails = useCallback(async () => {
    const userId = resolveId(selectedUser);
    if (!userId) {
      setRoleData(null);
      setMailPermissions([]);
      return;
    }

    setDetailLoading(true);
    try {
      const [roleRes, mailRes] = await Promise.all([
        getUserRolePermissions(userId).catch(() => ({ data: [] })),
        getUserAssetMailPermissions(userId).catch(() => ({ data: [] })),
      ]);
      setRoleData(Array.isArray(roleRes?.data) ? roleRes.data[0] : roleRes?.data || null);
      setMailPermissions(Array.isArray(mailRes?.data) ? mailRes.data.filter((entry: any) => entry.assetId && entry.asset) : []);
    } finally {
      setDetailLoading(false);
    }
  }, [selectedUser]);

  useFocusEffect(
    useCallback(() => {
      fetchUsers();
    }, [fetchUsers])
  );

  useFocusEffect(
    useCallback(() => {
      fetchUserDetails();
    }, [fetchUserDetails])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers(false);
    fetchUserDetails();
  };

  const updateStatus = (status: "active" | "inactive") => {
    const userId = resolveId(selectedUser);
    if (!userId) return;

    Alert.alert("Update User", `Set ${userName(selectedUser)} as ${status}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Update",
        onPress: async () => {
          try {
            const res = await updateAdminUser(userId, { user_status: status });
            if (res?.status) {
              ToastAndroid.show("User updated", ToastAndroid.SHORT);
              fetchUsers(false);
            }
          } catch (error: any) {
            ToastAndroid.show(error?.message || "Unable to update user", ToastAndroid.LONG);
          }
        },
      },
    ]);
  };

  const verifyUser = async () => {
    const userId = resolveId(selectedUser);
    if (!userId) return;
    try {
      const res = await patchAdminUser(userId, { isVerified: true });
      if (res?.status) {
        ToastAndroid.show("User verified", ToastAndroid.SHORT);
        fetchUsers(false);
      }
    } catch (error: any) {
      ToastAndroid.show(error?.message || "Unable to verify user", ToastAndroid.LONG);
    }
  };

  const confirmDelete = () => {
    const userId = resolveId(selectedUser);
    if (!userId) return;

    Alert.alert("Delete User", `Delete ${userName(selectedUser)}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const res = await deleteAdminUser(userId);
            if (res?.status) {
              ToastAndroid.show("User deleted", ToastAndroid.SHORT);
              setSelectedUserId("");
              fetchUsers(false);
            }
          } catch (error: any) {
            ToastAndroid.show(error?.message || "Unable to delete user", ToastAndroid.LONG);
          }
        },
      },
    ]);
  };

  const toggleMailFlag = (permissionId: string, key: "alert" | "danger" | "critical") => {
    setMailPermissions((current) => current.map((item) => {
      if (resolveId(item) !== permissionId) return item;
      return { ...item, [key]: !item[key] };
    }));
  };

  const saveMail = async () => {
    setSavingMail(true);
    try {
      const res = await updateAssetMailFlags(mailPermissions);
      if (res?.status) {
        ToastAndroid.show("Mail preferences updated", ToastAndroid.SHORT);
        fetchUserDetails();
      }
    } catch (error: any) {
      ToastAndroid.show(error?.message || "Unable to update mail preferences", ToastAndroid.LONG);
    } finally {
      setSavingMail(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Admin Panel" />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.summaryRow}>
          <Summary label="Users" value={users.length} />
          <Summary label="Active" value={users.filter((user) => user.user_status === "active").length} />
          <Summary label="Inactive" value={users.filter((user) => user.user_status !== "active").length} />
        </View>

        <View style={styles.tabs}>
          <Segment label="Users" active={tab === "users"} onPress={() => setTab("users")} />
          <Segment label="Access" active={tab === "access"} onPress={() => setTab("access")} />
          <Segment label="Mail" active={tab === "mail"} onPress={() => setTab("mail")} />
        </View>

        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color="#8B8B94" />
          <TextInput style={styles.searchInput} value={search} onChangeText={setSearch} placeholder="Search users" placeholderTextColor="#8B8B94" />
        </View>

        {loading ? (
          <View style={styles.loading}><ActivityIndicator color="#742BDE" /><Text style={styles.loadingText}>Loading users...</Text></View>
        ) : tab === "users" ? (
          <UsersTab users={filteredUsers} selectedUser={selectedUser} onSelect={(user: any) => setSelectedUserId(resolveId(user))} onActivate={() => updateStatus("active")} onDeactivate={() => updateStatus("inactive")} onVerify={verifyUser} onDelete={confirmDelete} />
        ) : detailLoading ? (
          <View style={styles.loading}><ActivityIndicator color="#742BDE" /><Text style={styles.loadingText}>Loading user details...</Text></View>
        ) : tab === "access" ? (
          <AccessTab user={selectedUser} roleData={roleData} />
        ) : (
          <MailTab rows={mailPermissions} onToggle={toggleMailFlag} onSave={saveMail} saving={savingMail} />
        )}
      </ScrollView>
    </View>
  );
}

function Summary({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

function Segment({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.segment, active && styles.segmentActive]} onPress={onPress}>
      <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{label}</Text>
    </Pressable>
  );
}

function UsersTab({ users, selectedUser, onSelect, onActivate, onDeactivate, onVerify, onDelete }: any) {
  if (!users.length) return <EmptyState title="No users found" message="No users match the current search." />;

  return (
    <View style={styles.list}>
      {users.map((user: any) => {
        const active = resolveId(user) === resolveId(selectedUser);
        return (
          <Pressable key={resolveId(user)} style={[styles.card, active && styles.selectedCard]} onPress={() => onSelect(user)}>
            <View style={styles.cardHeader}>
              <View style={styles.avatar}><Text style={styles.avatarText}>{userName(user).charAt(0).toUpperCase()}</Text></View>
              <View style={styles.cardTitleWrap}>
                <Text style={styles.cardTitle}>{userName(user)}</Text>
                <Text style={styles.cardMeta}>{user.email || user.username || "No email"}</Text>
              </View>
              <View style={[styles.statusPill, user.user_status === "active" && styles.statusActive]}>
                <Text style={[styles.statusText, user.user_status === "active" && styles.statusTextActive]}>{user.user_status || "inactive"}</Text>
              </View>
            </View>
            <Text style={styles.description}>Role: {roleLabel(user.user_role)} • Verified: {user.isVerified ? "Yes" : "No"}</Text>
            {active ? (
              <View style={styles.actions}>
                <Action label="Activate" icon="checkmark-circle-outline" onPress={onActivate} />
                <Action label="Deactivate" icon="pause-circle-outline" onPress={onDeactivate} />
                <Action label="Verify" icon="shield-checkmark-outline" onPress={onVerify} />
                <Action label="Delete" icon="trash-outline" danger onPress={onDelete} />
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

function AccessTab({ user, roleData }: { user: any; roleData: any }) {
  if (!user) return <EmptyState title="Select a user" message="Choose a user to inspect access permissions." />;
  const data = roleData?.data || {};
  const sections = Object.entries(data).filter(([, value]) => typeof value === "object" && value !== null);

  return (
    <View style={styles.list}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{userName(user)}</Text>
        <Text style={styles.cardMeta}>{sections.length} permission groups</Text>
      </View>
      {sections.length ? sections.map(([section, permissions]) => {
        const entries = Object.entries(permissions as Record<string, any>);
        const enabled = entries.filter(([, value]) => value === true).length;
        return (
          <View key={section} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.iconWrap}><Ionicons name="key-outline" size={20} color="#742BDE" /></View>
              <View style={styles.cardTitleWrap}>
                <Text style={styles.cardTitle}>{formatLabel(section)}</Text>
                <Text style={styles.cardMeta}>{enabled} of {entries.length} enabled</Text>
              </View>
            </View>
            <View style={styles.permissionRow}>
              {entries.map(([key, value]) => (
                <View key={key} style={[styles.permissionPill, value && styles.permissionPillActive]}>
                  <Text style={[styles.permissionText, value && styles.permissionTextActive]}>{formatLabel(key)}</Text>
                </View>
              ))}
            </View>
          </View>
        );
      }) : <EmptyState title="No permissions found" message="No role menu is available for this user." />}
    </View>
  );
}

function MailTab({ rows, onToggle, onSave, saving }: { rows: any[]; onToggle: (id: string, key: "alert" | "danger" | "critical") => void; onSave: () => void; saving: boolean }) {
  if (!rows.length) return <EmptyState title="No mail permissions" message="No mapped assets were found for this user." />;

  return (
    <View style={styles.list}>
      <Pressable style={[styles.saveButton, saving && styles.saveButtonDisabled]} onPress={onSave} disabled={saving}>
        <Text style={styles.saveButtonText}>{saving ? "Saving..." : "Save Mail Preferences"}</Text>
      </Pressable>
      {rows.map((row) => {
        const id = resolveId(row);
        return (
          <View key={id} style={styles.card}>
            <Text style={styles.cardTitle}>{row.asset?.asset_name || row.assetId?.asset_name || "Asset"}</Text>
            <Text style={styles.cardMeta}>{row.asset?.location_name || row.assetId?.location_name || "Mapped asset"}</Text>
            <View style={styles.actions}>
              {(["alert", "danger", "critical"] as const).map((key) => (
                <Pressable key={key} style={[styles.mailChip, row[key] && styles.mailChipActive]} onPress={() => onToggle(id, key)}>
                  <Text style={[styles.mailChipText, row[key] && styles.mailChipTextActive]}>{formatLabel(key)}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        );
      })}
    </View>
  );
}

function Action({ label, icon, danger, onPress }: { label: string; icon: keyof typeof Ionicons.glyphMap; danger?: boolean; onPress: () => void }) {
  return (
    <Pressable style={styles.actionButton} onPress={onPress}>
      <Ionicons name={icon} size={16} color={danger ? "#D63928" : "#742BDE"} />
      <Text style={[styles.actionText, danger && styles.dangerText]}>{label}</Text>
    </Pressable>
  );
}

function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <View style={styles.emptyState}>
      <Ionicons name="people-outline" size={36} color="#B8B2C8" />
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyMessage}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FA" },
  content: { padding: 16, paddingBottom: 32 },
  summaryRow: { flexDirection: "row", gap: 8 },
  summaryCard: { flex: 1, backgroundColor: "#fff", borderRadius: 8, padding: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: "#E7E4EF" },
  summaryLabel: { fontFamily: Fonts.semiBold, fontSize: 10, color: "#742BDE", textTransform: "uppercase" },
  summaryValue: { marginTop: 5, fontFamily: Fonts.semiBold, fontSize: 22, color: "#222" },
  tabs: { marginTop: 14, backgroundColor: "#fff", borderRadius: 8, padding: 4, flexDirection: "row", borderWidth: StyleSheet.hairlineWidth, borderColor: "#E7E4EF" },
  segment: { flex: 1, alignItems: "center", borderRadius: 6, paddingVertical: 9 },
  segmentActive: { backgroundColor: "#742BDE" },
  segmentText: { fontFamily: Fonts.semiBold, fontSize: 12, color: "#6B6875" },
  segmentTextActive: { color: "#fff" },
  searchBox: { marginTop: 14, minHeight: 44, backgroundColor: "#fff", borderRadius: 8, borderWidth: StyleSheet.hairlineWidth, borderColor: "#E7E4EF", flexDirection: "row", alignItems: "center", paddingHorizontal: 12, gap: 8 },
  searchInput: { flex: 1, fontFamily: Fonts.regular, fontSize: 13, color: "#222" },
  loading: { padding: 30, alignItems: "center" },
  loadingText: { marginTop: 8, fontFamily: Fonts.regular, fontSize: 12, color: "#6B6875" },
  list: { marginTop: 14, gap: 12 },
  card: { backgroundColor: "#fff", borderRadius: 8, padding: 14, borderWidth: StyleSheet.hairlineWidth, borderColor: "#E7E4EF" },
  selectedCard: { borderColor: "#742BDE" },
  cardHeader: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#742BDE", alignItems: "center", justifyContent: "center", marginRight: 10 },
  avatarText: { fontFamily: Fonts.semiBold, fontSize: 14, color: "#fff" },
  iconWrap: { width: 40, height: 40, borderRadius: 8, backgroundColor: "#F2EBFF", alignItems: "center", justifyContent: "center", marginRight: 10 },
  cardTitleWrap: { flex: 1, paddingRight: 8 },
  cardTitle: { fontFamily: Fonts.semiBold, fontSize: 15, color: "#222" },
  cardMeta: { marginTop: 3, fontFamily: Fonts.regular, fontSize: 11, color: "#8B8B94" },
  description: { marginTop: 10, fontFamily: Fonts.regular, fontSize: 12, color: "#575463" },
  statusPill: { borderRadius: 999, backgroundColor: "#FFF3D8", paddingHorizontal: 9, paddingVertical: 5 },
  statusActive: { backgroundColor: "#E6F6EA" },
  statusText: { fontFamily: Fonts.semiBold, fontSize: 10, color: "#8C5E00" },
  statusTextActive: { color: "#257A3E" },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  actionButton: { flexDirection: "row", alignItems: "center", gap: 5, paddingVertical: 7, paddingHorizontal: 8 },
  actionText: { fontFamily: Fonts.medium, fontSize: 12, color: "#742BDE" },
  dangerText: { color: "#D63928" },
  permissionRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  permissionPill: { borderRadius: 999, backgroundColor: "#F7F5FA", paddingHorizontal: 10, paddingVertical: 6 },
  permissionPillActive: { backgroundColor: "#E6F6EA" },
  permissionText: { fontFamily: Fonts.medium, fontSize: 10, color: "#6B6875" },
  permissionTextActive: { color: "#257A3E" },
  mailChip: { borderRadius: 999, backgroundColor: "#F7F5FA", paddingHorizontal: 12, paddingVertical: 8 },
  mailChipActive: { backgroundColor: "#742BDE" },
  mailChipText: { fontFamily: Fonts.medium, fontSize: 11, color: "#6B6875" },
  mailChipTextActive: { color: "#fff" },
  saveButton: { backgroundColor: "#742BDE", borderRadius: 8, alignItems: "center", paddingVertical: 12 },
  saveButtonDisabled: { opacity: 0.7 },
  saveButtonText: { fontFamily: Fonts.semiBold, fontSize: 13, color: "#fff" },
  emptyState: { marginTop: 14, alignItems: "center", backgroundColor: "#fff", borderRadius: 8, padding: 28, borderWidth: StyleSheet.hairlineWidth, borderColor: "#E7E4EF" },
  emptyTitle: { marginTop: 10, fontFamily: Fonts.semiBold, fontSize: 14, color: "#222" },
  emptyMessage: { marginTop: 4, fontFamily: Fonts.regular, fontSize: 12, color: "#6B6875", textAlign: "center" },
});
