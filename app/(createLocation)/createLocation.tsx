import { ScrollView, StyleSheet, Text, ToastAndroid, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import Header from '@/components/global/Header'
import { FormField } from '@/components/global/FormField'
import { useCreateLocationStore } from '@/src/store/useCreateLocationStore'
import { useRouter } from 'expo-router'
import { createNewLocation } from '@/src/services/location.service'
import Fonts from '@/constants/Typography'

const createLocation = () => {
	const router = useRouter();
	const { resetForm } = useCreateLocationStore();

	const handleCreateLocation = async () => {
		console.log('create location = ', useCreateLocationStore.getState());

		const payload = {
			top_level: true,
			top_level_location_id: "",
			location_name: useCreateLocationStore.getState().title,
			description: useCreateLocationStore.getState().description,
			location_type: useCreateLocationStore.getState().location_type,
			userIdList: useCreateLocationStore.getState().assigned_users.map((u: any) => u.id),
		};

		console.log('payload = ', payload);

		try {
			const res = await createNewLocation(payload);
			console.log('res = ', res);
			if (res.status) {
				resetForm();
				ToastAndroid.show('Location created successfully', ToastAndroid.LONG);
				router.back();
			}
		} catch (err) {
			console.log('error = ', err);
		}
	}

	return (
		<KeyboardAwareScrollView bottomOffset={30} style={styles.container}>
			<ScrollView style={styles.container}>
				<Header title="Add New Location" />

				<FormField
					label="Title"
					placeholder="Enter Title"
					field="title"
					store={useCreateLocationStore}
					setterName="setCreateLocationValue"
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
				/>


				<FormField
					label="Description"
					required={false}
					placeholder="Enter Description"
					field="description"
					store={useCreateLocationStore}
					setterName="setCreateLocationValue"
				/>


				<FormField
					label="Select users to assign to location"
					type="new-user"
					placeholder="User"
					field="assigned_users"
					router={router}
					comingFrom="createLocation"
					store={useCreateLocationStore}
					setterName="setCreateLocationValue"
				/>


				<FormField
					label="Attachments"
					type="attachments"
					placeholder=""
					field="attachments"
					router={router}
					comingFrom="createLocation"
					store={useCreateLocationStore}
					setterName="setCreateLocationValue"
				/>


				<TouchableOpacity style={styles.createBtn} onPress={handleCreateLocation}>
					<Text style={styles.createBtnText}>Create Location</Text>
				</TouchableOpacity>

			</ScrollView>
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
		marginBottom: 15,
	},
	createBtnText: {
		color: "#fff",
		fontSize: 14,
		fontFamily: Fonts.regular,
		lineHeight: 18,
	},
})