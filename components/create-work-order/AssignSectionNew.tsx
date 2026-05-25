import { StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import { useRouter } from 'expo-router';
import { useWorkOrderStore } from '@/src/store/useWorkOrderStore';
import { FormField } from '../global/FormField';
import DatePicker from '../global/DatePicker';
import moment from 'moment';
import LocationPickerModal from './LocationPickerModal';
import AssetPickerModal from './AssetPickerModal';

const AssignSectionNew = ({ type, lockLocation = false }: { type: "workOrders" | "requests"; lockLocation?: boolean }) => {
	const router = useRouter();
	const { setWorkForm } = useWorkOrderStore();

	const workOrderLocation = useWorkOrderStore((state) => state.location);
	const workOrderAsset = useWorkOrderStore((state) => state.selected_asset);

	const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
	const [activeDateField, setActiveDateField] = useState<"start_date" | "end_date" | null>(null);
	const [visible, setVisible] = useState(false);
	const [visibleAsset, setVisibleAsset] = useState(false);
	const [selectedLocation, setSelectedLocation] = useState(null);
	const [comingFrom, setComingFrom] = useState<string | null>(null);

	return (
		<View>
			<FormField
				label="Select Location"
				type="new-location"
				placeholder="Location"
				field="location"
				router={router}
				comingFrom="newWorkOrder"
				store={useWorkOrderStore}
				setterName="setWorkForm"
				openPicker={() => {
					if (!lockLocation) {
						setVisible(true)
					}
				}}
			/>

			<LocationPickerModal
				visible={visible}
				onClose={() => setVisible(false)}
				comingFrom="newWorkOrder"
			/>

			{
				workOrderLocation &&
				<FormField
					label="Select Asset"
					type="new-asset"
					placeholder="Asset"
					field="selected_asset"
					router={router}
					comingFrom="newWorkOrder"
					store={useWorkOrderStore}
					setterName="setWorkForm"
					openPicker={() => {
						console.log('opening asset')
						setVisibleAsset(true)
					}}
				/>
			}

			<AssetPickerModal
				visible={visibleAsset}
				comingFrom="newWorkOrder"
				onClose={() => setVisibleAsset(false)}
			/>

			{
				workOrderLocation && workOrderAsset &&
				<FormField
					label="Select users to assign to the work order"
					type="new-user"
					placeholder="User"
					field="assigned_users"
					router={router}
					comingFrom="newWorkOrder"
					store={useWorkOrderStore}
					setterName="setWorkForm"
				/>
			}


			{/* --- Start Date --- */}
			{/* <FormField
				label="Start Date"
				type="date"
				field="start_date"
				router={router}
				comingFrom="newWorkOrder"
				store={useWorkOrderStore}
				setterName="setWorkForm"
				setActiveDateField={setActiveDateField}
				setIsDatePickerVisible={setIsDatePickerVisible}
			/> */}

			{/* --- End Date --- */}
			{/* <FormField
				label="End Date"
				type="date"
				field="end_date"
				router={router}
				comingFrom="newWorkOrder"
				store={useWorkOrderStore}
				setterName="setWorkForm"
				setActiveDateField={setActiveDateField}
				setIsDatePickerVisible={setIsDatePickerVisible}
			/> */}

			{/* --- Date Picker --- */}
			<DatePicker
				visible={isDatePickerVisible}
				onClose={() => setIsDatePickerVisible(false)}
				onDateSelect={(date) => {
					const formattedDate = moment(date).format("YYYY-MM-DD");
					if (activeDateField) {
						setWorkForm(activeDateField, formattedDate);
					}
					setIsDatePickerVisible(false);
					setActiveDateField(null);
				}}
			/>


		</View>
	)
}

export default AssignSectionNew

const styles = StyleSheet.create({})
