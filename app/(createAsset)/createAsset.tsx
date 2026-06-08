import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, ToastAndroid, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import { FormField } from '@/components/global/FormField'
import { useCreateAssetStore } from '@/src/store/useCreateAsset'
import Header from '@/components/global/Header'
import Fonts from '@/constants/Typography'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { DateDropDownIcon } from '@/constants/IconProvider'
import moment from "moment-timezone";
import { createNewAsset, mapUserToAsset, singleAssetData } from '@/src/services/asset.service'
import { mapUserToLocation } from '@/src/services/location.service'
import { Asset } from '@/src/types/asset'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import LocationPickerModal from '@/components/create-work-order/LocationPickerModal'
import { Image } from 'expo-image'
import { endpoints } from '@/src/api/endpoints'
import { Feather } from '@expo/vector-icons'
import { getRouteParamString, parseJsonRouteParam } from '@/src/utils/routeParams'

interface createAssetParams {
	asset_data: Asset;
	mode?: string;
}

const createAsset = () => {
	console.log('running create asset')
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const { asset_data, mode } = useLocalSearchParams();
	const [usersMappedToLocation, setUsersMappedToLocation] = useState([])

	const [loading, setLoading] = useState(false);
	const { resetForm, setCreateAssetValue } = useCreateAssetStore();
	const assigned_users = useCreateAssetStore((state) => state.assigned_users);
	const locationObject = useCreateAssetStore((state) => state.locationObject);

	// ✅ Reactive store subscriptions — prevents stale getState() reads in JSX
	const attachments = useCreateAssetStore((s) => s.attachments);
	const parentAsset = useCreateAssetStore((s) => s.parent_asset);
	const parentLocation = useCreateAssetStore((s) => s.parent_location);

	const [open, setOpen] = useState<boolean | null>(false);
	const [timezones, setTimezones] = useState<string[]>([]);

	// typed, parsed object
	const data: createAssetParams = {
		asset_data: parseJsonRouteParam<Asset>(asset_data) as any,
		mode: getRouteParamString(mode)
	};

	useEffect(() => {
		fetchAllTimezones();
		setCreateAssetValue("timezone", "Asia/Kolkata");

		if (data.mode === 'child') {
			fetchAssetData();
		}

		return () => {
			resetForm();
		}
	}, [])

	const fetchAssetData = async () => {
		// ✅ Guard: never call API with undefined asset ID
		if (!data.asset_data?.id) {
			console.warn('[createAsset] fetchAssetData called without asset id');
			return;
		}
		try {
			const res = await singleAssetData(data.asset_data.id);
			console.log('single asset data = ', res);
			// ✅ Null-safe array access — data[0] crashes if empty
			if (res?.status && res?.data?.[0]) {
				const assetData = res.data[0];
				const locationData = assetData?.locationData?.[0] ?? assetData?.locationId;
				if (locationData) {
					setCreateAssetValue("location", locationData.id);
					setCreateAssetValue("locationObject", locationData);
					setCreateAssetValue("parent_location", locationData);
				}
				setCreateAssetValue("parent_asset", {
					id: assetData.id,
					asset_name: assetData.asset_name,
				} as any);
			}
		} catch (e) {
			console.error('[createAsset] fetchAssetData error:', e);
		}
	}

	useEffect(() => {
		if (locationObject && mode != 'child') {
			console.log('location object in effect = ', locationObject);
			mapUserToLocationFunc(locationObject.id);
			return;
		}

		if (locationObject && mode === 'child') {
			mapUserToAssetFunc(data.asset_data?.id);
		}
	}, [locationObject])

	const mapUserToLocationFunc = async (location_id: string) => {
		try {
			const res = await mapUserToLocation(location_id);
			console.log('res = ', res);
			if (res?.status) {
				setUsersMappedToLocation(res?.data)
				console.log('assigned_users = ', assigned_users);
				setCreateAssetValue("assigned_users", res?.data);
				// setCreateAssetValue("assigned_users", [...assigned_users, ...res?.data]);
			}
		} catch (err) {
			console.log('error = ', err);
			setUsersMappedToLocation([])
			setCreateAssetValue("assigned_users", []);
		}
	}

	useEffect(() => {
		console.log('assigned users now = ', assigned_users);
	}, [assigned_users])

	const mapUserToAssetFunc = async (asset_id: string) => {
		try {
			const res = await mapUserToAsset(asset_id);
			console.log('res = ', res);
			if (res?.status) {
				setUsersMappedToLocation(res?.data)
				console.log('assigned_users = ', assigned_users);
				setCreateAssetValue("assigned_users", res?.data);
			}
		} catch (err) {
			console.log('error = ', err);
			setUsersMappedToLocation([])
		}
	}

	const fetchAllTimezones = () => {
		console.log(moment.tz.names())
		setTimezones(moment.tz.names());
	}

	const handleCreateAsset = async () => {
		const values = useCreateAssetStore.getState();
		console.log('values = ', values);

		if (values.title === "") {
			ToastAndroid.show("Please enter asset name", ToastAndroid.SHORT);
			return;
		}

		if (values.asset_type === "") {
			ToastAndroid.show("Please enter asset type", ToastAndroid.SHORT);
			return;
		}

		if (!values.locationObject) {
			ToastAndroid.show("Please select parent location", ToastAndroid.SHORT);
			return;
		}


		if (values.assigned_users.length === 0) {
			ToastAndroid.show("Please assign users", ToastAndroid.SHORT);
			return;
		}

		if (data?.mode === 'child') {
			if (values.asset_build_type === "") {
				ToastAndroid.show("Please select circuit type", ToastAndroid.SHORT);
				return;
			}
		}

		setLoading(true)
		let payload: any = {
			// new parameter alarmType added.
			alarmType: ["alert", "danger", "critical"],
			top_level: data?.mode === 'child' ? false : true,
			top_level_asset_id: data?.mode === 'child' ? data?.asset_data?.id : "",
			asset_name: values.title,
			asset_timezone: values.timezone,
			description: values.description,
			asset_model: values.model,
			manufacturer: values.manufacturer,
			asset_type: values.asset_type,
			year: values.year,
			asset_id: values.asset_id,
			asset_build_type: "Not Defined",
			locationId: values.locationObject?.id,
			userIdList: values.assigned_users
				.map((u: any) => u?.user?.id ?? u?.id)
				.filter(Boolean),
			image_path: values.attachments.length > 0 ? values.attachments[0].image_path : "",
		};

		if (data?.mode === 'child') {
			payload.asset_build_type = values.asset_build_type == "Electric" ? "electric" : "non_electric";

			payload.parent_id = data?.asset_data?.id;
		}

		console.log('payload create asset = ', payload);

		try {
			const res = await createNewAsset(payload);
			console.log('res = ', res);
			// ✅ Null-safe check — res can be undefined if network fails before throwing
			if (res?.status) {
				resetForm();
				ToastAndroid.show('Asset created successfully', ToastAndroid.SHORT);
				router.back();
			} else {
				ToastAndroid.show(res?.message || 'Failed to create asset. Please try again.', ToastAndroid.LONG);
			}
		} catch (err: any) {
			console.error('[createAsset] Error:', err);
			ToastAndroid.show(err?.message || 'Network error. Please check your connection.', ToastAndroid.LONG);
		} finally {
			// ✅ Always reset loading — prevents infinite spinner state
			setLoading(false);
		}
	}

	return (
		// ✅ Removed nested ScrollView — was causing gesture handler conflicts on Android
		<KeyboardAwareScrollView bottomOffset={30} style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
				<Header title={`Add New ${data?.mode === undefined ? '' : data?.mode} Asset`} />

				<FormField
					label="Title"
					placeholder="Enter Title"
					field="title"
					store={useCreateAssetStore}
					setterName="setCreateAssetValue"
					styles={{ paddingHorizontal: 25 }}
				/>

				<FormField
					label="Asset ID"
					placeholder="Enter Asset ID"
					field="asset_id"
					store={useCreateAssetStore}
					setterName="setCreateAssetValue"
					required={false}
					styles={{ paddingHorizontal: 25 }}
				/>

				<FormField
					label="Asset Type"
					type="dropdown"
					field="asset_type"
					options={["Fan_Blower", "Pumps", "Gearbox", "Compressor", "Chillers", "CNC", "Motor", "Other"]}
					store={useCreateAssetStore}
					setterName="setCreateAssetValue"
					styles={{ paddingHorizontal: 25 }}
				/>

				<FormField
					label="Time Zone"
					type="dropdown"
					placeholder="Select Time Zone"
					field="timezone"
					options={timezones}
					store={useCreateAssetStore}
					setterName="setCreateAssetValue"
					styles={{ paddingHorizontal: 25 }}
				/>

				{
					data?.mode === 'child' ?
						<View
							style={[
								styles.locationSelector
							]}
						>
							<View style={styles.labelContainer}>
								<Text style={styles.labelText}>Parent Location</Text>
								<Text style={styles.asterisk}>*</Text>
							</View>

							<View
								style={[styles.field]}
							>
								<Text
								style={[styles.inputText, { color: "#222" }]}
								numberOfLines={1}
							>
								{/* ✅ Reactive subscription — not stale getState() */}
								{parentLocation?.location_name}
							</Text>
							</View>
						</View>
						:
						<Pressable onPress={() => setOpen(!open)}>
							<View
								style={[
									styles.locationSelector
								]}
							>
								<View style={styles.labelContainer}>
									<Text style={styles.labelText}>Parent Location</Text>
									<Text style={styles.asterisk}>*</Text>
								</View>

								<Pressable
									style={[styles.field]}
									onPress={() => setOpen(!open)}
								>
									<Text
										style={[
											styles.inputText,
											open === false && { color: "#222" },
										]}
										numberOfLines={1}
									>
										{
											locationObject ? locationObject?.location_name : "Select"
										}
									</Text>
									<DateDropDownIcon />
								</Pressable>
							</View>
						</Pressable>
				}

				{
					// open && data?.mode != 'child' && <LocationSelector />
					open && data?.mode != 'child' &&
					<LocationPickerModal
						visible={open}
						onClose={() => setOpen(false)}
						comingFrom="createAsset"
					/>
					// <LocationSelector />
				}

				{
					data?.mode === 'child' &&
					<View
						style={[
							styles.locationSelector
						]}
					>
						<View style={styles.labelContainer}>
							<Text style={styles.labelText}>Parent Asset</Text>
							<Text style={styles.asterisk}>*</Text>
						</View>

						<View
							style={[styles.field]}
						>
							<Text
								style={[styles.inputText, { color: "#222" }]}
								numberOfLines={1}
							>
								{/* ✅ Reactive subscription */}
								{parentAsset?.asset_name}
							</Text>
						</View>
					</View>
				}

				{
					locationObject &&
					<FormField
						label="Select users to assign to location"
						type="new-user"
						placeholder="User"
						field="assigned_users"
						router={router}
						comingFrom="createAsset"
						store={useCreateAssetStore}
						setterName="setCreateAssetValue"
						usersData={usersMappedToLocation}
					/>
				}

				{
					data?.mode === 'child' &&
					<FormField
						label="Circuit Type"
						type="dropdown"
						field="asset_build_type"
						options={["Electric", "Non Electric"]}
						store={useCreateAssetStore}
						setterName="setCreateAssetValue"
						styles={{ paddingHorizontal: 25 }}
					/>
				}

				<FormField
					label="Manufacturer"
					required={false}
					placeholder="Enter Manufacturer"
					field="manufacturer"
					store={useCreateAssetStore}
					setterName="setCreateAssetValue"
					styles={{ paddingHorizontal: 25 }}
				/>

				<FormField
					label="Model"
					required={false}
					placeholder="Enter Model"
					field="model"
					store={useCreateAssetStore}
					setterName="setCreateAssetValue"
					styles={{ paddingHorizontal: 25 }}
				/>

				<FormField
					label="Year"
					required={false}
					placeholder="Enter Year"
					field="year"
					store={useCreateAssetStore}
					setterName="setCreateAssetValue"
					styles={{ paddingHorizontal: 25 }}
				/>

				<FormField
					label="Description"
					required={false}
					placeholder="Enter Description"
					field="description"
					store={useCreateAssetStore}
					setterName="setCreateAssetValue"
					styles={{ paddingHorizontal: 25 }}
				/>

				<FormField
					label="Attachments"
					type="attachments"
					placeholder=""
					field="attachments"
					router={router}
					required={false}
					comingFrom="createAsset"
					store={useCreateAssetStore}
					setterName="setCreateAssetValue"
				/>


				{/* ✅ Use reactive `attachments` subscription — getState() was stale */}
				{
					attachments.length > 0 &&
					<View style={{ backgroundColor: 'transparent', padding: 10, marginHorizontal: 20, alignItems: 'flex-start' }}>
						<View style={{ position: "relative" }}>
							<Image
								source={{ uri: `${endpoints.baseURL}assets/${attachments[0]?.image_path}?t=${Date.now()}` }}
								style={{ width: 200, height: 200, borderRadius: 8 }}
							/>
							<TouchableOpacity
								onPress={() => setCreateAssetValue("attachments", [])}
								style={{ position: "absolute", top: -8, right: -8, backgroundColor: "#000", borderRadius: 12, padding: 4 }}
							>
								<Feather name="x" size={16} color="#fff" />
							</TouchableOpacity>
						</View>
					</View>
				}


				{/* ✅ disabled prevents double-tap duplicate API calls */}
				<TouchableOpacity
					style={[styles.createBtn, { marginBottom: insets.bottom + 60 }, loading && { opacity: 0.6 }]}
					onPress={handleCreateAsset}
					disabled={loading}
				>
					{loading
						? <ActivityIndicator size={"small"} color={"#fff"} />
						: <Text style={styles.createBtnText}>Create Asset</Text>
					}
				</TouchableOpacity>

		</KeyboardAwareScrollView>
	)
}

export default createAsset

const styles = StyleSheet.create({
	container: {
		flex: 1,
		// backgroundColor: "red",
		backgroundColor: "#f9f9ff",
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
		marginBottom: 15,
	},
	createBtnText: {
		color: "#fff",
		fontSize: 14,
		fontFamily: Fonts.regular,
		lineHeight: 18,
	},
})
