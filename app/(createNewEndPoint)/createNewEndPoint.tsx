import Header from "@/components/global/Header";
import FormInput from "@/components/create-screens/FormInput";
import { ActivityIndicator, Pressable, StyleSheet, Text, ToastAndroid, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import Fonts from "@/constants/Typography";
import ActionButton from "@/components/create-screens/ActionButton";
import { useEffect, useRef, useState } from "react";
import { createEndpoint, searchBearingNumbers, updateEndpoint } from "@/src/services/asset.service";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useRouter } from "expo-router";
import { useLocalSearchParams } from "expo-router/build/hooks";
import { useAssetStore } from "@/src/store/useAssetStore";
import DropDownLocation from "@/components/create-endpoint/DropDownLocation";

interface BearingSuggestion {
	bearing_number: string;
	bpfo?: string;
	bpfi?: string;
	bsf?: string;
	ftf?: string;
}

const asText = (value: unknown) => {
	if (value === null || value === undefined) return "";
	return String(value);
};

const emptyBearingData = {
	bpfo: "",
	bpfi: "",
	bsf: "",
	ftf: "",
};

export default function CreateNewEndPoint() {
	const { id } = useLocalSearchParams();
	console.log('asset id = ', id);
	const setSelectedEndpointToEdit = useAssetStore((state) => state.setSelectedEndpointToEdit);

	const [loading, setLoading] = useState(false);
	const selectedEndpointToEdit = useAssetStore((state) => state.selectedEndpointToEdit);
	console.log('selectedEndpointToEdit = ', selectedEndpointToEdit);

	const router = useRouter();
	const user = useAuthStore(state => state.user);
	const [selectedPart, setSelectedPart] = useState<string>("DE");
	const [bearingNumber, setBearingNumber] = useState("");
	const [bearingSuggestions, setBearingSuggestions] = useState<BearingSuggestion[]>([]);
	const [bearingSearchLoading, setBearingSearchLoading] = useState(false);
	const [bearingSearchAttempted, setBearingSearchAttempted] = useState(false);
	const [selectedBearingValue, setSelectedBearingValue] = useState("");

	// Refs for all text inputs
	const nameRef = useRef("");
	const rpmRef = useRef("");
	const bearingNoRef = useRef("");

	const [bearingData, setBearingData] = useState(emptyBearingData);

	useEffect(() => {
		return () => {
			setSelectedEndpointToEdit(null)
		}
	}, [])

	// ✅ Prefill fields when editing
	useEffect(() => {
		if (selectedEndpointToEdit) {
			nameRef.current = selectedEndpointToEdit?.point_name || "";
			setSelectedPart(selectedEndpointToEdit?.mount_location || "DE");
			rpmRef.current = selectedEndpointToEdit?.rpm ? String(selectedEndpointToEdit.rpm) : "";
			const existingBearingNumber = selectedEndpointToEdit?.bearing_number || "";
			bearingNoRef.current = existingBearingNumber;
			setBearingNumber(existingBearingNumber);
			setSelectedBearingValue(existingBearingNumber);
			setBearingData({
				bpfo: asText(selectedEndpointToEdit?.bpfo),
				bpfi: asText(selectedEndpointToEdit?.bpfi),
				bsf: asText(selectedEndpointToEdit?.bsf),
				ftf: asText(selectedEndpointToEdit?.ftf),
			});
		}
	}, [selectedEndpointToEdit]);

	useEffect(() => {
		if (selectedEndpointToEdit) {
			setBearingSuggestions([]);
			setBearingSearchLoading(false);
			setBearingSearchAttempted(false);
			return;
		}

		const query = bearingNumber.trim();

		if (query.length < 2 || query === selectedBearingValue) {
			setBearingSuggestions([]);
			setBearingSearchLoading(false);
			setBearingSearchAttempted(false);
			return;
		}

		let isCancelled = false;
		const timer = setTimeout(async () => {
			try {
				setBearingSearchLoading(true);
				setBearingSearchAttempted(false);
				const res = await searchBearingNumbers(query);
				if (isCancelled) return;
				setBearingSuggestions(Array.isArray(res?.results) ? res.results : []);
				setBearingSearchAttempted(true);
			} catch (error) {
				if (!isCancelled) {
					setBearingSuggestions([]);
					setBearingSearchAttempted(true);
				}
			} finally {
				if (!isCancelled) {
					setBearingSearchLoading(false);
				}
			}
		}, 400);

		return () => {
			isCancelled = true;
			clearTimeout(timer);
		};
	}, [bearingNumber, selectedBearingValue, selectedEndpointToEdit]);

	const handleSubmit = async () => {
		const name = nameRef.current?.trim();
		const measuringPointLocation = selectedPart?.trim();
		const rpm = rpmRef.current?.trim();
		const bearingNo = bearingNoRef.current?.trim();

		if (!name || !measuringPointLocation) {
			let missingField = "";

			if (!name) missingField = "Data Collection Point Name";
			else if (!measuringPointLocation) missingField = "Measuring Point Location";
			// else if (!rpm) missingField = "RPM";
			// else if (!bearingNo) missingField = "Bearing Number";
			// else if (!bearingData.bpfo || !bearingData.bpfi || !bearingData.bsf || !bearingData.ftf) missingField = "Bearing Details";

			ToastAndroid.show(`${missingField} required`, ToastAndroid.SHORT);
			return;
		}

		setLoading(true)
		const data = {
			name,
			measuringPointLocation,
			rpm,
			bearingNo,
		};

		console.log("Collected Data:", data);


		// construct the payload for API
		const payload = {
			asset_id: id,
			point_name: name,
			rpm: Number(rpm),
			mount_location: measuringPointLocation,
			bearing_number: bearingNo,
			bpfo: bearingData.bpfo,
			bpfi: bearingData.bpfi,
			bsf: bearingData.bsf,
			ftf: bearingData.ftf,
			asset_timezone: "Asia/Calcutta", // or fetch dynamically from device or org
			org_id: user?.account_id,
		};

		console.log("Final Payload:", payload);

		try {
			const res = await createEndpoint(payload);
			console.log("API Response:", res);

			if (res?.message === "End Point created successfully.") {
				setLoading(false)
				ToastAndroid.show("Endpoint created successfully!", ToastAndroid.SHORT);
				router.back();
			} else {
				setLoading(false)
			}

		} catch (er: any) {
			console.log('er = ', er);
			ToastAndroid.show(er?.message, ToastAndroid.SHORT);
			setLoading(false)
		}
	};

	const handleEdit = async () => {
		const name = nameRef.current?.trim();
		const measuringPointLocation = selectedPart?.trim();

		if (!name || !measuringPointLocation) {
			let missingField = "";

			if (!name) missingField = "Data Collection Point Name";
			else if (!measuringPointLocation) missingField = "Measuring Point Location";

			ToastAndroid.show(`${missingField} required`, ToastAndroid.SHORT);
			return;
		}

		const data = {
			name,
			measuringPointLocation,
		};

		console.log("Collected Data:", data);


		// construct the payload for API
		const payload = {
			mount_id: selectedEndpointToEdit?.id,
			name: name,
			location: measuringPointLocation
		};

		console.log("Final Payload:", payload);

		try {
			const res = await updateEndpoint(payload);
			console.log("API Response:", res);

			if (res?.message === "Endpoint updated successfully.") {
				ToastAndroid.show("Endpoint updated successfully!", ToastAndroid.SHORT);
				router.back();
			}
		} catch (e: any) {
			console.log('error = ', e);
			ToastAndroid.show(e?.message, ToastAndroid.SHORT);
		}

	};

	const handleBearingNumberChange = (text: string) => {
		bearingNoRef.current = text;
		setBearingNumber(text);

		if (text.trim() !== selectedBearingValue) {
			setSelectedBearingValue("");
			setBearingData(emptyBearingData);
		}

		if (text.trim().length < 2) {
			setBearingSuggestions([]);
			setBearingSearchAttempted(false);
		}
	};

	const handleSelectBearing = (item: BearingSuggestion) => {
		const nextBearingNumber = item?.bearing_number || "";
		bearingNoRef.current = nextBearingNumber;
		setBearingNumber(nextBearingNumber);
		setSelectedBearingValue(nextBearingNumber);
		setBearingData({
			bpfo: asText(item?.bpfo),
			bpfi: asText(item?.bpfi),
			bsf: asText(item?.bsf),
			ftf: asText(item?.ftf),
		});
		setBearingSuggestions([]);
		setBearingSearchAttempted(false);
	};

	return (
		<>
			<Header title={selectedEndpointToEdit ? "Edit End Point" : "Create New End Point"} />
			<KeyboardAwareScrollView bottomOffset={30}>
				<View style={{ marginVertical: 5 }} />

				<FormInput
					label="Data Collection Point Name"
					placeholder="Use a descriptive name"
					defaultValue={selectedEndpointToEdit?.point_name || ""}
					onChangeText={(text) => (nameRef.current = text)}
					containerStyle={{ paddingHorizontal: 25 }}
				/>

				<DropDownLocation
					label="Measuring Point Location"
					required={true}
					value={selectedPart}
					options={["DE", "NDE"]}
					onSelect={setSelectedPart}
				/>

				<FormInput
					readOnly={selectedEndpointToEdit ? true : false}
					label="RPM"
					required={false}
					showKeyboardType="numeric"
					placeholder="Input machine RPM"
					defaultValue={selectedEndpointToEdit?.rpm ? String(selectedEndpointToEdit.rpm) : ""}
					onChangeText={(text) => (rpmRef.current = text)}
					containerStyle={{ paddingHorizontal: 25 }}
				/>

				<View style={styles.row}>
					<View style={styles.bearingFieldContainer}>
						<FormInput
							required={false}
							readOnly={selectedEndpointToEdit ? true : false}
							label="Bearing Number"
							placeholder="Bearing No. of Measuring Point"
							containerStyle={styles.bearingInputContainer}
							value={bearingNumber}
							onChangeText={handleBearingNumberChange}
						/>

						{!selectedEndpointToEdit && (bearingSearchLoading || bearingSuggestions.length > 0 || (bearingSearchAttempted && bearingNumber.trim().length >= 2)) ? (
							<View style={styles.suggestionCard}>
								{bearingSearchLoading ? (
									<View style={styles.suggestionState}>
										<ActivityIndicator size="small" color="#742BDE" />
										<Text style={styles.suggestionHint}>Searching bearing numbers...</Text>
									</View>
								) : bearingSuggestions.length > 0 ? (
									bearingSuggestions.map((item) => (
										<Pressable
											key={item.bearing_number}
											style={styles.suggestionItem}
											onPress={() => handleSelectBearing(item)}
										>
											<Text style={styles.suggestionTitle}>{item.bearing_number}</Text>
											<Text style={styles.suggestionMeta}>
												{`BPFO ${item.bpfo || "-"}  BPFI ${item.bpfi || "-"}  BSF ${item.bsf || "-"}  FTF ${item.ftf || "-"}`}
											</Text>
										</Pressable>
									))
								) : bearingSearchAttempted ? (
									<Text style={styles.suggestionHint}>No bearing numbers found.</Text>
								) : null}
							</View>
						) : null}
					</View>
				</View>

				<View style={styles.row}>
					<FormInput
						readOnly={selectedEndpointToEdit ? true : false} required={false} label="BPFO" placeholder={bearingData.bpfo} editable={false} value={bearingData.bpfo} containerStyle={styles.inputContainer} onChangeText={(text) => (bearingData.bpfo = text)} />
					<FormInput
						readOnly={selectedEndpointToEdit ? true : false} required={false} label="BPFI" placeholder={bearingData.bpfi} editable={false} value={bearingData.bpfi} containerStyle={styles.inputContainer} onChangeText={(text) => (bearingData.bpfi = text)} />
				</View>

				<View style={styles.row}>
					<FormInput
						readOnly={selectedEndpointToEdit ? true : false} required={false} label="BSF" placeholder={bearingData.bsf} editable={false} value={bearingData.bsf} containerStyle={styles.inputContainer} onChangeText={(text) => (bearingData.bsf = text)} />
					<FormInput
						readOnly={selectedEndpointToEdit ? true : false} required={false} label="FTF" placeholder={bearingData.ftf} editable={false} value={bearingData.ftf} containerStyle={styles.inputContainer} onChangeText={(text) => (bearingData.ftf = text)} />
				</View>

			</KeyboardAwareScrollView>

			<ActionButton
				label={
					loading ?
						<ActivityIndicator size={"small"} />
						:
						selectedEndpointToEdit ? "Update Endpoint" : "Create Endpoint"
				}
				buttonStyle={{marginBottom: 60}}
				onPress={selectedEndpointToEdit ? handleEdit : handleSubmit}
			/>
		</>
	)
}

const styles = StyleSheet.create({
	row: {
		flexDirection: "row",
		paddingHorizontal: 25,
		alignItems: "center",
		justifyContent: "space-between",
		gap: 15,
	},
	inputContainer: {
		paddingHorizontal: 0,
		flexGrow: 1,
		width: "45%",
	},
	bearingFieldContainer: {
		width: "100%",
	},
	bearingInputContainer: {
		paddingHorizontal: 0,
		width: "100%",
	},
	suggestionCard: {
		marginTop: 4,
		borderWidth: 1,
		borderColor: "#E1E8EE",
		borderRadius: 10,
		backgroundColor: "#FFFFFF",
		overflow: "hidden",
	},
	suggestionState: {
		paddingHorizontal: 12,
		paddingVertical: 14,
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
	},
	suggestionHint: {
		fontSize: 12,
		fontFamily: Fonts.light,
		color: "#5A5D6C",
		paddingHorizontal: 12,
		paddingVertical: 14,
	},
	suggestionItem: {
		paddingHorizontal: 12,
		paddingVertical: 12,
		borderTopWidth: 1,
		borderTopColor: "#F1F3F5",
	},
	suggestionTitle: {
		fontSize: 13,
		fontFamily: Fonts.semiBold,
		color: "#201F23",
	},
	suggestionMeta: {
		marginTop: 4,
		fontSize: 11,
		fontFamily: Fonts.light,
		color: "#6B7888",
	},
})
