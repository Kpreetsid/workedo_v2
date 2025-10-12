import { Dimensions, findNodeHandle, FlatList, Modal, Pressable, StyleSheet, Text, TouchableOpacity, UIManager, View } from 'react-native'
import React, { useRef, useState } from 'react'
import Fonts from '@/constants/Typography';
import { Ionicons } from '@expo/vector-icons';
import { useAssetStore } from '@/src/store/useAssetStore';

const { width } = Dimensions.get("window");

const AssetFilter = () => {
	const signalOptions = ["Velocity", "Acceleration", "Displacement"];
	const valueTypeOptions = ["Rms", "Peak_to_peak", "Peak", "Kurtosis"];

	const {
		selectedSignal,
		selectedValueType,
		setSelectedSignal,
		setSelectedValueType
	} = useAssetStore();

	const [modalVisible, setModalVisible] = useState(false);
	const [currentType, setCurrentType] = useState<"signal" | "valueType" | null>(null);
	const [buttonLayout, setButtonLayout] = useState<any>(null);

	const velocityRef = useRef<View>(null);
	const rmsRef = useRef<View>(null);

	const openModal = (type: "signal" | "valueType") => {
		const ref = type === "signal" ? velocityRef : rmsRef;
		if (!ref.current) return;

		UIManager.measure(findNodeHandle(ref.current)!, (x, y, width, height, pageX, pageY) => {
			setButtonLayout({ x: pageX, y: pageY, width, height });
			setCurrentType(type);
			setModalVisible(true);
		});
	};

	const handleSelect = (value: string) => {
		if (currentType === "signal") setSelectedSignal(value);
		if (currentType === "valueType") setSelectedValueType(value);
		setModalVisible(false);
	};

	const options =
		currentType === "signal" ? signalOptions : currentType === "valueType" ? valueTypeOptions : [];

	const selectedValue =
		currentType === "signal" ? selectedSignal : selectedValueType;

	return (
		<View style={styles.modeTabs}>
			{/* Signal Button */}
			<Pressable ref={velocityRef} style={styles.modeTab} onPress={() => openModal("signal")}>
				<Text style={styles.modeTabText}>{selectedSignal}</Text>
			</Pressable>

			{/* Value Type Button */}
			<Pressable ref={rmsRef} style={styles.modeTab} onPress={() => openModal("valueType")}>
				<Text style={styles.modeTabText}>{selectedValueType}</Text>
			</Pressable>

			{/* Modal */}
			<Modal
				visible={modalVisible}
				transparent
				animationType="fade"
				onRequestClose={() => setModalVisible(false)}
			>
				<Pressable style={styles.overlay} onPress={() => setModalVisible(false)} />

				{buttonLayout && (
					<View
						style={[
							styles.modalContainer,
							{
								top: buttonLayout.y + buttonLayout.height + 8,
								left: buttonLayout.x - 20,
								right: 20,
							},
						]}
					>
						<Text style={styles.modalTitle}>
							{currentType === "signal" ? "Select Signal Type" : "Select Value Type"}
						</Text>

						<FlatList
							data={options}
							keyExtractor={(item) => item}
							style={{ maxHeight: 250 }}
							renderItem={({ item }) => {
								const isSelected = item === selectedValue;
								return (
									<Pressable
										style={[styles.endpointItem, isSelected && styles.selectedItem]}
										onPress={() => handleSelect(item)}
									>
										<View style={[styles.checkbox, isSelected && styles.checkedBox]}>
											{isSelected && <Ionicons name="checkmark" size={14} color="#fff" />}
										</View>
										<Text
											style={[
												styles.endpointText,
												isSelected && { color: "#742BDE" },
											]}
										>
											{item}
										</Text>
									</Pressable>
								);
							}}
						/>
					</View>
				)}
			</Modal>
		</View>
	);
}

export default AssetFilter

const styles = StyleSheet.create({
	modeTabs: {
		flexDirection: "row",
		gap: 10,
		flexWrap: "wrap",
		alignItems: "center",
		justifyContent: "space-around",
	},
	modeTab: {
		width: width / 3,
		backgroundColor: "#742BDE",
		paddingVertical: 6,
		borderRadius: 5,
		borderWidth: 0.3,
		borderColor: "#00000020",
		alignItems: "center",
	},
	modeTabText: {
		color: "#ffffff",
		fontSize: 10,
		fontFamily: Fonts.regular,
		textAlign: "center",
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