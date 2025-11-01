import { useCallback, useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, ToastAndroid, View } from "react-native";
import SearchBar from "@/components/global/SearchBar";
import Fonts from "@/constants/Typography";
import { ArrowDown } from "@/constants/IconProvider";
import Header from "@/components/global/Header";
import { router, useFocusEffect } from "expo-router";
import CreateFAB from "@/components/global/CreateFAB";
import { deleteGateway, getGateways, getSensorsList } from "@/src/services/gateway.service";
import { useAuthStore } from "@/src/store/useAuthStore";

const mockGateways = [
	{ id: "1", macId: "70:B8:F6:62:01:5c", name: "Main Gateway" },
	{ id: "2", macId: "kamal_test1", name: "Gateway Test 1" },
	{ id: "3", macId: "kamal_test2", name: "Gateway Test 2" },
	{ id: "4", macId: "parwez_dummy", name: "Gateway Dummy" },
	{ id: "5", macId: "70:B8:F6:62:01:5c", name: "Main Gateway Copy" },
	{ id: "6", macId: "kamal_test1", name: "Gateway Test 1 Copy" },
	{ id: "7", macId: "kamal_test2", name: "Gateway Test 2 Copy" },
	{ id: "8", macId: "parwez_dummy", name: "Gateway Dummy Copy" },
];

export default function Gateways() {
	const [refreshing, setRefreshing] = useState(false);
	const [sensorsList, setSensorsList] = useState<any[]>([]);
	const [gateways, setGateways] = useState<any[]>([]);
	const user = useAuthStore((state) => state.user);

	const [searchText, setSearchText] = useState("");
	const [expandedId, setExpandedId] = useState<string | null>(null);

	const filteredGateways = mockGateways.filter((g) =>
		g.macId.toLowerCase().includes(searchText.toLowerCase()) ||
		g.name.toLowerCase().includes(searchText.toLowerCase()));

	useFocusEffect(
		useCallback(() => {
			fetchSensorsList();
		}, [])
	);

	const handleRefresh = async () => {
		setRefreshing(true);
		await fetchSensorsList();
		setRefreshing(false);
	};

	async function fetchSensorsList() {
		try {
			const sensorsRes = await getSensorsList();
			console.log('sensors list = ', sensorsRes);
			if (sensorsRes.status) {
				setSensorsList(sensorsRes?.data);
			}
		} catch (error) {
			console.log('error = ', error);
		}
	}

	useEffect(() => {
		if (sensorsList.length == 0) return;
		let payload = {
			account_id: user?.account_id,
			location_list: sensorsList
		}

		console.log('payload for gateway = ', payload);
		fetchGateways(payload);
	}, [sensorsList]);

	const fetchGateways = async (payload: any) => {
		try {
			const resp = await getGateways(payload);
			console.log('resp = ', resp);
			setGateways(resp?.data?.mac_id_list.reverse());
		} catch (error) {
			console.log('error = ', error);
		}
	}

	const gatewayAction = async (action: string, item: any) => {
		console.log('action = ', action);

		if (action === 'delete') {
			try {
				let payload = {
					gateway_mac_id: item?.gateway_mac_id
				}
				const resp = await deleteGateway(payload);
				console.log('resp = ', resp);
				ToastAndroid.show(resp?.message, ToastAndroid.LONG);
				setGateways(gateways.filter((g) => g.gateway_mac_id !== item?.gateway_mac_id));
			} catch (error) {
				console.log('error = ', error);
			}
		} else if (action === 'edit') {
			router.push({
				pathname: "/updateGateway",
				params: { type: 'edit', data: JSON.stringify(item) }
			})
		}
	}

	return (
		<>
			<Header title="Gateways" />
			<View style={styles.container}>
				<SearchBar placeholder="Search..." value={searchText} onChangeText={setSearchText} />
				<FlatList
					data={gateways}
					keyExtractor={(item, index) => index.toString()}
					renderItem={({ item, index }: any) => {
						const isExpanded = expandedId === index;
						return (
							<Pressable key={index} style={[styles.card, isExpanded && styles.expandedCard]}
								onPress={() => setExpandedId(isExpanded ? null : index)}>
								<View style={styles.cardHeader}>
									<View>
										<Text style={styles.label}>Gateway Mac ID</Text>
										<Text style={styles.value}>{item.gateway_mac_id}</Text>
									</View>
									<ArrowDown />
								</View>

								{isExpanded && (
									<View style={styles.expandedSection}>
										<Pressable style={styles.actionButton} onPress={() => gatewayAction('edit', item)}>
											<Text style={styles.actionText}>Edit Sensor</Text>
										</Pressable>
										<Pressable style={styles.actionButton} onPress={() => gatewayAction('delete', item)}>
											<Text style={styles.actionText}>Delete Sensor</Text>
										</Pressable>
									</View>
								)}
							</Pressable>
						);
					}}
					contentContainerStyle={styles.listContainer}
					showsVerticalScrollIndicator={false}
					refreshing={refreshing}
					onRefresh={handleRefresh}
				/>

				<CreateFAB label="New Gateway" onPress={() => router.push({
					pathname: "/updateGateway",
					params: { type: 'add' }
				})} />
			</View>
		</>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingVertical: 20,
		backgroundColor: '#F5F7FA'
	},
	listContainer: {
		paddingVertical: 10,
		paddingHorizontal: 20,
		gap: 10
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
	expandedCard: {
		backgroundColor: "#F8F5FF",
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
	value: {
		fontSize: 10,
		fontFamily: Fonts.regular,
		color: "#000000A0",
	},
	expandedSection: {
		marginTop: 12,
		gap: 10,
		flexDirection: 'row'
	},
	actionButton: {
		backgroundColor: "#742BDE",
		paddingVertical: 6,
		paddingHorizontal: 14,
		borderRadius: 6,
		alignSelf: "flex-start",
	},
	actionText: {
		color: "#fff",
		fontSize: 10,
		fontFamily: Fonts.regular,
	},
	newGatewayButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#742BDE",
		borderRadius: 24,
		position: "absolute",
		alignSelf: "flex-end",
		width: 160,
		height: 40,
		gap: 8,
		right: 20,
		shadowColor: "#742BDE",
		shadowOpacity: 0.3,
		shadowOffset: { width: 0, height: 2 },
		shadowRadius: 4,
		elevation: 4,
	},
	newGatewayText: {
		color: "#fff",
		fontSize: 12,
		fontFamily: Fonts.semiBold,
		lineHeight: 16
	},
});
