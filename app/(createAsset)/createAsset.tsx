import { Pressable, ScrollView, StyleSheet, Text, ToastAndroid, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import { FormField } from '@/components/global/FormField'
import { useCreateAssetStore } from '@/src/store/useCreateAsset'
import Header from '@/components/global/Header'
import Fonts from '@/constants/Typography'
import Dropdown from '@/components/overview-screen/DropDown'
import { useOverviewStore } from '@/src/store/useOverviewStore'
import { useRouter } from 'expo-router'
import LocationSelector from '@/components/create-asset/LocationSelector'
import { DateDropDownIcon } from '@/constants/IconProvider'
import moment from "moment-timezone";
import { createNewAsset } from '@/src/services/asset.service'
import { locationTree, mapUserToLocation } from '@/src/services/location.service'
import { Location } from '@/src/types/location'
import { useGlobalStore } from '@/src/store/useGlobal'

const createAsset = () => {
	const router = useRouter();
	const parentLocations = useGlobalStore((state) => state.locationsTree);
	console.log('parentLocations = ', parentLocations);
	const { resetForm, setCreateAssetValue } = useCreateAssetStore();
	const assigned_users = useCreateAssetStore((state) => state.assigned_users);
	const locationObject = useCreateAssetStore((state) => state.locationObject);

	const setAssignedUsers = useCreateAssetStore((state) => state.setAssignedUsers);

	const [open, setOpen] = useState<boolean | null>(false);
	const [timezones, setTimezones] = useState<string[]>([]);

	useEffect(() => {
		fetchAllTimezones();

		return () => {
			resetForm();
		}
	}, [])

	useEffect(() => {
		if (locationObject) {
			console.log('location object in effect = ', locationObject);
			mapUserToLocationFunc(locationObject.id);
		}
	}, [locationObject])

	useEffect(() => {
		console.log('assigned users now = ', assigned_users);
	}, [assigned_users])

	const mapUserToLocationFunc = async (location_id: string) => {
		try {
			const res = await mapUserToLocation(location_id);
			console.log('res = ', res);
			if (res?.status) {
				console.log('assigned_users = ', assigned_users);
				setAssignedUsers([...assigned_users, ...res?.data]);
			}
		} catch (err) {
			console.log('error = ', err);
		}
	}

	const fetchAllTimezones = () => {
		console.log(moment.tz.names())
		setTimezones(moment.tz.names());
	}

	const handleCreateAsset = async () => {
		console.log('create asset = ', useCreateAssetStore.getState());

		const payload = {
			top_level: true,
			top_level_asset_id: "",
			asset_name: useCreateAssetStore.getState().title,
			asset_timezone: useCreateAssetStore.getState().timezone,
			description: useCreateAssetStore.getState().description,
			asset_model: useCreateAssetStore.getState().model,
			manufacturer: useCreateAssetStore.getState().manufacturer,
			asset_type: useCreateAssetStore.getState().asset_type,
			year: useCreateAssetStore.getState().year,
			asset_id: useCreateAssetStore.getState().asset_id,
			asset_build_type: "Not Defined",
			locationId: useCreateAssetStore.getState().locationObject?.id,
			userIdList: useCreateAssetStore.getState().assigned_users,
		};

		console.log('payload = ', payload);

		try {
			const res = await createNewAsset(payload);
			console.log('res = ', res);
			if (res.status) {
				resetForm();
				ToastAndroid.show('Asset created successfully', ToastAndroid.LONG);
				router.back();
			}
		} catch (err) {
			console.log('error = ', err);
		}
	}

	return (
		<KeyboardAwareScrollView bottomOffset={30} style={styles.container}>
			<ScrollView style={styles.container}>
				<Header title="Add New Asset" />

				<FormField
					label="Title"
					placeholder="Enter Title"
					field="title"
					store={useCreateAssetStore}
					setterName="setCreateAssetValue"
				/>

				<FormField
					label="Asset ID"
					placeholder="Enter Asset ID"
					field="asset_id"
					store={useCreateAssetStore}
					setterName="setCreateAssetValue"
				/>

				<FormField
					label="Asset Type"
					type="dropdown"
					field="asset_type"
					options={["Fan_Blower", "Pumps", "Gearbox", "Compressor", "Chillers", "CNC", "Motor", "Other"]}
					store={useCreateAssetStore}
					setterName="setCreateAssetValue"
				/>

				<FormField
					label="Time Zone"
					type="dropdown"
					placeholder="Select Time Zone"
					field="timezone"
					options={timezones}
					store={useCreateAssetStore}
					setterName="setCreateAssetValue"
				/>

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
									open === false && { color: "#888" },
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

				{open && <LocationSelector />}

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
					/>
				}

				<FormField
					label="Manufacturer"
					required={false}
					placeholder="Enter Manufacturer"
					field="manufacturer"
					store={useCreateAssetStore}
					setterName="setCreateAssetValue"
				/>

				<FormField
					label="Model"
					required={false}
					placeholder="Enter Model"
					field="model"
					store={useCreateAssetStore}
					setterName="setCreateAssetValue"
				/>

				<FormField
					label="Year"
					required={false}
					placeholder="Enter Year"
					field="year"
					store={useCreateAssetStore}
					setterName="setCreateAssetValue"
				/>

				<FormField
					label="Description"
					required={false}
					placeholder="Enter Description"
					field="description"
					store={useCreateAssetStore}
					setterName="setCreateAssetValue"
				/>

				<TouchableOpacity style={styles.createBtn} onPress={handleCreateAsset}>
					<Text style={styles.createBtnText}>Create Asset</Text>
				</TouchableOpacity>

			</ScrollView>
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