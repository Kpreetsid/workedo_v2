import Header from "@/components/global/Header";
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, ToastAndroid, View } from "react-native";
import { AddNewGatewayIcon, ArrowRight, CloudIcon } from "@/constants/IconProvider";
import Fonts from "@/constants/Typography";
import ActionButton from "@/components/create-screens/ActionButton";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useGatewayStore } from "@/src/store/useGatewayStore";
import { useEffect, useRef, useState } from "react";
import { locationTree } from "@/src/services/location.service";
import { Location } from "@/src/types/location";
import SelectLocationModal from "@/components/global/SelectLocationModal";
import { useAuthStore } from "@/src/store/useAuthStore";
import { getLocationById, saveGateway, sensorValidation } from "@/src/services/gateway.service";

export default function UpdateGateways() {
	console.log('add gateway')
	const router = useRouter();
	const params: any = useLocalSearchParams();
	const type = params?.type;

	const [isModalVisible, setModalVisible] = useState(false);
	const [locations, setLocations] = useState<Location[]>([]);
	const [location, setLocation] = useState<Location | null>(null);
	const [macID, setmacID] = useState<string | null>(null);
	const [bleSensorID, setBleSensorID] = useState<string | null>(null);
	const user = useAuthStore((state) => state.user);

	// "70:B8:F6:62:01:5C"

	const handleSelectLocation = (item: any) => {
		setLocation(item);
		setModalVisible(false);
	};

	useEffect(() => {
		if (params?.data) {
			const data = JSON.parse(params?.data) || "";
			console.log(data)
			setmacID(data?.gateway_mac_id)

			fetchLocationById(data?.location_id)
		}
		fetchLocations();
	}, []);

	const fetchLocationById = async (id: string) => {
		const locationData = await getLocationById(id)
		console.log('locationData = ', locationData)
		if (locationData?.status) {
			setLocation(locationData?.data[0]);
		}
	}

	const fetchLocations = async () => {
		try {
			const res = await locationTree();

			if (res.status) {
				console.log('res locations = ', res?.data);
				setLocations(res.data as Location[])
			}
		} catch (err: any) {
			console.error("Login failed:", err);
		}
	};

	const validateSensor = async (sensor_type: string) => {
		console.log('validate sensor = ', sensor_type);
		let payload = {
			"macID": [macID],
			"sensor_type": sensor_type,
			"comp_id": user?.account_id
		}

		try {
			const res = await sensorValidation(payload);
			console.log('sensor validation = ', res);
			if (!res?.results[0].is_present) {
				ToastAndroid.show(res?.results[0].message, ToastAndroid.SHORT);
			} else {
				saveSensor();
			}
		} catch (er) {
			console.log('er = ', er);
		}
	}

	const saveSensor = async () => {
		if (macID === "") {
			ToastAndroid.show("Please add Mac ID", ToastAndroid.SHORT);
			return;
		}

		if (location == null) {
			ToastAndroid.show("Please select Location", ToastAndroid.SHORT);
			return;
		}

		if (bleSensorID === "") {
			ToastAndroid.show("Please add Bluetooth Sensor Mac ID", ToastAndroid.SHORT);
			return;
		}

		try {
			let payload = {
				"gateway_mac_id": macID,
				"device_list": [],
				"location_id": location?.id,
				"account_id": user?.account_id
			};

			const res = await saveGateway(payload);
			ToastAndroid.show(res?.message, ToastAndroid.SHORT);
			router.back()
		} catch (e) {
			console.log('error= ', e);
		}
	}

	return (
		<>
			<Header title={type === "add" ? "Add Gateway" : "Update Gateway"} />
			<View style={styles.container}>

				<View style={styles.card}>
					<View style={styles.cardHeader}>
						<View style={{ flex: 1 }}>
							<Text style={styles.label}>Gateway Mac ID</Text>
							<TextInput
								style={styles.input}
								placeholder="Enter mac ID"
								value={macID?.toString()}
								placeholderTextColor={"#d3d3d3"}
								onChangeText={(text: any) => setmacID(text)}
							/>
						</View>
						<Pressable>
							<CloudIcon />
						</Pressable>
					</View>
				</View>

				<View style={styles.card}>
					<View style={styles.cardHeader}>
						<View>
							<Text style={styles.label}>Location</Text>
							<Text style={styles.value}>
								{location ? location?.location_name : "Not Assigned"}
							</Text>
						</View>

						<Pressable
							style={styles.btnContainer}
							onPress={() => setModalVisible(true)}
						>
							<Text style={styles.btnText}>Assign</Text>
							<ArrowRight />
						</Pressable>
					</View>
				</View>

				{/* --- Modal for Selecting Location --- */}
				<SelectLocationModal
					visible={isModalVisible}
					onClose={() => setModalVisible(false)}
					locations={locations}
					onSelect={handleSelectLocation}
				/>



				<View style={styles.card}>
					<View style={styles.cardHeader}>
						<Text style={styles.label}>Add Bluetooth Sensors</Text>
						<View style={styles.makeRow}>
							<Pressable style={styles.btnContainer} onPress={() => {
								validateSensor('bluetooth')
							}}>
								<AddNewGatewayIcon />
								<Text style={styles.btnText}>Add</Text>
							</Pressable>
							<Pressable>
								<CloudIcon />
							</Pressable>
						</View>
					</View>

					<TextInput
						style={styles.input}
						value={bleSensorID?.toString()}
						placeholder="Enter Bluetooth Sensor ID"
						placeholderTextColor={"#d3d3d3"}
						onChangeText={(text) => setBleSensorID(text)}
					/>

				</View>

				<ActionButton onPress={() => validateSensor('gateway')} label="Update" buttonStyle={styles.actionBtn} />
			</View>
		</>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
		gap: 20,
		backgroundColor: '#F5F7FA'
	},
	card: {
		backgroundColor: "#fff",
		borderRadius: 8,
		padding: 14,
		shadowColor: "#000",
		shadowOpacity: 0.05,
		shadowOffset: { width: 0, height: 2 },
		shadowRadius: 4,
		elevation: 2,
	},
	cardHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	label: {
		fontSize: 11,
		color: "#201F23",
		fontFamily: Fonts.semiBold,
	},
	input: {
		color: "#000"
	},
	value: {
		fontSize: 10,
		fontFamily: Fonts.regular,
		color: "#000000A0",
	},
	makeRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		gap: 10
	},
	btnContainer: {
		flexDirection: "row",
		backgroundColor: "#742BDE",
		alignItems: "center",
		justifyContent: "center",
		gap: 5,
		paddingVertical: 3,
		paddingHorizontal: 10,
		borderRadius: 8
	},
	btnText: {
		fontSize: 10,
		fontFamily: Fonts.regular,
		color: "#fff",
		lineHeight: 18
	},
	actionBtn: {
		marginHorizontal: -4
	}
})