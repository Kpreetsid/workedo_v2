import Header from "@/components/global/Header";
import FormInput from "@/components/create-screens/FormInput";
import { ActivityIndicator, Pressable, StyleSheet, Text, ToastAndroid, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import Fonts from "@/constants/Typography";
import ActionButton from "@/components/create-screens/ActionButton";
import { useEffect, useRef, useState } from "react";
import { createEndpoint, getBearingDetails, updateEndpoint } from "@/src/services/asset.service";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useRouter } from "expo-router";
import { useLocalSearchParams } from "expo-router/build/hooks";
import { useAssetStore } from "@/src/store/useAssetStore";
import DropDownInput from "@/components/create-screens/DropDownInput";
import DropDownLocation from "@/components/create-endpoint/DropDownLocation";

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

	// Refs for all text inputs
	const nameRef = useRef("");
	const rpmRef = useRef("");
	const bearingNoRef = useRef("");

	const [bearingData, setBearingData] = useState({
		bpfo: "",
		bpfi: "",
		bsf: "",
		ftf: "",
	});

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
		}
	}, [selectedEndpointToEdit]);

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
			
			ToastAndroid.show(e?.message, ToastAndroid.SHORT);
		}

	};

	const fetchBearingDetails = async () => {
		console.log("Bearing Number:", bearingNoRef.current);
		if (!bearingNoRef.current) return;

		const payload = {
			account_id: user?.account_id,
			bearing_number: bearingNoRef.current,
			user_id: user?.id,
		};
		try {
			const res = await getBearingDetails(payload);
			console.log("Bearing Details:", res);
			if (res.result) {
				setBearingData({
					bpfo: res.message.bpfo,
					bpfi: res.message.bpfi,
					bsf: res.message.bsf,
					ftf: res.message.ftf
				})
			}
		} catch (e: any) {
			console.log('e = ', e);
			if (!e.result) {
				ToastAndroid.show(e?.message, ToastAndroid.SHORT);
			}
		}

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
					onChangeText={(text) => (rpmRef.current = text)}
					containerStyle={{ paddingHorizontal: 25 }}
				/>

				<View style={styles.row}>
					<FormInput
						required={false}
						readOnly={selectedEndpointToEdit ? true : false}
						label="Bearing Number"
						placeholder="Bearing No. of Measuring Point"
						containerStyle={styles.inputContainer}
						onChangeText={(text) => (bearingNoRef.current = text)}
					/>
					<Pressable style={styles.buttonContainer} onPress={fetchBearingDetails}>
						<Text style={styles.buttonText}>Get Details</Text>
					</Pressable>
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
	buttonContainer: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#742BDE",
		paddingHorizontal: 10,
		paddingVertical: 5,
		justifyContent: "center",
		borderRadius: 5,
		alignSelf: "flex-end",
		marginBottom: 13
	},
	buttonText: {
		fontSize: 10,
		fontFamily: Fonts.regular,
		color: "#FFFFFF",
		lineHeight: 20,
	},
})