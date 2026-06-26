import { useEffect, useState } from "react";
import {
	ActivityIndicator,
	Modal,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Fonts from "@/constants/Typography";
import { locationTree } from "@/src/services/location.service";
import { useCMMSStore, type CMMSParentLocation } from "@/src/store/useCMMSStore";
import { type Location } from "@/src/types/location";

type LocationNode = Pick<Location, "id" | "location_name"> & {
	childs?: LocationNode[];
};

type LocationPickerCMMSProps = {
	visible: boolean;
	onClose: () => void;
};

export default function LocationPickerCMMS({ visible, onClose }: LocationPickerCMMSProps) {
	const [expanded, setExpanded] = useState<Record<string, boolean>>({});
	const [selectedLocationsLocal, setSelectedLocationsLocal] = useState<CMMSParentLocation[]>([]);
	const [locations, setLocations] = useState<LocationNode[]>([]);
	const [loading, setLoading] = useState(false);

	const selectedLocations = useCMMSStore((state) => state.parentLocations);
	const setParentLocations = useCMMSStore((state) => state.setParentLocations);

	useEffect(() => {
		if (!visible) return;
		setSelectedLocationsLocal(selectedLocations ?? []);
		fetchLocations();
	}, [visible, selectedLocations]);

	const fetchLocations = async () => {
		setLoading(true);
		try {
			const res = await locationTree();
			if (res?.status) {
				setLocations((res.data ?? []) as LocationNode[]);
			}
		} catch (e: any) {
			console.log("error locations = ", e);
		} finally {
			setLoading(false);
		}
	};

	const toggleExpand = (id: string) => {
		setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
	};

	const handleSelect = (node: LocationNode) => {
		setSelectedLocationsLocal((prev) => {
			const exists = prev.some((location) => location.id === node.id);
			if (exists) {
				if (prev.length === 1) {
					return prev;
				}
				return prev.filter((location) => location.id !== node.id);
			}
			return [...prev, { id: node.id, location_name: node.location_name }];
		});
	};

	const onSave = () => {
		if (!selectedLocationsLocal.length) {
			onClose();
			return;
		}
		setParentLocations(selectedLocationsLocal);
		onClose();
	};

	const onCancel = () => {
		setSelectedLocationsLocal(selectedLocations ?? []);
		onClose();
	};

	const renderNode = (node: LocationNode, depth = 0) => {
		const isSelected = selectedLocationsLocal.some((location) => location.id === node.id);

		return (
			<View key={node.id} style={{ marginLeft: depth * 18, marginVertical: 6 }}>
				<View style={styles.nodeRow}>
					{node.childs?.length ? (
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

					<TouchableOpacity
						onPress={() => handleSelect(node)}
						style={{ flexDirection: "row", alignItems: "center" }}
					>
						<View style={styles.checkboxContainer}>
							{isSelected ? (
								<View style={[styles.checkboxOutline, styles.checkboxChecked]}>
									<Ionicons name="checkmark" size={12} color="#fff" />
								</View>
							) : (
								<View style={styles.checkboxOutline} />
							)}
						</View>
						<Text style={styles.nodeText}>{node.location_name}</Text>
					</TouchableOpacity>
				</View>

				{expanded[node.id] && node.childs?.map((child) => renderNode(child, depth + 1))}
			</View>
		);
	};

	return (
		<Modal visible={visible} transparent animationType="fade">
			<View style={styles.backdrop}>
				<View style={styles.modalBox}>
					<View style={styles.searchRow}>
						<Ionicons name="search" size={20} color="#aaa" />
						<TextInput
							placeholder="Search..."
							style={styles.searchInput}
							placeholderTextColor={"#5A5D6C"}
						/>
					</View>

					<View style={styles.separator} />

					{loading && <ActivityIndicator size="small" />}

					<ScrollView showsVerticalScrollIndicator={false}>
						{locations.map((node) => renderNode(node))}
					</ScrollView>

					<View style={styles.footer}>
						<TouchableOpacity style={styles.saveBtn} onPress={onSave}>
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
		alignItems: "center",
	},
	modalBox: {
		width: "85%",
		height: "50%",
		backgroundColor: "#fff",
		borderRadius: 18,
		padding: 20,
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
		fontSize: 16,
	},
	separator: {
		marginVertical: 12,
		height: 1,
	},
	nodeRow: {
		flexDirection: "row",
		alignItems: "center",
	},
	checkboxContainer: {
		marginHorizontal: 8,
	},
	checkboxOutline: {
		width: 18,
		height: 18,
		borderWidth: 1,
		borderRadius: 4,
		borderColor: "#656565",
		justifyContent: "center",
		alignItems: "center",
	},
	checkboxChecked: {
		backgroundColor: "#742BDE",
		borderColor: "transparent",
	},
	nodeText: {
		fontSize: 12,
		fontFamily: Fonts.regular,
		color: "#222",
	},
	footer: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginTop: 15,
	},
	saveBtn: {
		backgroundColor: "#742BDE",
		paddingVertical: 10,
		paddingHorizontal: 25,
		borderRadius: 8,
	},
	saveText: { color: "#fff", fontSize: 14, fontFamily: Fonts.regular },
	cancelBtn: {
		backgroundColor: "#eee",
		paddingVertical: 10,
		paddingHorizontal: 25,
		borderRadius: 8,
	},
	cancelText: { color: "#333", fontSize: 14, fontFamily: Fonts.regular },
});
