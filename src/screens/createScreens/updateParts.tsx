import Header from "@/src/components/global/Header";
import FormInput from "@/src/components/create-screens/FormInput";
import DropDownInput from "@/src/components/create-screens/DropDownInput";
import ActionButton from "@/src/components/create-screens/ActionButton";
import Fonts from "@/constants/Typography";
import { Text, TouchableOpacity, StyleSheet, View, Pressable, ToastAndroid } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";

import { getParts } from "@/src/services/part.service";
import { usePreventiveStore } from "@/src/state/workOrders/usePreventiveStore";
import { useWorkOrderStore } from "@/src/state/workOrders/useWorkOrderStore";
import { usePartFormStore } from "@/src/state/inventory/usePartFormStore";
import { useWorkRequestStore } from "@/src/state/workOrders/useWorkRequestStore";

export default function UpdateParts() {
	const router = useRouter();
	const params: any = useLocalSearchParams();
	const comingFrom = params?.comingFrom || "createPreventive";

	// ✅ pick correct store based on source
	const storeMap: any = {
		createPreventive: {
			store: usePreventiveStore,
			setter: "setPreventiveValue",
		},
		createPart: {
			store: usePartFormStore,
			setter: "setPartFormValue",
		},
		newWorkOrder: {
			store: useWorkOrderStore,
			setter: "setWorkForm",
		},
		NewWorkRequest: {
			store: useWorkRequestStore,
			setter: "setWorkRequestForm",
		},
	};

	const { store, setter } = storeMap[comingFrom] || storeMap.createPreventive;
	const setValue = store((s: any) => s[setter]);
	const partsInStore = store((s: any) => s.parts || []);

	const [parts, setParts] = useState<any[]>([]);
	const [selectedPart, setSelectedPart] = useState<any>(null);
	const quantityNeeded = useRef(0);

	useEffect(() => {
		fetchParts();
	}, []);

	const fetchParts = async () => {
		try {
			const res = await getParts();
			if (res.status && Array.isArray(res.data)) setParts(res.data);
		} catch (err) {
			console.error("Fetching parts failed:", err);
		}
	};

	const handlePartSelect = (name: string) => {
		const found = parts.find((p) => p.part_name === name);
		setSelectedPart(found || null);
	};

	const handleRemovePart = (partId: string) => {
		const updated = partsInStore.filter((p: any) => p.id !== partId && p._id !== partId);
		setValue("parts", updated);
	};

	const handleAddPart = () => {
		if (!selectedPart) {
			ToastAndroid.show("Select a part first", ToastAndroid.SHORT);
			return;
		}
		if (quantityNeeded.current === 0) {
			ToastAndroid.show("Quantity needed is required", ToastAndroid.SHORT);
			return;
		}
		if (quantityNeeded.current < selectedPart?.min_quantity) {
			ToastAndroid.show(
				`Minimum quantity should be greater than ${selectedPart.min_quantity}`,
				ToastAndroid.SHORT
			);
			return;
		}

		const newPart = {
			...selectedPart,
			estimatedQuantity: quantityNeeded.current,
		};

		const existing = partsInStore || [];
		const index = existing.findIndex(
			(p: any) => p.id === newPart.id || p._id === newPart._id
		);

		let updatedParts;
		if (index !== -1) {
			updatedParts = existing.map((p: any, i: any) =>
				i === index ? { ...p, estimatedQuantity: newPart.estimatedQuantity } : p
			);
		} else {
			updatedParts = [...existing, newPart];
		}

		setValue("parts", updatedParts);
		setSelectedPart(null);
		quantityNeeded.current = 0;
		ToastAndroid.show("Part added successfully", ToastAndroid.SHORT);
	};

	return (
		<>
			<Header title="Update Parts" />
			<KeyboardAwareScrollView bottomOffset={30} style={{ backgroundColor: '#F5F7FA' }}>
				<View style={{ marginVertical: 5 }} />

				{/* ✅ Dynamic Dropdown */}
				<View>
					<DropDownInput
						label="Part Name"
						value={selectedPart?.part_name}
						options={parts.map((p: any) => p.part_name)}
						onSelect={handlePartSelect}
						containerStyle={{ paddingHorizontal: 25 }}
					/>
				</View>

				<FormInput label="Part Number" value={selectedPart?.part_number} placeholder="Type Number" />
				<FormInput label="Part Type" value={selectedPart?.part_type} placeholder="Type Part" />
				<FormInput
					label="Available Quantity"
					value={selectedPart?.quantity?.toString()}
					placeholder="Type Quantity"
				/>

				<FormInput
					label="Quantity Needed"
					placeholder="0"
					onChange={(val: any) => {
						const value =
							val?.target?.value || val?.text || val?.nativeEvent?.text || val;
						quantityNeeded.current = Number(value);
					}}
				/>

				<TouchableOpacity
					activeOpacity={0.7}
					onPress={handleAddPart}
					style={styles.btnContainer}
				>
					<Text style={styles.btnText}>Add Part</Text>
				</TouchableOpacity>

				<View style={styles.partsContainer}>
					{partsInStore.length > 0 &&
						partsInStore.map((p: any, index: number) => (
							<View style={styles.partItem} key={index}>
								<Text style={styles.partText}>{p.part_name}</Text>
								<Text style={styles.partText}>({p.estimatedQuantity})</Text>
								<Pressable onPress={() => handleRemovePart(p.id || p._id)}>
									<Ionicons name="close" size={16} color="#000" />
								</Pressable>
							</View>
						))}
				</View>

				<ActionButton onPress={() => router.back()} label="Confirm" />
			</KeyboardAwareScrollView>
		</>
	);
}

const styles = StyleSheet.create({
	btnContainer: {
		marginHorizontal: 25,
		marginVertical: 10,
		backgroundColor: "#742BDE",
		borderWidth: 1,
		borderColor: "#E1E8EE",
		borderRadius: 4,
		alignSelf: "flex-start",
		width: 75,
		height: 30,
		alignItems: "center",
		justifyContent: "center",
	},
	btnText: {
		fontSize: 10,
		fontFamily: Fonts.regular,
		color: "#fff",
	},
	partsContainer: {
		paddingHorizontal: 25,
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 10,
	},
	partItem: {
		paddingHorizontal: 10,
		backgroundColor: "#fff",
		borderColor: "#999",
		borderWidth: 0.2,
		justifyContent: "center",
		padding: 6,
		gap: 5,
		borderRadius: 5,
		display: "flex",
		alignItems: "center",
		flexDirection: "row",
	},
	partText: {
		fontSize: 11,
		fontFamily: Fonts.regular,
		color: "#000",
	},
});
