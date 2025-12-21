import { Dimensions, findNodeHandle, FlatList, Modal, Pressable, StyleSheet, Text, UIManager, View } from 'react-native';
import React, { useRef, useState } from 'react';
import Fonts from '@/constants/Typography';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get("window");

type AssetFilterProps = {
	selectedSignal: string;
	selectedValueType: string;
	onSignalChange: (v: string) => void;
	onValueTypeChange: (v: string) => void;
};

const SignalFilter = ({
	selectedSignal,
	selectedValueType,
	onSignalChange,
	onValueTypeChange,
}: AssetFilterProps) => {

	const signalOptions = ["Velocity", "Acceleration", "Displacement"];
	const valueTypeOptions = ["Rms", "Peak_to_peak", "Peak", "Kurtosis"];

	const [modalVisible, setModalVisible] = useState(false);
	const [currentType, setCurrentType] = useState<"signal" | "valueType" | null>(null);
	const [buttonLayout, setButtonLayout] = useState<any>(null);

	const signalRef = useRef<View>(null);
	const valueTypeRef = useRef<View>(null);

	// -------------------------------
	// OPEN DROPDOWN
	// -------------------------------
	const openModal = (type: "signal" | "valueType") => {
		const ref = type === "signal" ? signalRef : valueTypeRef;
		if (!ref.current) return;

		UIManager.measure(findNodeHandle(ref.current)!, (x, y, width, height, pageX, pageY) => {
			setButtonLayout({ x: pageX, y: pageY, width, height });
			setCurrentType(type);
			setModalVisible(true);
		});
	};

	// -------------------------------
	// HANDLE SELECT
	// -------------------------------
	const handleSelect = (value: string) => {
		if (currentType === "signal") onSignalChange(value);
		if (currentType === "valueType") onValueTypeChange(value);

		setModalVisible(false);
	};

	const options =
		currentType === "signal"
			? signalOptions
			: currentType === "valueType"
				? valueTypeOptions
				: [];

	const selectedValue =
		currentType === "signal" ? selectedSignal : selectedValueType;

	return (
		<View style={styles.modeTabs}>
			{/* Signal Button */}
			<Pressable ref={signalRef} style={styles.modeTab} onPress={() => openModal("signal")}>
				<Text style={styles.modeTabText}>{selectedSignal}</Text>
			</Pressable>

			{/* Value Type Button */}
			<Pressable ref={valueTypeRef} style={styles.modeTab} onPress={() => openModal("valueType")}>
				<Text style={styles.modeTabText}>{selectedValueType}</Text>
			</Pressable>

			{/* Dropdown Modal */}
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
};

export default SignalFilter;

const styles = StyleSheet.create({
	modeTabs: {
		width: '80%',
		flexDirection: "row",
		gap: 10,
		flexWrap: "wrap",
		alignItems: "center",
		justifyContent: "center",
	},
	modeTab: {
		width: width / 4.3,
		backgroundColor: "#fff",
		paddingVertical: 8,
		borderRadius: 8,
		borderWidth: 0.3,
		borderColor: "#00000020",
		alignItems: "center",
	},
	modeTabText: {
		color: "#00000080",
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