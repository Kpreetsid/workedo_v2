import React, { useCallback, useState } from "react";
import {
	Modal,
	View,
	Text,
	TextInput,
	TouchableOpacity,
	StyleSheet,
	ScrollView
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { locationTree } from "@/src/services/location.service";
import Fonts from "@/constants/Typography";
import { useWorkOrderStore } from "@/src/store/useWorkOrderStore";
import { useWorkRequestStore } from "@/src/store/useWorkRequestStore";
import { usePreventiveStore } from "@/src/store/usePreventiveStore";
import { usePartFormStore } from "@/src/store/usePartFormStore";

export default function LocationPickerModal({ comingFrom, visible, onClose }: { comingFrom: string; visible: boolean; onClose: () => void }) {
	const [expanded, setExpanded] = useState<any>({});
	const [selectedId, setSelectedId] = useState<string | null>(null);   // ⭐ only 1 selected at a time
	const [locations, setLocations] = useState<Location[]>([]);

	const { setWorkForm } = useWorkOrderStore();
	const { setWorkRequestForm } = useWorkRequestStore();
	const { setPreventiveValue } = usePreventiveStore();
	const { setPartFormValue } = usePartFormStore();

	useFocusEffect(
		useCallback(() => {
			fetchLocations();
		}, [])
	);

	const fetchLocations = async () => {
		try {
			const res = await locationTree();

			if (res.status) {
				console.log('res locations = ', res?.data);
				setLocations(res.data as Location[]);
			}
		} catch (err: any) {
			console.error("Login failed:", err);
		}
	};

	const toggleExpand = (id: string) => {
		setExpanded((prev: any) => ({ ...prev, [id]: !prev[id] }));
	};

	const handleSelect = (node: any) => {
		setSelectedId(node.id);   // ⭐ overwrite previous selection
		onSelect(node);         // return selected node to parent
	};

	const onSelect = (item: Location) => {
		if (comingFrom === "newWorkOrder") {
			setWorkForm("location", item);
			setWorkForm("selected_asset", null);
			setWorkForm("assigned_users", []);
		} else if (comingFrom === "newWorkRequest") {
			setWorkRequestForm("location", item);
		} else if (comingFrom === "createPart") {
			setPartFormValue("location", item);
		} else {
			setPreventiveValue("location", item);
		}
		console.log("Selected:", item);
	}

	const renderNode = (node: any, depth = 0) => {
		const isSelected = selectedId === node.id;  // ⭐ highlight selected

		return (
			<View key={node.id} style={{ marginLeft: depth * 18, marginVertical: 6 }}>
				<View style={styles.nodeRow}>
					{/* Expand Arrow */}
					{node.childs?.length > 0 ? (
						<TouchableOpacity onPress={() => toggleExpand(node.id)}>
							<Ionicons
								name={expanded[node.id] ? "chevron-down" : "chevron-forward"}
								size={14}
								color="#333"
							/>
						</TouchableOpacity>
					) : (
						<View style={{ width: 18 }} />
					)}

					{/* Checkbox → replaced with single-select tick */}
					<TouchableOpacity onPress={() => handleSelect(node)} style={{ flexDirection: "row", alignItems: "center" }}>
						<TouchableOpacity
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
						</TouchableOpacity>

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
		backgroundColor: "#eee"
	},
	nodeRow: {
		flexDirection: "row",
		alignItems: "center"
	},
	checkboxContainer: {
		marginHorizontal: 8
	},
	checkboxOutline: {
		width: 16,
		height: 16,
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