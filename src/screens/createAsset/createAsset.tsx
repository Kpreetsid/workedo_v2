import { ActivityIndicator, Pressable, StyleSheet, Text, ToastAndroid, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import { FormField } from '@/src/components/global/FormField'
import { useCreateAssetStore } from '@/src/state/assets/useCreateAsset'
import Header from '@/src/components/global/Header'
import Fonts from '@/constants/Typography'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { DateDropDownIcon } from '@/constants/IconProvider'
import moment from "moment-timezone";
import { createNewAsset, mapUserToAsset, singleAssetData } from '@/src/services/asset.service'
import { mapUserToLocation } from '@/src/services/location.service'
import { Asset } from '@/src/types/asset'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import LocationPickerModal from '@/src/components/create-work-order/LocationPickerModal'
import { Image } from 'expo-image'
import { endpoints } from '@/src/services/api/endpoints'
import { Feather } from '@expo/vector-icons'
import { getRouteParamString, parseJsonRouteParam } from '@/src/utils/routeParams'

// --- Zod & Hook Form Imports ---
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { assetSchemas } from '@/src/validations/schemas'
import { ControlledInput } from '@/src/components/forms/ControlledInput'
import { ControlledSelect } from '@/src/components/forms/ControlledSelect'

type AssetFormValues = z.infer<typeof assetSchemas.create>;

interface createAssetParams {
	asset_data: Asset;
	mode?: string;
}

const createAsset = () => {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const { asset_data, mode } = useLocalSearchParams();
	const [usersMappedToLocation, setUsersMappedToLocation] = useState([])

	const [loading, setLoading] = useState(false);
	
	// Zustand for complex/external fields
	const { resetForm, setCreateAssetValue } = useCreateAssetStore();
	const assigned_users = useCreateAssetStore((state) => state.assigned_users);
	const locationObject = useCreateAssetStore((state) => state.locationObject);
	const attachments = useCreateAssetStore((s) => s.attachments);
	const parentAsset = useCreateAssetStore((s) => s.parent_asset);
	const parentLocation = useCreateAssetStore((s) => s.parent_location);

	const [open, setOpen] = useState<boolean | null>(false);
	const [timezones, setTimezones] = useState<string[]>([]);

	const data: createAssetParams = {
		asset_data: parseJsonRouteParam<Asset>(asset_data) as any,
		mode: getRouteParamString(mode)
	};

	// --- React Hook Form Setup ---
	const { control, handleSubmit, setValue, trigger, formState: { errors } } = useForm<AssetFormValues>({
		resolver: zodResolver(assetSchemas.create),
		defaultValues: {
			title: '',
			asset_id: '',
			asset_type: undefined,
			timezone: 'Asia/Kolkata',
			manufacturer: '',
			model: '',
			year: '',
			description: '',
			asset_build_type: '',
			locationObject: null,
			assigned_users: [],
		}
	});

	// Sync Zustand to React Hook Form for complex fields
	useEffect(() => {
		setValue('locationObject', locationObject);
		if (locationObject) trigger('locationObject');
	}, [locationObject]);

	useEffect(() => {
		setValue('assigned_users', assigned_users);
		if (assigned_users.length > 0) trigger('assigned_users');
	}, [assigned_users]);

	useEffect(() => {
		fetchAllTimezones();

		if (data.mode === 'child') {
			fetchAssetData();
		}

		return () => {
			resetForm();
		}
	}, [])

	const fetchAssetData = async () => {
		if (!data.asset_data?.id) return;
		try {
			const res = await singleAssetData(data.asset_data.id);
			if (res?.status && res?.data?.[0]) {
				const assetData = res.data[0];
				const locationData = assetData?.locationData?.[0] ?? assetData?.locationId;
				if (locationData) {
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
			if (res?.status) {
				setUsersMappedToLocation(res?.data)
				setCreateAssetValue("assigned_users", res?.data);
			}
		} catch (err) {
			setUsersMappedToLocation([])
			setCreateAssetValue("assigned_users", []);
		}
	}

	const mapUserToAssetFunc = async (asset_id: string) => {
		try {
			const res = await mapUserToAsset(asset_id);
			if (res?.status) {
				setUsersMappedToLocation(res?.data)
				setCreateAssetValue("assigned_users", res?.data);
			}
		} catch (err) {
			setUsersMappedToLocation([])
		}
	}

	const fetchAllTimezones = () => {
		setTimezones(moment.tz.names());
	}

	// Submit handler via React Hook Form
	const onSubmit = async (values: AssetFormValues) => {
		if (data?.mode === 'child' && (!values.asset_build_type || values.asset_build_type === '')) {
			ToastAndroid.show("Please select circuit type", ToastAndroid.SHORT);
			return;
		}

		setLoading(true)
		let payload: any = {
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
			image_path: attachments.length > 0 ? attachments[0].image_path : "",
		};

		if (data?.mode === 'child') {
			payload.asset_build_type = values.asset_build_type == "Electric" ? "electric" : "non_electric";
			payload.parent_id = data?.asset_data?.id;
		}

		try {
			const res = await createNewAsset(payload);
			if (res?.status) {
				resetForm();
				ToastAndroid.show('Asset created successfully', ToastAndroid.SHORT);
				router.back();
			} else {
				ToastAndroid.show(res?.message || 'Failed to create asset. Please try again.', ToastAndroid.LONG);
			}
		} catch (err: any) {
			ToastAndroid.show(err?.message || 'Network error. Please check your connection.', ToastAndroid.LONG);
		} finally {
			setLoading(false);
		}
	}

	return (
		<KeyboardAwareScrollView bottomOffset={30} style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
				<Header title={`Add New ${data?.mode === undefined ? '' : data?.mode} Asset`} />

				<ControlledInput
					name="title"
					control={control as any}
					label="Title"
					placeholder="Enter Title"
					required={true}
				/>

				<ControlledInput
					name="asset_id"
					control={control as any}
					label="Asset ID"
					placeholder="Enter Asset ID"
					required={false}
				/>

				<ControlledSelect
					name="asset_type"
					control={control as any}
					label="Asset Type"
					options={["Fan_Blower", "Pumps", "Gearbox", "Compressor", "Chillers", "CNC", "Motor", "Other"]}
					required={true}
					containerStyle={{ marginHorizontal: 20 }}
				/>

				<ControlledSelect
					name="timezone"
					control={control as any}
					label="Time Zone"
					options={timezones.length > 0 ? timezones : ["Asia/Kolkata"]}
					required={true}
					containerStyle={{ marginHorizontal: 20 }}
				/>

				{
					data?.mode === 'child' ?
						<View style={styles.locationSelector}>
							<View style={styles.labelContainer}>
								<Text style={styles.labelText}>Parent Location</Text>
								<Text style={styles.asterisk}>*</Text>
							</View>
							<View style={styles.field}>
								<Text style={[styles.inputText, { color: "#222" }]} numberOfLines={1}>
									{parentLocation?.location_name}
								</Text>
							</View>
						</View>
						:
						<Pressable onPress={() => setOpen(!open)}>
							<View style={styles.locationSelector}>
								<View style={styles.labelContainer}>
									<Text style={styles.labelText}>Parent Location</Text>
									<Text style={styles.asterisk}>*</Text>
								</View>
								<Pressable style={[styles.field, errors.locationObject && { borderColor: '#D63928', borderWidth: 1.5 }]} onPress={() => setOpen(!open)}>
									<Text style={[styles.inputText, open === false && { color: "#222" }]} numberOfLines={1}>
										{locationObject ? locationObject?.location_name : "Select"}
									</Text>
									<DateDropDownIcon />
								</Pressable>
								{errors.locationObject && <Text style={{ color: '#D63928', fontSize: 10, marginTop: 4 }}>{errors.locationObject.message as string}</Text>}
							</View>
						</Pressable>
				}

				{
					open && data?.mode != 'child' &&
					<LocationPickerModal
						visible={open}
						onClose={() => setOpen(false)}
						comingFrom="createAsset"
					/>
				}

				{
					data?.mode === 'child' &&
					<View style={styles.locationSelector}>
						<View style={styles.labelContainer}>
							<Text style={styles.labelText}>Parent Asset</Text>
							<Text style={styles.asterisk}>*</Text>
						</View>
						<View style={styles.field}>
							<Text style={[styles.inputText, { color: "#222" }]} numberOfLines={1}>
								{parentAsset?.asset_name}
							</Text>
						</View>
					</View>
				}

				{
					locationObject &&
					<View>
						{/* We keep FormField here specifically for the "new-user" navigation flow, as rewriting it right now is complex */}
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
						{errors.assigned_users && <Text style={{ color: '#D63928', fontSize: 10, marginTop: -5, marginLeft: 25 }}>{errors.assigned_users.message as string}</Text>}
					</View>
				}

				{
					data?.mode === 'child' &&
					<ControlledSelect
						name="asset_build_type"
						control={control as any}
						label="Circuit Type"
						options={["Electric", "Non Electric"]}
						required={true}
						containerStyle={{ marginHorizontal: 20 }}
					/>
				}

				<ControlledInput name="manufacturer" control={control as any} label="Manufacturer" placeholder="Enter Manufacturer" />
				<ControlledInput name="model" control={control as any} label="Model" placeholder="Enter Model" />
				<ControlledInput name="year" control={control as any} label="Year" placeholder="Enter Year" />
				<ControlledInput name="description" control={control as any} label="Description" placeholder="Enter Description" multiline={true} numberOfLines={3} />

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

				<TouchableOpacity
					style={[styles.createBtn, { marginBottom: insets.bottom + 60 }, loading && { opacity: 0.6 }]}
					onPress={handleSubmit(onSubmit)}
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
	container: { flex: 1, backgroundColor: "#f9f9ff" },
	locationSelector: { marginHorizontal: 20, marginVertical: 10 },
	labelContainer: { flexDirection: "row", alignItems: "center", marginBottom: 5 },
	labelText: { fontSize: 12, fontFamily: Fonts.regular, lineHeight: 20, color: "#1C1C1C" },
	asterisk: { color: "#D63928", fontSize: 14, fontFamily: Fonts.regular, marginTop: -3, marginLeft: 2 },
	field: { backgroundColor: "#FFFFFF", borderRadius: 8, paddingHorizontal: 20, borderWidth: 1, borderColor: "#E1E8EE", flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
	inputText: { paddingVertical: 10, fontSize: 12, color: "#1C1C1C", fontFamily: Fonts.light },
	createBtn: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", backgroundColor: "#742BDE", justifyContent: "center", gap: 5, marginTop: 15, marginHorizontal: 25, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 5, elevation: 5, shadowColor: "rgba(116, 43, 222, 0.80)", shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.60, shadowRadius: 2, marginBottom: 15 },
	createBtnText: { color: "#fff", fontSize: 14, fontFamily: Fonts.regular, lineHeight: 18 },
})
