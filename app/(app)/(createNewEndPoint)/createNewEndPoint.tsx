import Header from "@/components/global/Header";
import FormInput from "@/components/create-screens/FormInput";
import { Pressable, StyleSheet, Text, ToastAndroid, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import Fonts from "@/constants/Typography";
import ActionButton from "@/components/create-screens/ActionButton";
import { useRef, useState } from "react";
import { createEndpoint, getBearingDetails } from "@/src/services/asset.service";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useRouter } from "expo-router";

export default function CreateNewEndPoint() {
	const router = useRouter();
	const user = useAuthStore(state => state.user);
	const [selectedPart, setSelectedPart] = useState<string>("DE");
	// refs for all text inputs
	const nameRef = useRef("");
	const rpmRef = useRef("");
	const bearingNoRef = useRef("");

	const [bearingData, setBearingData] = useState({
		bpfo: "",
		bpfi: "",
		bsf: "",
		ftf: ""
	})

	const handleSubmit = async () => {
		const name = nameRef.current?.trim();
		const measuringPointLocation = selectedPart?.trim();
		const rpm = rpmRef.current?.trim();
		const bearingNo = bearingNoRef.current?.trim();

		if (!name || !measuringPointLocation || !rpm || !bearingNo) {
			let missingField = "";

			if (!name) missingField = "Data Collection Point Name";
			else if (!measuringPointLocation) missingField = "Measuring Point Location";
			else if (!rpm) missingField = "RPM";
			else if (!bearingNo) missingField = "Bearing Number";

			ToastAndroid.show(`${missingField} is required`, ToastAndroid.SHORT);
			return;
		}

		const data = {
			name,
			measuringPointLocation,
			rpm,
			bearingNo
		};

		console.log("Collected Data:", data);

		// construct the payload for API
		const payload = {
			asset_id: "68e634fc55f585c8ba8e2a88", // from your selected asset or Zustand
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

		const res = await createEndpoint(payload);
		console.log("API Response:", res);

		if (res?.message === "End Point created successfully.") {
			ToastAndroid.show("Endpoint created successfully!", ToastAndroid.SHORT);
			router.back();
		}
	};

	const fetchBearingDetails = async () => {
		console.log("Bearing Number:", bearingNoRef.current);
		const payload = {
			account_id: user?.account_id,
			bearing_number: bearingNoRef.current,
			user_id: user?.id,
		};
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
	};

	return (
		<>
			<Header title="Create New End Point" />
			<KeyboardAwareScrollView bottomOffset={30}>
				<View style={{ marginVertical: 5 }} />

				<FormInput label="Data Collection Point Name" placeholder="Use a descriptive name" onChangeText={(text) => (nameRef.current = text)} />

				<FormInput
					label="Measuring Point Location"
					placeholder="DE"
					type="dropdown"
					selectedPart={selectedPart}
					setSelectedPart={setSelectedPart}
				/>

				<FormInput
					label="RPM"
					placeholder="Input machine RPM"
					onChangeText={(text) => (rpmRef.current = text)}
				/>

				<View style={styles.row}>
					<FormInput label="Bearing Number" placeholder="Bearing No. of Measuring Point" containerStyle={styles.inputContainer} onChangeText={(text) => (bearingNoRef.current = text)} />
					<Pressable style={styles.buttonContainer} onPress={fetchBearingDetails}>
						<Text style={styles.buttonText}>Get Details</Text>
					</Pressable>
				</View>

				<View style={styles.row}>
					<FormInput label="BPFO" placeholder={bearingData.bpfo} editable={false} value={bearingData.bpfo} containerStyle={styles.inputContainer} onChangeText={(text) => (bearingData.bpfo = text)} />
					<FormInput label="BPFI" placeholder={bearingData.bpfi} editable={false} value={bearingData.bpfi} containerStyle={styles.inputContainer} onChangeText={(text) => (bearingData.bpfi = text)} />
				</View>

				<View style={styles.row}>
					<FormInput label="BSF" placeholder={bearingData.bsf} editable={false} value={bearingData.bsf} containerStyle={styles.inputContainer} onChangeText={(text) => (bearingData.bsf = text)} />
					<FormInput label="FTF" placeholder={bearingData.ftf} editable={false} value={bearingData.ftf} containerStyle={styles.inputContainer} onChangeText={(text) => (bearingData.ftf = text)} />
				</View>

			</KeyboardAwareScrollView>

			<ActionButton label="Create Endpoint" onPress={handleSubmit} />
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