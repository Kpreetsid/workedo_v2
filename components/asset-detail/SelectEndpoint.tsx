import { Pressable, StyleSheet, View, Text, Modal, FlatList, LayoutRectangle } from "react-native";
import Fonts from "@/constants/Typography";
import { ArrowRight } from "@/constants/IconProvider";
import { useState, useRef, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { AssetEndpoint } from "@/src/types/assetEndpoint";

interface SelectEndpointProps {
	endpointSelected: AssetEndpoint | null,
	endpoints: AssetEndpoint[]
	asset_data: any
	onEndpointSelect: (endpoint: AssetEndpoint) => void
}

export default function SelectEndpoint({ endpointSelected, endpoints, asset_data, onEndpointSelect }: SelectEndpointProps) {
	const [modalVisible, setModalVisible] = useState(false);
	const [infoModalVisible, setInfoModalVisible] = useState(false);
	const [selectedEndpoint, setSelectedEndpoint] = useState<AssetEndpoint>();
	const [buttonLayout, setButtonLayout] = useState<LayoutRectangle | null>(null);
	const buttonRef = useRef<View>(null);

	useEffect(() => {
		setSelectedEndpoint(endpointSelected!);
	}, [endpointSelected])

	const handleSelect = (composite_id: string) => {
		let found = endpoints.find((endpoint) => endpoint.composite_id === composite_id);
		setSelectedEndpoint(found);
		onEndpointSelect(found!);
		setModalVisible(false);
	};

	const openModal = () => {
		buttonRef.current?.measure((_x, _y, width, height, pageX, pageY) => {
			setButtonLayout({ x: pageX, y: pageY, width, height });
			setModalVisible(true);
		});
	};

	const infoRows = [
		{
			label: "Asset Name",
			value: endpointSelected?.asset_name || "Id Fan Updated",
		},
		{
			label: "Asset Type",
			value: endpointSelected?.asset_type || "",
		},
		{
			label: "Composite ID",
			value: endpointSelected?.composite_id || "",
		},
		{
			label: "MAC ID",
			value: endpointSelected?.mac_id || "",
		},
		{
			label: "Mount Direction",
			value: endpointSelected?.mount_direction,
		},
		{
			label: "Linked Status",
			value: endpointSelected?.is_linked == false ? "Not Linked" : "Linked",
		},
	];

	return (
		<View style={styles.selectCard}>
			<View style={styles.assetInfoRow}>
				<View>
					<Text style={styles.assetName}>
						{endpointSelected?.point_name}-{endpointSelected?.mount_location}
					</Text>
					<Text style={styles.assetDesc}>{endpointSelected?.asset_name}</Text>
				</View>
			</View>

			<View style={{flexDirection: 'row', gap: 20}}>
				<Pressable
					onPress={() => setInfoModalVisible(true)}
					style={styles.infoButton}
					hitSlop={8}
				>
					<Ionicons name="information-circle-outline" size={18} color="#742BDE" />
				</Pressable>

				<Pressable ref={buttonRef} style={styles.selectBtn} onPress={openModal}>
					<Text style={styles.selectText}>Select</Text>
					<ArrowRight />
				</Pressable>
			</View>

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

			<Modal
				visible={infoModalVisible}
				transparent
				animationType="fade"
				onRequestClose={() => setInfoModalVisible(false)}
			>
				<View style={styles.infoOverlay}>
					<View style={styles.infoCard}>
						<View style={styles.infoHeader}>
							<Text style={styles.infoTitle}>Device Details</Text>
							<Pressable
								onPress={() => setInfoModalVisible(false)}
								style={styles.infoClose}
								hitSlop={6}
							>
								<Ionicons name="close" size={16} color="#fff" />
							</Pressable>
						</View>

						<View style={styles.infoBody}>
							{infoRows.map((row) => (
								<View key={row.label} style={styles.infoRow}>
									<Text style={styles.infoLabel}>{row.label}</Text>
									<Text style={styles.infoColon}>:</Text>
									<Text
										style={[
											styles.infoValue,
											row.label === "Linked Status" && styles.infoStatusValue,
										]}
									>
										{row.value}
									</Text>
								</View>
							))}
						</View>

						<Pressable
							style={styles.infoCloseButton}
							onPress={() => setInfoModalVisible(false)}
						>
							<Text style={styles.infoCloseText}>Close</Text>
						</Pressable>
					</View>
				</View>
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
	assetInfoRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
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
	infoButton: {
		alignSelf: "center",
		paddingLeft: 2,
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
	infoOverlay: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.35)",
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 16,
	},
	infoCard: {
		width: "100%",
		backgroundColor: "#fff",
		borderRadius: 10,
		overflow: "hidden",
	},
	infoHeader: {
		backgroundColor: "#742BDE",
		paddingHorizontal: 16,
		paddingVertical: 12,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	infoTitle: {
		color: "#fff",
		fontSize: 16,
		fontFamily: Fonts.semiBold,
	},
	infoClose: {
		width: 24,
		height: 24,
		borderRadius: 12,
		backgroundColor: "rgba(255,255,255,0.25)",
		alignItems: "center",
		justifyContent: "center",
	},
	infoBody: {
		paddingHorizontal: 16,
		paddingVertical: 12,
	},
	infoRow: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 10,
		borderBottomWidth: 1,
		borderBottomColor: "#E5E7EB",
	},
	infoLabel: {
		width: 110,
		fontSize: 12,
		fontFamily: Fonts.semiBold,
		color: "#111827",
	},
	infoColon: {
		marginHorizontal: 6,
		color: "#111827",
		fontFamily: Fonts.semiBold,
	},
	infoValue: {
		flex: 1,
		fontSize: 12,
		color: "#111827",
		fontFamily: Fonts.regular,
	},
	infoStatusValue: {
		color: "#EF4444",
		fontFamily: Fonts.semiBold,
	},
	infoCloseButton: {
		alignSelf: "flex-end",
		backgroundColor: "#6B7280",
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 8,
		margin: 16,
	},
	infoCloseText: {
		color: "#fff",
		fontSize: 12,
		fontFamily: Fonts.semiBold,
	},
});
