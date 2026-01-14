import { ActivityIndicator, Modal, StyleSheet, Text, ToastAndroid, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { TextInput } from 'react-native-gesture-handler'
import { FormField } from '@/components/global/FormField'
import { useSensorStore } from '@/src/store/useSensorStore'
import Fonts from '@/constants/Typography'
import Header from '@/components/global/Header'
import { AssetEndpoint } from '@/src/types/assetEndpoint'
import { sensorValidation } from '@/src/services/gateway.service'
import { useAuthStore } from '@/src/store/useAuthStore'
import { addSensor } from '@/src/services/asset.service'
import { useAssetStore } from '@/src/store/useAssetStore'

interface AttachSensorProps {
	showAttachSensor: {
		state: boolean;
		data: AssetEndpoint | null;
		action: string;
	};
	setShowAttachSensor: React.Dispatch<
		React.SetStateAction<{
			state: boolean;
			data: AssetEndpoint | null;
			action: string;
		}>
	>;
}

const AttachSensor = ({ showAttachSensor, setShowAttachSensor }: AttachSensorProps) => {
	console.log('showAttachSensor = ', showAttachSensor)
	const setSensorForm = useSensorStore((s) => s.setSensorForm);
	const resetSensorForm = useSensorStore((s) => s.resetSensorForm);
	const mountOrientation = useSensorStore((s) => s.mount_orientation);

	const [loading, setLoading] = useState(false);

	const user = useAuthStore((state) => state.user);

	useEffect(() => {
		if (!showAttachSensor.state || !showAttachSensor.data) return;

		const data = showAttachSensor.data;

		// -----------------------
		// MAC + SENSOR TYPE
		// -----------------------
		const macId = data.mac_id;
		console.log('mac id here = ', macId)

		if(!macId) return;

		if (typeof macId === "string") {
			if (macId.startsWith("wl_")) {
				setSensorForm("mac_id", macId.split("wl_")[1] || "");
				setSensorForm("sensor_type", "wireless");
			} else if (macId.startsWith("w_")) {
				setSensorForm("mac_id", macId.split("w_")[1] || "");
				setSensorForm("sensor_type", "wired");
			} else {
				setSensorForm("mac_id", macId);
				setSensorForm("sensor_type", "bluetooth");
			}
		}

		// -----------------------
		// BASIC MOUNT FIELDS
		// -----------------------
		if (data.mount_direction) {
			setSensorForm("mount_orientation", data.mount_direction);
		}

		if (data.mount_material) {
			setSensorForm("mount_material", data.mount_material);
		}

		if (data.mount_type) {
			setSensorForm("mount_type", data.mount_type);
		}

		// -----------------------
		// 👇 AXIS MAPPING (CUSTOM)
		// -----------------------
		if (data.mount_direction === "custom") {
			// ✅ Option A: axis_mapping object
			if (data.deviceInfo) {
				if (data.deviceInfo[0].data[4].label === "Custom Mapping") {
					var customMappingData = JSON.parse(data.deviceInfo[0].data[4].value);
					console.log(customMappingData)
					setSensorForm("asset_x_axis", customMappingData.x || "");
					setSensorForm("asset_y_axis", customMappingData.y || "");
					setSensorForm("asset_z_axis", customMappingData.z || "");
				}
			}
		}

	}, [showAttachSensor.state, showAttachSensor.data]);


	useEffect(() => {
		if (!showAttachSensor.state) {
			resetSensorForm();
		}
	}, [showAttachSensor.state]);

	async function handleAttachSensor() {
		console.log('handling attach sensor');

		// all fields are mandatory, apply if else conditions
		if (!useSensorStore.getState().mac_id) {
			console.log('Mac ID is required');
			ToastAndroid.show("Mac ID is required", ToastAndroid.SHORT)
			return;
		}

		if (!useSensorStore.getState().sensor_type) {
			console.log('Sensor Type is required');
			ToastAndroid.show("Sensor Type is required", ToastAndroid.SHORT)
			return;
		}

		if (!useSensorStore.getState().mount_orientation) {
			console.log('Mount Orientation is required');
			ToastAndroid.show("Mount Orientation is required", ToastAndroid.SHORT)
			return;
		}

		if (useSensorStore.getState().mount_orientation === "custom") {
			const { asset_x_axis, asset_y_axis, asset_z_axis } =
				useSensorStore.getState();

			// 1️⃣ Required check (already discussed, keeping it here for clarity)
			if (!asset_x_axis || !asset_y_axis || !asset_z_axis) {
				ToastAndroid.show(
					"All axis mappings are required for custom orientation",
					ToastAndroid.SHORT
				);
				return;
			}

			// 2️⃣ Uniqueness check (THIS is what you asked for)
			const axisSet = new Set([asset_x_axis, asset_y_axis, asset_z_axis]);

			if (axisSet.size !== 3) {
				ToastAndroid.show(
					"Each axis must have a different orientation",
					ToastAndroid.SHORT
				);
				return;
			}
		}

		setLoading(true)
		// validate sensor
		let payload = {
			"macID": useSensorStore.getState().mac_id,
			"sensor_type": useSensorStore.getState().sensor_type,
			"comp_id": user?.account_id
		}

		try {
			const res = await sensorValidation(payload);
			console.log('sensor validation = ', res);
			if (!res?.is_present) {
				setLoading(false)
				ToastAndroid.show(res?.message || "Sensor validation failed", ToastAndroid.SHORT);
			} else {
				saveSensor();
			}
		} catch (er: any) {
			console.log('er = ', er);
			setLoading(false)
			if (!er?.is_present) {
				ToastAndroid.show(er?.message || "Sensor validation failed", ToastAndroid.SHORT);
			}
		}
	}

	const saveSensor = async () => {
		try {
			let payload: any = {
				"comp_id": user?.account_id,
				"asset_id": showAttachSensor.data?.asset_id,
				"mount_id": showAttachSensor.data?.id,
				"mac_id": useSensorStore.getState().mac_id,
				"sensor_type": useSensorStore.getState().sensor_type,
				"mount_direction": useSensorStore.getState().mount_orientation,
				"mount_material": useSensorStore.getState().mount_material,
				"mount_type": useSensorStore.getState().mount_type,
			};

			if (useSensorStore.getState().mount_orientation === "custom") {
				payload.axis_mapping = {
					x: useSensorStore.getState().asset_x_axis,
					y: useSensorStore.getState().asset_y_axis,
					z: useSensorStore.getState().asset_z_axis,
				};
			}

			console.log('payload for adding sensor = ', payload);

			const res = await addSensor(payload);
			ToastAndroid.show(res?.message, ToastAndroid.SHORT);
			setShowAttachSensor({ state: false, data: null, action: "close" });
			setLoading(false)
		} catch (e) {
			setLoading(false)
			console.log('error= ', e);
		}
	}

	return (
		<View style={styles.container}>
			<Modal
				visible={showAttachSensor.state}
				transparent
				animationType="fade"
			>
				<View style={styles.backdrop}>
					<View style={styles.modalCard}>

						{/* Header */}
						<Header title="Attach Sensor" showBack={false} />
						{/* Body */}
						<View style={styles.body}>
							<FormField
								label="Mac ID"
								placeholder="Enter Mac ID"
								field="mac_id"
								store={useSensorStore}
								setterName="setSensorForm"
								required={true}
								styles={{ paddingHorizontal: 0 }}
							/>

							<FormField
								label="Sensor Type"
								type="dropdown"
								field="sensor_type"
								options={["wireless", "wired", "bluetooth"]}
								store={useSensorStore}
								setterName="setSensorForm"
								required={true}
							/>

							<FormField
								label="Mount Orientation"
								type="dropdown"
								field="mount_orientation"
								options={["horizontal", "axial", "vertical", "custom"]}
								store={useSensorStore}
								setterName="setSensorForm"
								required={true}
							/>

							{mountOrientation === "custom" && (
								<View style={{ marginTop: 16 }}>
									<Text style={styles.sectionTitle}>Manual Axis Mapping</Text>

									<FormField
										label="Asset X axis"
										type="dropdown"
										field="asset_x_axis"
										options={["Horizontal", "Vertical", "Axial"]}
										store={useSensorStore}
										setterName="setSensorForm"
										required
									/>

									<FormField
										label="Asset Y axis"
										type="dropdown"
										field="asset_y_axis"
										options={["Horizontal", "Vertical", "Axial"]}
										store={useSensorStore}
										setterName="setSensorForm"
										required
									/>

									<FormField
										label="Asset Z axis"
										type="dropdown"
										field="asset_z_axis"
										options={["Horizontal", "Vertical", "Axial"]}
										store={useSensorStore}
										setterName="setSensorForm"
										required
									/>
								</View>
							)}

							<FormField
								label="Mount Material"
								type="dropdown"
								field="mount_material"
								options={["steel", "non ferrous", "alloy"]}
								store={useSensorStore}
								setterName="setSensorForm"
								required={false}
							/>

							<FormField
								label="Mount Type"
								type="dropdown"
								field="mount_type"
								options={["magnet", "magnet + adhesive", "adhesive"]}
								store={useSensorStore}
								setterName="setSensorForm"
								required={false}
							/>

						</View>

						{/* Footer */}
						<View style={styles.footer}>
							<TouchableOpacity style={styles.saveBtn} onPress={handleAttachSensor}>
								{
									loading ?
										<ActivityIndicator size={"small"} color="#FFFFFF" />
										:
										<Text style={styles.saveText}>
											Save
										</Text>
								}
							</TouchableOpacity>

							<TouchableOpacity
								style={styles.cancelBtn}
								onPress={() => setShowAttachSensor({ state: false, data: null, action: "open" })}
							>
								<Text style={styles.cancelText}>Cancel</Text>
							</TouchableOpacity>
						</View>

					</View>
				</View>
			</Modal>

		</View>
	)
}

export default AttachSensor

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	backdrop: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.45)",
		justifyContent: "center",
		alignItems: "center",
	},
	modalCard: {
		width: "88%",
		backgroundColor: "#fff",
		borderRadius: 10,
		// overflow: "hidden",
		padding: 20
	},
	body: {

	},
	footer: {
		flexDirection: "row",
		justifyContent: "space-between",
		paddingTop: 16,
	},
	saveBtn: {
		backgroundColor: "#6C3BD9",
		paddingHorizontal: 24,
		paddingVertical: 10,
		borderRadius: 6,
	},
	saveText: {
		color: "#fff",
		fontWeight: "600",
	},
	cancelBtn: {
		borderWidth: 1,
		borderColor: "#ccc",
		paddingHorizontal: 24,
		paddingVertical: 10,
		borderRadius: 6,
	},
	cancelText: {
		color: "#555",
	},
	sectionTitle: {
		fontSize: 15,
		fontWeight: "600",
		marginBottom: 10,
		marginTop: 10,
	},
});