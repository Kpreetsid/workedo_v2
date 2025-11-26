import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import Header from '@/components/global/Header'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import AddPartCard from './AddPartCard'
import { getParts } from '@/src/services/part.service'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { usePreventiveStore } from '@/src/store/usePreventiveStore'
import { usePartFormStore } from '@/src/store/usePartFormStore'
import { useWorkOrderStore } from '@/src/store/useWorkOrderStore'
import { useWorkRequestStore } from '@/src/store/useWorkRequestStore'
import { Ionicons } from '@expo/vector-icons'
import ActionButton from '@/components/auth-screens/ActionButton'

const addParts = () => {
	const router = useRouter();
	const [parts, setParts] = useState<any[]>([]);
	const params: any = useLocalSearchParams();
	const comingFrom = params?.comingFrom || "createPreventive";

	// ✅ pick correct store based on source
	const storeMap: any = {
		createPreventive: {
			store: usePreventiveStore,
			setter: "setPreventiveValue",
		},
		createPart: {
			store: usePartFormStore,
			setter: "setPartFormValue",
		},
		newWorkOrder: {
			store: useWorkOrderStore,
			setter: "setWorkForm",
		},
		NewWorkRequest: {
			store: useWorkRequestStore,
			setter: "setWorkRequestForm",
		},
	};

	const storeEntry = storeMap[comingFrom];
	const useStore = storeEntry.store();
	const setterKey = storeEntry.setter;

	console.log('use store = ', setterKey);

	const selectedParts = useStore.parts;

	useEffect(() => {
		fetchParts();
	}, []);

	const fetchParts = async () => {
		try {
			const res = await getParts();
			if (res.status && Array.isArray(res.data)) setParts(res.data);
		} catch (err) {
			console.error("Fetching parts failed:", err);
		}
	};

	const handleAddPart = (item: any, qty: string) => {
		if (!qty || Number(qty) <= 0) return;

		const partObj = {
			id: item.id,
			part_name: item.part_name,
			part_number: item.part_number,
			part_type: item.part_type,
			unit: item.unit,
			estimatedQuantity: Number(qty),
		};

		console.log('part obj = ', partObj);

		const oldParts = useStore.parts ?? [];

		// Add or replace
		const updated = [
			...oldParts.filter((p: any) => p.id !== item.id),
			partObj,
		];

		useStore[setterKey]("parts", updated);
	};

	useEffect(() => {
		console.log('parts = ', parts);
	}, [parts])

	const handleRemovePart = (id: string) => {
		const updated = useStore.parts.filter((p: any) => p.id !== id);
		useStore[setterKey]("parts", updated);
	};

	return (
		<>
			<Header title="Add Parts" />
			<KeyboardAwareScrollView bottomOffset={30} style={{ backgroundColor: '#F5F7FA' }}>

				<View style={styles.selectedWrap}>
					{selectedParts?.map((p: any) => (
						<View key={p.id} style={styles.chip}>
							<Text style={styles.chipText}>
								{p.part_name} - {p.estimatedQuantity}
							</Text>

							<TouchableOpacity
								style={styles.closeBtn}
								onPress={() => handleRemovePart(p.id)}
							>
								<Ionicons name="close" size={12} style={styles.close} />
							</TouchableOpacity>
						</View>
					))}
				</View>


				{
					parts?.map((item, index) => {
						return (
							<AddPartCard
								key={item.id}
								item={item}
								onAdd={handleAddPart}
							/>
						);
					})
				}

				<View style={styles.btnContainer}>
					{
						parts?.length > 0 && <ActionButton label="Confirm" onPress={() => router.back()} />
					}
				</View>

			</KeyboardAwareScrollView>

		</>
	)
}

export default addParts

const styles = StyleSheet.create({
	selectedWrap: {
		backgroundColor: '#fff',
		flexDirection: "row",
		flexWrap: "wrap",
		marginHorizontal: 20,
		marginTop: 10,
	},
	chip: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 12,
		paddingVertical: 6,
		backgroundColor: "rgba(117, 43, 223, 0.1)",
		borderColor: "#752BDF",
		borderWidth: StyleSheet.hairlineWidth,
		borderRadius: 6,
		margin: 5,
	},
	chipText: {
		fontSize: 12,
		color: "#000",
	},
	closeBtn: {
		height: 16,
		width: 16,
		position: 'absolute',
		top: -5,
		right: -5,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: '#292D32',
		borderRadius: 20,
	},
	close: {
		fontSize: 12,
		color: "#fff",
	},
	btnContainer: {
		marginHorizontal: 20,
		marginVertical: 10,
		backgroundColor: '#F5F7FA',
		paddingVertical: 10,
	},
})