import React, { useCallback, useEffect, useState } from "react";
import {
	Modal,
	View,
	Text,
	TextInput,
	TouchableOpacity,
	StyleSheet,
	ScrollView,
	ToastAndroid,
	ActivityIndicator
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { locationTree } from "@/src/services/location.service";
import Fonts from "@/constants/Typography";
import { Asset } from "@/src/types/asset";
import { useWorkOrderStore } from "@/src/store/useWorkOrderStore";
import { useWorkRequestStore } from "@/src/store/useWorkRequestStore";
import { usePreventiveStore } from "@/src/store/usePreventiveStore";
import { getFilteredAssets } from "@/src/services/preventive.service";

export default function AssetPickerModal
	(
		{
			comingFrom,
			visible,
			onClose
		}:
			{
				comingFrom: string;
				visible: boolean;
				onClose: () => void;
			}
	) {

	// console.log('comingFrom = ', comingFrom);

	const { setWorkForm } = useWorkOrderStore();
	const { setWorkRequestForm } = useWorkRequestStore();
	const { setPreventiveValue } = usePreventiveStore();
	const [loading, setLoading] = useState<boolean>(false);

	const [expanded, setExpanded] = useState<any>({});
	const [selectedId, setSelectedId] = useState<string | null>(null);   // ⭐ only 1 selected at a time
	const [assets, setAssets] = useState<Asset[]>([]);

	const locationsList = comingFrom === "newWorkOrder" ?
		useWorkOrderStore((state) => state.location) : (comingFrom === 'newWorkRequest' ? useWorkRequestStore((state) => state.location) : (comingFrom === 'createPreventive' ? usePreventiveStore((state) => state.location) : null));


	useEffect(() => {
		if (visible) {
			console.log("Modal is now visible — fetching assets...");
			fetchAssets();

			return () => {
				setAssets([])
			}
		}
	}, [visible]);

	const fetchAssets = async () => {
		setLoading(true)
		try {
			console.log('locationsList = ', locationsList);
			if (!locationsList) {
				return;
			}
			const payload = {
				"locationList": [
					locationsList?.id || locationsList?._id
				]
			}

			console.log('locationsList = ', locationsList);
			const res = await getFilteredAssets(payload);

			if (res.status) {
				console.log('res assets = ', res?.data);
				setAssets(res?.data);
				setLoading(false)
			}
		} catch (err: any) {
			setLoading(false)
			console.error("Login failed:", err);
			if (!err.status) {
				if (err.message === "No data found") {
					ToastAndroid.show("No assets found", ToastAndroid.SHORT);
					setAssets([]);
				}
			}
		}
	};

	const toggleExpand = (id: string) => {
		setExpanded((prev: any) => ({ ...prev, [id]: !prev[id] }));
	};

	const handleSelect = (node: any) => {
		setSelectedId(node.id);   // ⭐ overwrite previous selection
		onSelect?.(node);         // return selected node to parent
	};

	const onSelect = (item: Asset) => {
		if (comingFrom === "newWorkOrder") {
			setWorkForm("selected_asset", item);
			setWorkForm("assigned_users", item.userList);
		} else if (comingFrom === "newWorkRequest") {
			setWorkRequestForm("selected_asset", item);
		} else if (comingFrom === "createPreventive") {
			setPreventiveValue("selected_asset", item);
			setPreventiveValue("assigned_users", item.userList);
		}
		console.log("Selected:", item);
	}

	const renderNode = (node: Asset | any, depth = 0) => {
		const isSelected = selectedId === node?.id;  // ⭐ highlight selected

		return (
			<View key={node?.id} style={{ marginLeft: depth * 18, marginVertical: 6 }}>
				<View style={styles.nodeRow}>
					{/* Expand Arrow */}
					{node && node?.childs?.length > 0 ? (
						<TouchableOpacity onPress={() => toggleExpand(node.id)}>
							<Ionicons
								name={expanded[node.id] ? "chevron-down" : "chevron-forward"}
								size={18}
								color="#333"
							/>
						</TouchableOpacity>
					) : (
						<View style={{ width: 18 }} />
					)}


					<TouchableOpacity onPress={() => handleSelect(node)} style={{ flexDirection: "row", alignItems: "center" }}>

						{/* Checkbox → replaced with single-select tick */}
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
						<Text style={styles.nodeText}>{node.asset_name}</Text>
					</TouchableOpacity>

				</View>

				{/* Children */}
				{expanded[node.id] &&
					node.childs!.map((child: any) => renderNode(child, depth + 1))}
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
						{assets.map((node) => renderNode(node))}
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