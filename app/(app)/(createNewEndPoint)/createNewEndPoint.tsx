import Header from "@/components/global/Header";
import FormInput from "@/components/create-screens/FormInput";
import { Pressable, StyleSheet, Text, ToastAndroid, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import Fonts from "@/constants/Typography";
import ActionButton from "@/components/create-screens/ActionButton";
import { useRef, useState } from "react";

export default function CreateNewEndPoint() {
	const [selectedPart, setSelectedPart] = useState<string>("DE");
	// refs for all text inputs
	const nameRef = useRef("");
	const rpmRef = useRef("");
	const bearingNoRef = useRef("");
	const bpfoRef = useRef("");
	const bpfiRef = useRef("");
	const bsfRef = useRef("");
	const ftfRef = useRef("");

	const handleSubmit = () => {
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
			bearingNo,
			bpfo: bpfoRef.current,
			bpfi: bpfiRef.current,
			bsf: bsfRef.current,
			ftf: ftfRef.current,
		};

		console.log("Collected Data:", data);
		ToastAndroid.show("Data submitted successfully!", ToastAndroid.SHORT);
		// now send `data` to API
	};
	const getBearingDetails = () => {
		console.log("Bearing Number:", bearingNoRef.current);
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
					<Pressable style={styles.buttonContainer} onPress={getBearingDetails}>
						<Text style={styles.buttonText}>Get Details</Text>
					</Pressable>
				</View>

				<View style={styles.row}>
					<FormInput label="BPFO" placeholder="" containerStyle={styles.inputContainer} onChangeText={(text) => (bpfoRef.current = text)} />
					<FormInput label="BPFI" placeholder="" containerStyle={styles.inputContainer} onChangeText={(text) => (bpfiRef.current = text)} />
				</View>

				<View style={styles.row}>
					<FormInput label="BSF" placeholder="" containerStyle={styles.inputContainer} onChangeText={(text) => (bsfRef.current = text)} />
					<FormInput label="FTF" placeholder="" containerStyle={styles.inputContainer} onChangeText={(text) => (ftfRef.current = text)} />
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