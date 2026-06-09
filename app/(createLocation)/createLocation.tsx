import { ActivityIndicator, StyleSheet, Text, ToastAndroid, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import Header from '@/src/components/global/Header'
import { FormField } from '@/src/components/global/FormField'
import { useCreateLocationStore } from '@/src/state/locations/useCreateLocationStore'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { createNewLocation, singleLocationData, updateNewLocation } from '@/src/services/location.service'
import Fonts from '@/constants/Typography'
import { Location } from '@/src/types/location'
import { Image } from 'expo-image'
import { endpoints } from '@/src/services/api/endpoints'
import { Feather } from '@expo/vector-icons'
import { getRouteParamString, parseJsonRouteParam } from '@/src/utils/routeParams'

interface createLocationParams {
	location_data: Location;
	mode?: string;
	isEdit: string | any;
}

const createLocation = () => {
	const { location_data, isEdit, mode } = useLocalSearchParams();
	const { resetForm, setCreateLocationValue } = useCreateLocationStore();

	// typed, parsed object
	const data: createLocationParams = {
		location_data: parseJsonRouteParam<Location>(location_data) as any,
		isEdit: getRouteParamString(isEdit),
		mode: getRouteParamString(mode)
	};

	const [loading, setLoading] = useState(false);

	const router = useRouter();

	// ✅ Reactive store subscriptions — prevents stale getState() reads in JSX
	const attachments = useCreateLocationStore((s) => s.attachments);
	const parentLocation = useCreateLocationStore((s) => s.parent_location);

	useEffect(() => {
		// for testing
		// useCreateLocationStore.setState({
		// 	attachments: [{
		// 		"image_path": "2025-11-21T21-27-03.364Z_2756.jpg"
		// 	}]
		// });

		if (data.isEdit === "true") {
			setCreateLocationValue("title", data?.location_data?.location_name);
			setCreateLocationValue("location_type", data?.location_data?.location_type);
			setCreateLocationValue("description", data?.location_data?.description);
			if (data?.location_data?.image_path) {
				setCreateLocationValue("attachments", [{ image_path: data?.location_data?.image_path }]);
			}

			fetchLocationData();

			console.log('in attachments = ', useCreateLocationStore.getState())
		}

		if (data.mode === 'child' && data.location_data) {
			setCreateLocationValue("parent_location", {
				id: data?.location_data?.id,
				location_name: data?.location_data?.location_name
			} as any);

			fetchLocationData();
		}

		return () => {
			resetForm();
		}
	}, []);

	const fetchLocationData = async () => {
		try {
			const res = await singleLocationData(data.location_data?.id);
			console.log(res);
			if (res?.status) {
				setCreateLocationValue("assigned_users", res?.data[0]?.userList);
			}
		} catch (e) {
			console.log('error = ', e);
		}
	}

	const handleCreateLocation = async () => {
		const values = useCreateLocationStore.getState();
		console.log('values = ', values);

		if (values.title === "") {
			ToastAndroid.show("Please enter location name", ToastAndroid.SHORT);
			return;
		}

		if (values.location_type === "") {
			ToastAndroid.show("Please select location type", ToastAndroid.SHORT);
			return;
		}

		if (values.assigned_users.length === 0) {
			ToastAndroid.show("Please assign users", ToastAndroid.SHORT);
			return;
		}

		// ✅ Guard: ensure we have location ID before attempting update
		const isEdit = data?.isEdit === "true";
		if (isEdit && !data?.location_data?.id) {
			ToastAndroid.show("Invalid location data. Please go back and try again.", ToastAndroid.LONG);
			return;
		}

		setLoading(true);
		const payload: any = {
			top_level: data?.mode === 'child' ? false : true,
			top_level_location_id: (data?.mode === 'child' || isEdit) ? data?.location_data?.id : "",
			location_name: values.title,
			description: values.description,
			location_type: values.location_type,
			// ✅ Filter out undefined/null user IDs to avoid API errors
			userIdList: values.assigned_users.map((u: any) => u?.id).filter(Boolean),
			image_path: values.attachments.length > 0 ? values.attachments[0]?.image_path : "",
		};

		if (data?.mode === 'child') {
			payload.parent_id = data?.location_data?.id;
		}

		console.log('payload = ', payload);

		try {
			const res = isEdit
				? await updateNewLocation(data.location_data!.id, payload)
				: await createNewLocation(payload);
			console.log('res = ', res);

			// ✅ Null-safe check on response
			if (res?.status) {
				resetForm();
				ToastAndroid.show(
					isEdit ? 'Location updated successfully' : 'Location created successfully',
					ToastAndroid.SHORT
				);
				router.back();
			} else {
				ToastAndroid.show(res?.message || 'Operation failed. Please try again.', ToastAndroid.LONG);
			}
		} catch (err: any) {
			console.error('[createLocation] Error:', err);
			ToastAndroid.show(err?.message || 'Network error. Please check your connection.', ToastAndroid.LONG);
		} finally {
			// ✅ Always reset loading — prevents infinite spinner
			setLoading(false);
		}
	}

	return (
		// ✅ Removed nested ScrollView — was causing gesture conflicts on Android
		<KeyboardAwareScrollView bottomOffset={30} style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
				<Header title={data?.isEdit === "true" ? "Update Location Details" : "Add New Location"} />

				<FormField
					label="Title"
					placeholder="Enter Title"
					field="title"
					store={useCreateLocationStore}
					setterName="setCreateLocationValue"
					styles={{ paddingHorizontal: 25 }}
				/>

				<FormField
					label="Location Type"
					type="dropdown"
					field="location_type"
					options={[
						"Company",
						"Plant",
						"Unit",
						"Section",
						"Area",
						"Shop",
						"Line",
					]}
					store={useCreateLocationStore}
					setterName="setCreateLocationValue"
					styles={{ paddingHorizontal: 25 }}
				/>


				<FormField
					label="Description"
					required={false}
					placeholder="Enter Description"
					field="description"
					store={useCreateLocationStore}
					setterName="setCreateLocationValue"
					styles={{ paddingHorizontal: 25 }}
				/>



				{
					data?.mode === 'child' &&
					<View style={[styles.locationSelector]}>
						<View style={styles.labelContainer}>
							<Text style={styles.labelText}>Parent Location</Text>
							<Text style={styles.asterisk}>*</Text>
						</View>
						<View style={[styles.field]}>
							<Text
								style={[styles.inputText, { color: "#222" }]}
								numberOfLines={1}
							>
								{/* ✅ Use reactive subscription, not getState() */}
								{parentLocation?.location_name}
							</Text>
						</View>
					</View>
				}

				<FormField
					label="Select users to assign to location"
					type="new-user"
					placeholder="User"
					field="assigned_users"
					router={router}
					comingFrom="createLocation"
					store={useCreateLocationStore}
					setterName="setCreateLocationValue"
					required={true}
				/>


				<FormField
					label="Attachments"
					type="attachments"
					placeholder=""
					field="attachments"
					router={router}
					required={false}
					comingFrom="createLocation"
					store={useCreateLocationStore}
					setterName="setCreateLocationValue"
				/>

				{/* ✅ Use reactive `attachments` subscription — getState() was stale */}
				{
					attachments.length > 0 &&
					<View style={{ backgroundColor: 'transparent', padding: 10, marginHorizontal: 20, alignItems: "flex-start" }}>
						<View style={{ position: "relative" }}>
							<Image
								source={{ uri: `${endpoints.baseURL}locations/${attachments[0]?.image_path}?t=${Date.now()}` }}
								style={{ width: 200, height: 200, borderRadius: 8 }}
							/>
							<TouchableOpacity
								onPress={() => setCreateLocationValue("attachments", [])}
								style={{ position: "absolute", top: -8, right: -8, backgroundColor: "#000", borderRadius: 12, padding: 4 }}
							>
								<Feather name="x" size={16} color="#fff" />
							</TouchableOpacity>
						</View>
					</View>
				}


				{/* ✅ disabled prop prevents double-tap duplicate submissions */}
				<TouchableOpacity
					style={[styles.createBtn, loading && { opacity: 0.6 }]}
					onPress={handleCreateLocation}
					disabled={loading}
				>
					{loading
						? <ActivityIndicator size={"small"} color={"#fff"} />
						: <Text style={styles.createBtnText}>{data?.isEdit === "true" ? "Update Location" : "Create Location"}</Text>
					}
				</TouchableOpacity>

		</KeyboardAwareScrollView>
	)
}

export default createLocation

const styles = StyleSheet.create({
	container: {
		flex: 1,
		// backgroundColor: "red",
		backgroundColor: "#f9f9ff",
	},
	createBtn: {
		alignSelf: "flex-start",
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#742BDE",
		justifyContent: "center",
		gap: 5,
		marginTop: 15,
		marginHorizontal: 25,
		paddingHorizontal: 18,
		paddingVertical: 10,
		borderRadius: 5,
		elevation: 5,
		shadowColor: "rgba(116, 43, 222, 0.80)",
		shadowOffset: { width: 2, height: 2 },
		shadowOpacity: 0.60,
		shadowRadius: 2,
		marginBottom: 150,
	},
	createBtnText: {
		color: "#fff",
		fontSize: 14,
		fontFamily: Fonts.regular,
		lineHeight: 18,
	},
	locationSelector: {
		marginHorizontal: 20,
		marginVertical: 10,
	},
	labelContainer: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 5,
	},
	labelText: {
		fontSize: 12,
		fontFamily: Fonts.regular,
		lineHeight: 20,
		color: "#1C1C1C",
	},
	asterisk: {
		color: "#D63928",
		fontSize: 14,
		fontFamily: Fonts.regular,
		marginTop: -3,
		marginLeft: 2,
	},
	field: {
		backgroundColor: "#FFFFFF",
		borderRadius: 8,
		paddingHorizontal: 20,
		borderWidth: 1,
		borderColor: "#E1E8EE",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	inputText: {
		paddingVertical: 10,
		fontSize: 12,
		color: "#1C1C1C",
		fontFamily: Fonts.light,
	},
})
