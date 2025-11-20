import { Dimensions, FlatList, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import SearchBar from "@/components/global/SearchBar";
import { useCallback, useState } from "react";
import { MapIcon } from "@/constants/IconProvider";
import Fonts from "@/constants/Typography";
import ActionButton from "@/components/create-screens/ActionButton";
import { router, useFocusEffect } from "expo-router";
import { assetTree } from "@/src/services/asset.service";
import { useAuthStore } from "@/src/store/useAuthStore";
import { Asset } from "@/src/types/asset";
import AssetsCard from "./AssetsCard";
import { FlashList } from "@shopify/flash-list";

const width = Dimensions.get("window").width;

interface AssetsTabInterface {
	selection?: boolean
}

export default function AssetsTab({ selection = true }: AssetsTabInterface) {
	console.log('rendering assets');
	const [searchText, setSearchText] = useState("");
	const [selectedAsset, setSelectedAsset] = useState<string | null>(null);

	const { user } = useAuthStore();
	const [assets, setAssets] = useState<Asset[]>([]);
	const [refreshing, setRefreshing] = useState(false);

	const filteredAssets = assets.filter((asset) => asset.asset_name.toLowerCase().includes(searchText.toLowerCase()) || asset?.locationData?.location_name?.toLowerCase().includes(searchText.toLowerCase()));

	useFocusEffect(
		useCallback(() => {
			fetchAssets();
		}, [])
	);

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
			<FlashList
				ListHeaderComponent={() => {
					return (
						<>
							<SearchBar placeholder="Search Location..." value={searchText} onChangeText={setSearchText} />
							<TouchableOpacity style={styles.buttonContainer} onPress={() => router.push("/createAsset")}>
								<Text style={styles.buttonText}>Create Asset</Text>
							</TouchableOpacity>
						</>
					);
				}}
				data={filteredAssets}
				keyExtractor={(item) => item.id}
				renderItem={({ item }: { item: Asset }) => <AssetsCard asset={item} />}
				contentContainerStyle={styles.listContainer}
				refreshing={refreshing}
				onRefresh={handleRefresh}
			/>



			{/* old code */}
			{/* <FlatList
				data={filteredAssets}
				keyExtractor={(item) => item.id}
				renderItem={({ item }: { item: Asset }) => {
					const isExpanded = expandedAssetId === item.id;
					const hasChildren = item.childs && item.childs.length > 0;

					return (
						<View key={item.id}>
							<Pressable
								style={[
									styles.assetButton,
									isExpanded ? {
										borderBottomLeftRadius: 0,
										borderBottomRightRadius: 0,
									} : {},
									{
										backgroundColor: selectedAsset === item.id ? "#FFBF0080" : "#fff",
										borderColor: selectedAsset === item.id ? "#FFC1074D" : "#99999933",
									},
								]}
								onLongPress={() => setSelectedAsset(item.id)}
								onPress={() => {
									router.push({
										pathname: "/assetDetail",
										params: { id: item.id },
										// params: { data: JSON.stringify(item) },
									});
								}}
							>
								<View style={styles.textRow}>
									<View>
										<Text style={styles.assetText}>{item.asset_name}</Text>
										<Text style={styles.assetLocations}>
											Location: {item?.locationData?.location_name}
										</Text>
										{hasChildren && (
											<Pressable onPress={() => {
												// Toggle expand instead of navigating
												setExpandedAssetId(isExpanded ? null : item.id);
											}}>
												<Text style={styles.childLabel}>
													Child Assets
													{isExpanded ? " ▲" : " ▼"}
												</Text>
											</Pressable>
										)}
									</View>
								</View>
								<MapIcon />
							</Pressable>

							{isExpanded && hasChildren && (
								<View style={styles.childContainer}>
									{item?.childs?.map((child) => (
										<Pressable
											key={child.id}
											style={styles.childButton}
											onPress={() =>
												router.push({
													pathname: "/assetDetail",
													params: { data: JSON.stringify(child) },
												})
											}
										>
											<Text style={styles.childText}>{child.asset_name}</Text>
										</Pressable>
									))}
								</View>
							)}
						</View>
					);
				}}
				contentContainerStyle={styles.listContainer}
				refreshing={refreshing}
				onRefresh={handleRefresh}
			/> */}


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
		// borderWidth: 0.6,
		borderRadius: 7,
		// height: 65,
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
	childContainer: {
		backgroundColor: "#fff",
		paddingLeft: 40,
		paddingBottom: 10,
		borderBottomLeftRadius: 7,
		borderBottomRightRadius: 7,
	},
	childButton: {
		paddingVertical: 5,
	},
	childText: {
		fontSize: 10,
		color: "#555",
		fontFamily: Fonts.regular,
	},
	childLabel: {
		marginTop: 3,
		fontSize: 10,
		color: "#201F23",
		fontFamily: Fonts.light,
	},

	/* Add Task Button */
	buttonContainer: {
		marginTop: 5,
		alignSelf: "flex-start",
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#742BDE",
		justifyContent: "center",
		gap: 5,
		paddingHorizontal: 12,
		paddingVertical: 5,
		borderRadius: 5,
		elevation: 5,
		shadowColor: "rgba(116, 43, 222, 0.80)",
		shadowOffset: { width: 2, height: 2 },
		shadowOpacity: 0.60,
		shadowRadius: 2,
	},
	buttonText: {
		fontSize: 10,
		fontFamily: Fonts.regular,
		color: "#FFFFFF",
		lineHeight: 20,
	},
});
