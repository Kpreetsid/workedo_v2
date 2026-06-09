import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
	Modal,
	View,
	Text,
	TextInput,
	TouchableOpacity,
	StyleSheet,
	ScrollView,
	ActivityIndicator
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { locationTree } from "@/src/services/location.service";
import Fonts from "@/constants/Typography";
import { useWorkOrderStore } from "@/src/state/workOrders/useWorkOrderStore";
import { useWorkRequestStore } from "@/src/state/workOrders/useWorkRequestStore";
import { usePreventiveStore } from "@/src/state/workOrders/usePreventiveStore";
import { usePartFormStore } from "@/src/state/inventory/usePartFormStore";
import { useCreateAssetStore } from "@/src/state/assets/useCreateAsset";
import { Location } from "@/src/types/location";
import { usePDMStore } from "@/src/state/sensors/usePDMStore";

export default function LocationPickerModal({
	comingFrom,
	visible,
	onClose,
	onSelectLocation,
}: {
	comingFrom?: string;
	visible: boolean;
	onClose: () => void;
	onSelectLocation?: (item: Location | null) => void;
}) {
	const [expanded, setExpanded] = useState<any>({});
	const [selectedId, setSelectedId] = useState<string | null>(null);   // ⭐ only 1 selected at a time
	const [locations, setLocations] = useState<Location[]>([]);

	const [loading, setLoading] = useState<boolean>(false);

	const { setWorkForm } = useWorkOrderStore();
	const { setWorkRequestForm } = useWorkRequestStore();
	const { setPreventiveValue } = usePreventiveStore();
	const { setPartFormValue } = usePartFormStore();
	const workOrderLocation = useWorkOrderStore((state) => state.location);
	const workRequestLocation = useWorkRequestStore((state) => state.location);
	const preventiveLocation = usePreventiveStore((state) => state.location);

	const {
		parent_location,
		locationObject,
		setParentLocation,
		setAssignedUsers,
		setLocationObject,
		setLocation,
		setCreateAssetValue
	} = useCreateAssetStore();
	const { selectedLocation, setSelectedLocation } = usePDMStore();

	const selectedLocationFromStore = useMemo(() => {
		if (comingFrom === "newWorkOrder") return workOrderLocation;
		if (comingFrom === "newWorkRequest") return workRequestLocation;
		if (comingFrom === "createPreventive") return preventiveLocation;
		if (comingFrom === "createAsset") return locationObject || parent_location;
		if (comingFrom === "PDMDashboard") return selectedLocation?.[0] ?? null;
		return null;
	}, [
		comingFrom,
		workOrderLocation,
		workRequestLocation,
		preventiveLocation,
		locationObject,
		parent_location,
		selectedLocation,
	]);

	const selectedLocationId = selectedLocationFromStore?.id || selectedLocationFromStore?._id || null;

	useEffect(() => {
		if (!visible) return;
		setSelectedId(selectedLocationId);
	}, [visible, selectedLocationId]);

	useFocusEffect(
		useCallback(() => {
			fetchLocations();
		}, [])
	);

	const fetchLocations = async () => {
		setLoading(true)
		try {
			const res = await locationTree();

			if (res.status) {
				console.log('res locations = ', res?.data);
				setLocations(res.data as Location[]);
				setLoading(false)
			}
		} catch (err: any) {
			console.error("Login failed:", err);
			setLoading(false)
		}
	};

	const toggleExpand = (id: string) => {
		setExpanded((prev: any) => ({ ...prev, [id]: !prev[id] }));
	};

	const clearSelectedLocation = () => {
		if (comingFrom === "newWorkOrder") {
			setWorkForm("location", null);
			setWorkForm("selected_asset", null);
			setWorkForm("assigned_users", []);
		} else if (comingFrom === "newWorkRequest") {
			setWorkRequestForm("location", null);
			setWorkRequestForm("selected_asset", null);
		} else if (comingFrom === "createPart") {
			setPartFormValue("location", null);
		} else if (comingFrom === "createPreventive") {
			setPreventiveValue("location", null);
			setPreventiveValue("selected_asset", null);
			setPreventiveValue("assigned_users", []);
		} else if (comingFrom === "createAsset") {
			setCreateAssetValue("parent_location", undefined);
			setAssignedUsers([]);
			setLocation(null);
			setLocationObject(null);
		} else if (comingFrom === "PDMDashboard") {
			setSelectedLocation(null);
		}
	};

	const handleSelect = (node: any) => {
		const nodeId = node?.id || node?._id;
		if (!nodeId) return;

		if (selectedId === nodeId) {
			setSelectedId(null);
			if (onSelectLocation) {
				onSelectLocation(null);
				return;
			}
			clearSelectedLocation();
			return;
		}

		setSelectedId(nodeId);
		if (onSelectLocation) {
			onSelectLocation(node);
			return;
		}
		onSelect(node);         // return selected node to parent
	};

	const onSelect = (item: Location) => {
		console.log('on item = ', item);

		if (comingFrom === "newWorkOrder") {
			setWorkForm("location", item);
			setWorkForm("selected_asset", null);
			setWorkForm("assigned_users", []);
		} else if (comingFrom === "newWorkRequest") {
			setWorkRequestForm("location", item);
			setWorkRequestForm("selected_asset", null);
		} else if (comingFrom === "createPart") {
			setPartFormValue("location", item);
		} else if (comingFrom === "createPreventive") {
			setPreventiveValue("location", item);
			setPreventiveValue("selected_asset", null);
		} else if (comingFrom === "createAsset") {
			setParentLocation({ id: item?.id, location_name: item?.location_name });
			setAssignedUsers([]);
			setLocation(item?.id);
			setLocationObject(item);
		} else if (comingFrom === "PDMDashboard") {
			setSelectedLocation({ id: item?.id, location_name: item?.location_name })
		}
		console.log("Selected:", item);
	}

	const renderNode = (node: any, depth = 0) => {
		const isSelected = selectedId === (node?.id || node?._id);

		return (
			<View key={node.id} style={{ marginLeft: depth * 18, marginVertical: 6 }}>
				<View style={styles.nodeRow}>
					{/* Expand Arrow */}
					{node.childs?.length > 0 ? (
						<TouchableOpacity onPress={() => toggleExpand(node.id)}>
							<Ionicons
								name={expanded[node.id] ? "chevron-down" : "chevron-forward"}
								size={18}
								color="#333"
							/>
						</TouchableOpacity>
					) : (
						<View style={{ width: 18, height: 18 }} />
					)}

					{/* Checkbox → replaced with single-select tick */}
					<TouchableOpacity onPress={() => handleSelect(node)} style={{ flexDirection: "row", alignItems: "center" }}>
						<View
							style={styles.checkboxContainer}
						>
							{isSelected ? (
								<View style={[styles.checkboxOutline, {
									backgroundColor: '#742BDE',
									borderColor: 'transparent'
								}]}>
									<Ionicons name="checkmark" size={12} color="#fff" />
								</View>
							) : (
								<View style={styles.checkboxOutline} />
							)}
						</View>

						{/* Label */}
						<Text style={styles.nodeText}>{node.location_name}</Text>
					</TouchableOpacity>
				</View>

				{/* Children */}
				{expanded[node.id] &&
					node.childs.map((child: any) => renderNode(child, depth + 1))}
			</View>
		);
	};

	return (
		<Modal visible={visible} transparent animationType="fade">
			<View style={styles.backdrop}>
				<View style={styles.modalBox}>
					{/* Search */}
					<View style={styles.searchRow}>
						<Ionicons name="search" size={20} color="#aaa" />
						<TextInput placeholder="Search..." style={styles.searchInput} placeholderTextColor={"#5A5D6C"} />
					</View>

					<View style={styles.separator} />

					{
						loading && <ActivityIndicator size={"small"} />
					}

					<ScrollView showsVerticalScrollIndicator={false}>
						{locations.map((node) => renderNode(node))}
					</ScrollView>

					{/* Buttons */}
					<View style={styles.footer}>
						<TouchableOpacity style={styles.saveBtn} onPress={onClose}>
							<Text style={styles.saveText}>Save</Text>
						</TouchableOpacity>
						<TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
							<Text style={styles.cancelText}>Cancel</Text>
						</TouchableOpacity>
					</View>
				</View>
			</View>
		</Modal>
	);
}

const styles = StyleSheet.create({
	backdrop: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.3)",
		justifyContent: "center",
		alignItems: "center"
	},
	modalBox: {
		width: "85%",
		height: "50%",
		backgroundColor: "#fff",
		borderRadius: 18,
		padding: 20
	},
	searchRow: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 10,
		borderBottomWidth: 1,
		borderColor: "#00000020",
	},
	searchInput: {
		marginLeft: 6,
		flex: 1,
		fontSize: 16
	},
	separator: {
		marginVertical: 12,
		height: 1,
		// backgroundColor: "#eee"
	},
	nodeRow: {
		flexDirection: "row",
		alignItems: "center"
	},
	checkboxContainer: {
		marginHorizontal: 8
	},
	checkboxOutline: {
		width: 18,
		height: 18,
		borderWidth: 1,
		borderRadius: 4,
		borderColor: "#656565",
		justifyContent: "center",
		alignItems: "center"
	},
	nodeText: {
		fontSize: 12,
		fontFamily: Fonts.regular,
		color: "#222"
	},
	footer: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginTop: 15
	},
	saveBtn: {
		backgroundColor: "#742BDE",
		paddingVertical: 10,
		paddingHorizontal: 25,
		borderRadius: 8
	},
	saveText: { color: "#fff", fontSize: 14, fontFamily: Fonts.regular },
	cancelBtn: {
		backgroundColor: "#eee",
		paddingVertical: 10,
		paddingHorizontal: 25,
		borderRadius: 8
	},
	cancelText: { color: "#333", fontSize: 14, fontFamily: Fonts.regular }
});
