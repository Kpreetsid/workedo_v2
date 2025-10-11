import { Pressable, StyleSheet, View, Text, Modal, FlatList, LayoutRectangle } from "react-native";
import Fonts from "@/constants/Typography";
import { ArrowRight } from "@/constants/IconProvider";
import { useState, useRef, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { AssetEndpoint } from "@/src/types/assetEndpoint";

interface SelectEndpointProps {
	endpointSelected: { name: string, asset_name: string },
	endpoints: AssetEndpoint[]
	asset_data: any
	onEndpointSelect: (endpoint: { name: string, composite_id: string, asset_name: string }) => void
}

export default function SelectEndpoint({ endpointSelected, endpoints, asset_data, onEndpointSelect }: SelectEndpointProps) {
	const [modalVisible, setModalVisible] = useState(false);
	const [selectedEndpoint, setSelectedEndpoint] = useState<AssetEndpoint>();
	const [buttonLayout, setButtonLayout] = useState<LayoutRectangle | null>(null);
	const buttonRef = useRef<View>(null);

	useEffect(() => {
	}, [])

	const handleSelect = (composite_id: string) => {
		let found = endpoints.find((endpoint) => endpoint.composite_id === composite_id);
		setSelectedEndpoint(found);
		onEndpointSelect({
			name: `${found?.point_name}-${found?.mount_location}`,
			composite_id: found?.composite_id || "",
			asset_name: asset_data?.asset_name,
		});
		setModalVisible(false);
	};

	const openModal = () => {
		buttonRef.current?.measure((_x, _y, width, height, pageX, pageY) => {
			setButtonLayout({ x: pageX, y: pageY, width, height });
			setModalVisible(true);
		});
	};

	return (
		<View style={styles.selectCard}>
			<View>
				<Text style={styles.assetName}>{endpointSelected?.name}</Text>
				<Text style={styles.assetDesc}>{endpointSelected?.asset_name}</Text>
			</View>

			<Pressable ref={buttonRef} style={styles.selectBtn} onPress={openModal}>
				<Text style={styles.selectText}>Select</Text>
				<ArrowRight />
			</Pressable>

			<Modal
				visible={modalVisible}
				transparent
				animationType="fade"
				onRequestClose={() => setModalVisible(false)}
			>
				<Pressable style={styles.overlay} onPress={() => setModalVisible(false)} />

				{buttonLayout && (
					<View style={[styles.modalContainer, { top: buttonLayout.y + buttonLayout.height + 6, left: buttonLayout.x - 100, right: 20 }]}>
						<Text style={styles.modalTitle}>Select Endpoint</Text>

						<FlatList
							data={endpoints}
							keyExtractor={(item) => item?.composite_id}
							style={{ maxHeight: 250 }}
							renderItem={({ item }) => {
								const isSelected = item?.composite_id === selectedEndpoint?.composite_id;
								return (
									<Pressable style={[styles.endpointItem, isSelected && styles.selectedItem]} onPress={() => handleSelect(item.composite_id)}>
										<View style={[styles.checkbox, isSelected && styles.checkedBox]}>
											{isSelected && <Ionicons name="checkmark" size={14} color="#fff" />}
										</View>
										<Text style={[styles.endpointText, isSelected && { color: "#742BDE" }]}>
											{item.point_name + " - " + item.mount_location + " (" + asset_data?.asset_name + ")"}
										</Text>
									</Pressable>
								)
							}} />
					</View>
				)}
			</Modal>
		</View>
	);
}

const styles = StyleSheet.create({
	selectCard: {
		backgroundColor: "#fff",
		borderRadius: 10,
		paddingVertical: 15,
		paddingHorizontal: 30,
		marginHorizontal: 20,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		elevation: 2,
	},
	assetName: {
		fontSize: 10,
		color: "#201f23",
		fontFamily: Fonts.semiBold,
	},
	assetDesc: {
		fontSize: 10,
		color: "#201f23",
		fontFamily: Fonts.regular,
	},
	selectBtn: {
		backgroundColor: "#742BDE",
		borderRadius: 6,
		paddingHorizontal: 15,
		paddingVertical: 6,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 5,
	},
	selectText: {
		color: "#fff",
		fontSize: 10,
		fontFamily: Fonts.regular,
		lineHeight: 18,
	},
	overlay: {
		flex: 1,
		backgroundColor: "transparent",
	},
	modalContainer: {
		position: "absolute",
		backgroundColor: "#fff",
		padding: 10,
		shadowColor: "#000",
		shadowOpacity: 0.1,
		shadowOffset: { width: 0, height: 2 },
		shadowRadius: 8,
		elevation: 6,
		borderTopLeftRadius: 10,
		borderTopRightRadius: 10,
	},
	modalTitle: {
		fontSize: 12,
		fontFamily: Fonts.semiBold,
		color: "#fff",
		marginBottom: 5,
		backgroundColor: "#742BDE",
		padding: 8,
		paddingLeft: 15,
	},
	endpointItem: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 8,
		paddingHorizontal: 10,
		borderRadius: 8,
		gap: 10,
	},
	selectedItem: {
		backgroundColor: "#742BDE06",
	},
	checkbox: {
		width: 18,
		height: 18,
		borderWidth: 1,
		borderColor: "#742BDE",
		borderRadius: 4,
		alignItems: "center",
		justifyContent: "center",
	},
	checkedBox: {
		backgroundColor: "#742BDE",
	},
	endpointText: {
		fontSize: 11,
		color: "#000",
		fontFamily: Fonts.light,
	},
});
