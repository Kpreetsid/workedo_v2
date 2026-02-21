import React, { useEffect, useState } from "react";
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
import Fonts from "@/constants/Typography";
import { useOverviewStore } from "@/src/store/useOverviewStore";

type AssetNode = {
	id: string;
	asset_name: string;
};

export default function AssetPickerPDM
	(
		{
			visible,
			onClose
		}:
			{
				visible: boolean;
				onClose: () => void;
			}
	) {

	const childAssets = useOverviewStore((state) => state.childAssets);
	const selectedAssetIds = useOverviewStore((state) => state.selectedAssets);
	const setSelectedAssets = useOverviewStore((state) => state.setSelectedAssets);

	const parentAssets = childAssets as AssetNode[];
	const [selectedIdsLocal, setSelectedIdsLocal] = useState<string[]>([]);

	useEffect(() => {
		if (!visible) return;
		const parentAssetIds = new Set(parentAssets.map((asset) => asset.id));
		setSelectedIdsLocal((selectedAssetIds ?? []).filter((id) => parentAssetIds.has(id)));
	}, [visible, selectedAssetIds, childAssets]);

	const handleSelect = (nodeId: string) => {
		setSelectedIdsLocal((prev) => {
			if (prev.includes(nodeId)) {
				return prev.filter((id) => id !== nodeId);
			}
			return [...prev, nodeId];
		});
	};

	const onSave = () => {
		setSelectedAssets(selectedIdsLocal);
		onClose();
	};

	const onCancel = () => {
		setSelectedIdsLocal(selectedAssetIds ?? []);
		onClose();
	};

	const renderNode = (node: AssetNode) => {
		const isSelected = selectedIdsLocal.includes(node?.id);

		return (
			<View key={node?.id} style={{ marginVertical: 6 }}>
				<View style={styles.nodeRow}>
					<View style={{ width: 18 }} />


					<TouchableOpacity onPress={() => handleSelect(node.id)} style={{ flexDirection: "row", alignItems: "center" }}>

						{/* Checkbox */}
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
						{parentAssets.map((node) => renderNode(node))}
					</ScrollView>

					{/* Buttons */}
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
