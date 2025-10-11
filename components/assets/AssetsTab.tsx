import { Dimensions, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import SearchBar from "@/components/global/SearchBar";
import { useEffect, useState } from "react";
import { MapIcon } from "@/constants/IconProvider";
import Fonts from "@/constants/Typography";
import ActionButton from "@/components/create-screens/ActionButton";
import { router } from "expo-router";
import { assetTree } from "@/src/services/asset.service";
import { useAuthStore } from "@/src/store/useAuthStore";
import { Asset } from "@/src/types/asset";

const width = Dimensions.get("window").width;

// const mockAssets = [
// 	{ id: "1", name: "Primary Booth ASU V-11", location: "Grasim Nagda Plant" },
// 	{ id: "2", name: "Die Casting Motor 560 ton-8", location: "Plant Zone A" },
// 	{ id: "3", name: "Mixture Machine", location: "Workshop 3" },
// 	{ id: "4", name: "Cooling Tower Motor", location: "Plant Zone B" },
// 	{ id: "5", name: "Hydraulic Pump V-9", location: "Unit 7" },
// 	{ id: "6", name: "Die Casting Motor 560 ton-9", location: "Plant Zone A" },
// ];
interface AssetsTabInterface {
	selection?: boolean
}

export default function AssetsTab({ selection = true }: AssetsTabInterface) {
	const [searchText, setSearchText] = useState("");
	const [selectedAsset, setSelectedAsset] = useState<string | null>(null);

	const { user } = useAuthStore();
	const [assets, setAssets] = useState<Asset[]>([]);
	const [refreshing, setRefreshing] = useState(false);

	const filteredAssets = assets.filter((asset) => asset.asset_name.toLowerCase().includes(searchText.toLowerCase()) || asset?.locationData?.location_name?.toLowerCase().includes(searchText.toLowerCase()));

	useEffect(() => {
		fetchAssets();
	}, []);

	const fetchAssets = async () => {
		try {
			const res = await assetTree();

			if (res.status) {
				console.log('res assets = ', res?.data);
				setAssets(res.data as Asset[]);
			}
		} catch (err: any) {
			console.error("Login failed:", err);
		}
	};

	const handleRefresh = async () => {
		setRefreshing(true);
		await fetchAssets();
		setRefreshing(false);
	};

	return (
		<>
			<SearchBar placeholder="Search Location..." value={searchText} onChangeText={setSearchText} />

			<FlatList
				data={filteredAssets}
				keyExtractor={(item) => item.id}
				renderItem={({ item }: { item: Asset }) => (
					<Pressable key={item.id} style={[styles.assetButton,
					{ backgroundColor: selectedAsset === item.id ? "#FFBF0080" : "#fff", borderColor: selectedAsset === item.id ? "#FFC1074D" : "#99999933" }]}
						onLongPress={() => setSelectedAsset(item.id)} onPress={() => {
							router.push({
								pathname: "/assetDetail",
								params: { data: JSON.stringify(item) },
							})
						}}>
						<View style={styles.textRow}>
							<View>
								<Text style={styles.assetText}>{item.asset_name}</Text>
								<Text style={styles.assetLocations}>Location: {item?.locationData?.location_name}</Text>
							</View>
						</View>
						<MapIcon />
					</Pressable>
				)}
				contentContainerStyle={styles.listContainer}
				refreshing={refreshing}
				onRefresh={handleRefresh}
			/>

			{selection && <ActionButton onPress={() => console.info("Confirm Pressed")} label="Confirm Location" buttonStyle={styles.actionButton} />}
		</>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	listContainer: {
		flexGrow: 1,
		paddingHorizontal: 20,
		gap: 10,
		marginTop: 5
	},
	assetButton: {
		borderWidth: 0.6,
		borderRadius: 7,
		height: 60,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 20,
	},
	textRow: {
		flexDirection: "row",
		gap: 5,
		alignItems: "center",
	},
	assetText: {
		fontSize: 12,
		fontFamily: Fonts.semiBold,
		color: "#201F23",
	},
	assetLocations: {
		fontFamily: Fonts.regular,
		fontSize: 10,
		color: "#000",
	},
	actionButton: {
		position: "absolute",
		bottom: 0,
		alignSelf: "center",
		width: width - 50,
	},
});
