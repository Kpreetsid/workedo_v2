import React, { useCallback, useEffect, useState } from "react";
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
import { Location } from "@/src/types/location";
import { type OverviewParentLocation, useOverviewStore } from "@/src/store/useOverviewStore";

export default function LocationPickerPDM({
	visible,
	onClose,
}: {
	comingFrom?: string;
	visible: boolean;
	onClose: () => void;
	onSelectLocation?: (item: Location) => void;
}) {
	const [expanded, setExpanded] = useState<any>({});
	const [selectedLocationsLocal, setSelectedLocationsLocal] = useState<OverviewParentLocation[]>([]);
	const [locations, setLocations] = useState<Location[]>([]);

	const [loading, setLoading] = useState<boolean>(false);

	const selectedLocation = useOverviewStore((state) => state.parentLocations);
	const setSelectedLocation = useOverviewStore((state) => state.setParentLocations);

	useEffect(() => {
		if (!visible) return;
		setSelectedLocationsLocal(selectedLocation ?? []);
	}, [visible, selectedLocation]);

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

	const handleSelect = (node: any) => {
		setSelectedLocationsLocal((prev) => {
			const isAlreadySelected = prev.some((location) => location.id === node.id);

			if (isAlreadySelected) {
				if (prev.length === 1) {
					return prev;
				}
				return prev.filter((location) => location.id !== node.id);
			}

			return [...prev, { id: node.id, location_name: node.location_name }];
		});
	};

	const allLocationsSelected = locations.length > 0 && locations.every((node) =>
		selectedLocationsLocal.some((location) => location.id === node.id)
	);

	const handleSelectAll = () => {
		if (allLocationsSelected) {
			setSelectedLocationsLocal([]);
			return;
		}

		setSelectedLocationsLocal(
			locations.map((node) => ({
				id: node.id,
				location_name: node.location_name,
			}))
		);
	};

	const onSave = () => {
		if (!selectedLocationsLocal.length) {
			onClose();
			return;
		}
		setSelectedLocation(selectedLocationsLocal);
		onClose();
	};

	const onCancel = () => {
		setSelectedLocationsLocal(selectedLocation ?? []);
		onClose();
	};

	const renderNode = (node: any, depth = 0, ancestorSelected = false) => {
		const isSelected = ancestorSelected || selectedLocationsLocal.some((location) => location.id === node.id);

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

					{/* Checkbox */}
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
						node.childs?.map((child: any) => renderNode(child, depth + 1, isSelected))}
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

					{!loading && locations.length > 0 && (
						<TouchableOpacity style={styles.selectAllRow} onPress={handleSelectAll}>
							<View style={styles.checkboxContainer}>
								<View style={[styles.checkboxOutline, allLocationsSelected && styles.checkboxChecked]}>
									{allLocationsSelected && <Ionicons name="checkmark" size={12} color="#fff" />}
								</View>
							</View>
							<Text style={styles.selectAllText}>Select All</Text>
						</TouchableOpacity>
					)}

					<ScrollView showsVerticalScrollIndicator={false}>
						{locations.map((node) => renderNode(node))}
					</ScrollView>

					{/* Buttons */}
					<View style={styles.footer}>
						<TouchableOpacity
							style={[styles.saveBtn, !selectedLocationsLocal.length && styles.saveBtnDisabled]}
							onPress={onSave}
							disabled={!selectedLocationsLocal.length}
						>
							<Text style={styles.saveText}>Save</Text>
						</TouchableOpacity>
						<TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
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
	checkboxChecked: {
		backgroundColor: "#742BDE",
		borderColor: "transparent",
	},
	selectAllRow: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 8,
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: "#E5E7EB",
		marginBottom: 4,
	},
	selectAllText: {
		fontSize: 12,
		fontFamily: Fonts.semiBold,
		color: "#222",
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
	saveBtnDisabled: {
		opacity: 0.45,
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
