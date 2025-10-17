import Header from "@/components/global/Header";
import FormInput from "@/components/create-screens/FormInput";
import { Text, TouchableOpacity, StyleSheet, View, Pressable, ToastAndroid } from "react-native";
import Fonts from "@/constants/Typography";
import ActionButton from "@/components/create-screens/ActionButton";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import DropDownInput from "@/components/create-screens/DropDownInput";
import { useEffect, useRef, useState } from "react";
import { usePreventiveStore } from "@/src/store/usePreventiveStore";
import { getParts } from "@/src/services/part.service";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useWorkOrderStore } from "@/src/store/useWorkOrderStore";

export default function UpdateParts() {
	const params: any = useLocalSearchParams();
	const comingFrom = params?.comingFrom;
	console.log('comingFrom = ', comingFrom);


	const router = useRouter();
	const [selectedPart, setSelectedPart] = useState<string>("");
	const [part, setPart] = useState<any>(null);

	const [parts, setParts] = useState<any[]>([]);
	const { formData, setFormValue } = usePreventiveStore();
	const { setWorkForm } = useWorkOrderStore();
	const workOrderParts = useWorkOrderStore((state) => state.parts);
	const quantityNeeded = useRef(0);

	useEffect(() => {
		fetchParts();
	}, []);

	const fetchParts = async () => {
		try {
			const res = await getParts();
			console.log("Parts:", res);
			if (res.status && Array.isArray(res.data)) {
				setParts(res.data);
			}
		} catch (err: any) {
			console.error("Fetching parts failed:", err);
		}
	};

	useEffect(() => {
		console.log('selected part = ', selectedPart);
		const part = parts.find((p: any) => p.part_name === selectedPart);
		console.log('part = ', part);
		setPart(part);
	}, [selectedPart]);

	const handleRemovePart = (partId: string) => {
		const updatedParts = formData.parts.filter(
			(p: any) => p.id !== partId && p._id !== partId
		);
		setFormValue("parts", updatedParts);
	};

	const addPart = async () => {
		console.log('add part', quantityNeeded.current, part?.min_quantity);
		if (quantityNeeded.current == 0) {
			ToastAndroid.show("Quantity needed is required", ToastAndroid.SHORT);
			return;
		}

		if (quantityNeeded.current < part?.min_quantity) {
			ToastAndroid.show("Minimum Quantity needed should be greater " + part?.min_quantity, ToastAndroid.SHORT);
			return;
		}

		// add quantityNeeded into part as well
		// assign quantity
		part.estimatedQuantity = quantityNeeded.current;
		quantityNeeded.current = 0;

		// get existing parts
		const existingParts = formData.parts || [];

		// find index of part (match by id or _id)
		const existingIndex = existingParts.findIndex(
			(p: any) => p.id === part.id || p._id === part._id
		);

		let updatedParts = [];

		if (existingIndex !== -1) {
			// ✅ Part exists — update its quantity_needed
			updatedParts = existingParts.map((p, i) =>
				i === existingIndex
					? { ...p, quantity_needed: part.quantity_needed }
					: p
			);
		} else {
			// ✅ Part does not exist — add new one
			updatedParts = [...existingParts, part];
		}

		if (comingFrom === "newWorkOrder") {
			setWorkForm("parts", updatedParts);
		} else {
			setFormValue("parts", updatedParts);
		}

		setSelectedPart("");
		setPart(null);
	}

	return (
		<>
			<Header title="Update Parts" />
			<KeyboardAwareScrollView bottomOffset={30}>
				<View style={{ marginVertical: 5 }} />

				<DropDownInput label="Part Name" value={selectedPart} options={parts.map((p: any) => p.part_name)} onSelect={(val) => setSelectedPart(val)} />

				<FormInput label="Part Number" value={part?.part_number} placeholder="Type Number" />

				<FormInput label="Part Type" value={part?.part_type} placeholder="Type Part" />

				<FormInput label="Available Quantity" value={part?.quantity.toString()} placeholder="Type Quantity" />

				<FormInput
					label="Quantity Needed"
					placeholder="0"
					onChange={(val: any) => {
						const value = val?.target?.value || val?.text || val?.nativeEvent?.text || val;
						quantityNeeded.current = Number(value);
					}}
				/>

				<TouchableOpacity activeOpacity={0.7} onPress={addPart} style={styles.btnContainer}>
					<Text style={styles.btnText}>Add Part</Text>
				</TouchableOpacity>

				{
					comingFrom === "newWorkOrder" ?
						<View style={styles.partsContainer}>
							{workOrderParts.length > 0 &&
								workOrderParts.map((part: any, index: number) => (
									<View style={styles.partItem} key={index}>
										<Text style={styles.partText}>{part?.part_name}</Text>
										<Text style={styles.partText}>({part?.estimatedQuantity})</Text>
										<Pressable onPress={() => handleRemovePart(part.id || part._id)}>
											<Ionicons name="close" size={16} color="#000" />
										</Pressable>
									</View>
								))}
						</View>
						:
						<View style={styles.partsContainer}>
							{formData.parts.length > 0 &&
								formData.parts.map((part: any, index: number) => (
									<View style={styles.partItem} key={index}>
										<Text style={styles.partText}>{part?.part_name}</Text>
										<Text style={styles.partText}>({part?.estimatedQuantity})</Text>
										<Pressable onPress={() => handleRemovePart(part.id || part._id)}>
											<Ionicons name="close" size={16} color="#000" />
										</Pressable>
									</View>
								))}
						</View>
				}

				<ActionButton onPress={() => router.back()} label="Confirm" />


			</KeyboardAwareScrollView>
		</>
	)
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
		color: "#fff"
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
})
