import { ActivityIndicator, Alert, Dimensions, FlatList, Pressable, StyleSheet, Text, ToastAndroid, TouchableOpacity, View } from "react-native";
import SearchBar from "@/components/global/SearchBar";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MapIcon } from "@/constants/IconProvider";
import Fonts from "@/constants/Typography";
import ActionButton from "@/components/create-screens/ActionButton";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { assetTree, copyAsset, deleteAsset } from "@/src/services/asset.service";
import { useAuthStore } from "@/src/store/useAuthStore";
import { Asset } from "@/src/types/asset";
import AssetsCard from "./AssetsCard";
import { FlashList } from "@shopify/flash-list";
import { LocationAsset } from "@/src/types/locationAsset";
import { assetsHealthLocation } from "@/src/services/location.service";
import { useOverviewStore } from "@/src/store/useOverviewStore";
import CreateFAB from "../global/CreateFAB";

const width = Dimensions.get("window").width;

interface AssetsTabInterface {
	selection?: boolean
}

export default function AssetsTab({
	selection = true,
}: AssetsTabInterface) {
	const [loading, setLoading] = useState(true);
	const [listHydrating, setListHydrating] = useState(false);
	let { comingFrom, card_id } = useLocalSearchParams();
	console.log('rendering assets = ', comingFrom, card_id);

	const [ignoreFilter, setIgnoreFilter] = useState(true);
	const [cardId, setCardId] = useState<number | null>(null);

	const childAssets = useOverviewStore((state) => state.childAssets);
	const [searchText, setSearchText] = useState("");
	const [selectedAsset, setSelectedAsset] = useState<string | null>(null);

	const { user } = useAuthStore();
	const [assets, setAssets] = useState<Asset[]>([]);
	const [refreshing, setRefreshing] = useState(false);

	const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);

	const flattenAssets = (list: Asset[]) => {
		const out: Asset[] = [];
		const walk = (items: Asset[]) => {
			items.forEach((i: any) => {
				out.push(i);
				if (i.childs && i.childs.length) walk(i.childs);
			});
		};
		walk(list || []);
		return out;
	};

	const flatAssets = useMemo(() => flattenAssets(filteredAssets), [filteredAssets]);
	const searchedFilteredAssets = useMemo(() => {
		const q = (searchText || "").trim().toLowerCase();
		if (!q) return flatAssets;
		return flatAssets.filter(l => (l.asset_name || "").toLowerCase().includes(q));
	}, [searchText, flatAssets]);

	// const filteredAssets = assets.filter(
	// 	(asset) => {
	// 		return (
	// 			asset.asset_name.toLowerCase().includes(searchText.toLowerCase()) ||
	// 			asset?.locationData?.location_name?.toLowerCase().includes(searchText.toLowerCase())
	// 		);
	// 	}
	// );

	useFocusEffect(
		useCallback(() => {
			console.log('if card id recevied or not. = ', cardId)

			// if card id received
			if (cardId) {
				fetchAssets();
			} else {
				// if card id doesn't receive
				fetchAssets();
			}
			return () => {
				console.log('assets blurred')
				setSearchText("");
				// setIgnoreFilter(true)
			}
		}, [])
	);

	useEffect(() => {
		if (card_id) {
			setCardId(Number(card_id));
		} else {
			setCardId(null);
		}
	}, [card_id])

	useEffect(() => {
		if (!assets.length) {
			setListHydrating(false);
			setFilteredAssets([]);
			return;
		}

		// If coming from overview and filter is NOT ignored → run sorting
		if (cardId) {
			console.log('yes if')
			sortFiltered(assets);
			return;
		}

		// If NOT coming from overview → show all assets
		if (!cardId) {
			console.log('no if')
			console.log('card id is undefined = ', cardId);
			fetchAssetsHealthLocation(assets)
		}
	}, [assets, childAssets, cardId]);

	const fetchAssets = async () => {
		setLoading(true);
		try {
			const res = await assetTree();
			const incoming = Array.isArray(res?.data) ? (res.data as Asset[]) : [];

			if (res?.message === "No data found" || !res?.status || incoming.length === 0) {
				setListHydrating(false);
				setAssets([]);
				return;
			}

			console.log('res assets = ', res?.data);
			setListHydrating(true);
			setAssets(incoming);
		} catch (err: any) {
			if (err?.message === "No data found") {
				setListHydrating(false);
				setAssets([]);
				return;
			}

			console.error("Login failed:", err);
			setListHydrating(false);
			setAssets([]);
		} finally {
			setLoading(false);
		}
	};

	const sortFiltered = (assets: Asset[]) => {
		if (assets.length > 0 && childAssets.length > 0) {

			console.log('assets = ', assets)
			console.log('childAssets = ', childAssets)

			const filteredAssets1 = assets.filter((asset) => {
				return childAssets.some((childAsset) => childAsset.id === asset.id && childAsset.top_level === true)
			})
			console.log('filteredAssets1 = ', filteredAssets1)
			// now filter based on asset status
			fetchAssetsHealthLocation(filteredAssets1);
		} else {
			setListHydrating(false);
			setFilteredAssets([]);
		}
	}

	const fetchAssetsHealthLocation = async (filtered: Asset[]) => {
		setListHydrating(true);

		const obj: { org_id: string, asset_list: string[] } = {
			org_id: user?.account_id,
			asset_list: filtered?.map((asset: Asset) => asset.id),
		};

		console.log("obj = ", obj);
		try {
			const resp = await assetsHealthLocation(obj);
			const healthData = Array.isArray(resp?.data) ? resp.data : [];
			console.log("resp health location = ", resp, card_id);
			if (cardId) {
				if (card_id === "1") {
					console.log("inside if card_id 1");

					const enriched = filtered.map((asset: Asset) => {
						const statusObj = healthData.find(
							(item: any) => item.asset_id === asset.id
						);

						return {
							...asset,
							asset_status: statusObj?.asset_status || "Not Defined",
						};
					});

					setFilteredAssets(enriched);
				} else if (card_id === '2') {
					console.log('inside if card_id 2')
					const dangerAssetMap = new Map(
						healthData
							.filter((asset: any) => asset?.asset_status === "Danger")
							.map((asset: any) => [asset.asset_id, asset])
					);

					const enrichedDangerAssets = filtered
						.filter((asset: Asset) => dangerAssetMap.has(asset.id))
						.map((asset: Asset) => ({
							...asset,
							asset_status: dangerAssetMap.get(asset.id)?.asset_status || "Danger",
						}));

					setFilteredAssets(enrichedDangerAssets);
				} else if (card_id === '3') {
					console.log('inside if card_id 3');
					const criticalAssetMap = new Map(
						healthData
							.filter((asset: any) => asset?.asset_status === "Critical")
							.map((asset: any) => [asset.asset_id, asset])
					);

					const enrichedCriticalAssets = filtered
						.filter((asset: Asset) => criticalAssetMap.has(asset.id))
						.map((asset: Asset) => ({
							...asset,
							asset_status: criticalAssetMap.get(asset.id)?.asset_status || "Critical",
						}));

					setFilteredAssets(enrichedCriticalAssets);

				}
			} else {
				console.log("inside else");
				const enriched = filtered.map((asset: Asset) => {
					const statusObj = healthData.find(
						(item: any) => item.asset_id === asset.id
					);

					return {
						...asset,
						asset_status: statusObj?.asset_status || "Not Defined",
					};
				});
				console.log("enriched = ", enriched);
				setFilteredAssets(enriched);
			}
		} catch (error) {
			console.log("error fetching asset health location = ", error);
			setFilteredAssets(filtered);
		} finally {
			setListHydrating(false);
		}
	}

	const handleRefresh = async () => {
		setRefreshing(true);
		await fetchAssets();
		setRefreshing(false);
	};

	const handleCopyAsset = async (item: Asset) => {
		console.log('copying asset = ', item);
		Alert.alert(
			"Copy Asset",
			`Are you sure you want to copy ${item.asset_name}?`,
			[
				{
					text: "Cancel",
					style: "cancel",
				},
				{
					text: "Confirm",
					style: "destructive",
					onPress: async () => {
						try {
							const resp = await copyAsset(item.id);
							if (resp?.status) {
								ToastAndroid.show("Asset Copied", ToastAndroid.SHORT);
								fetchAssets();
							}
						} catch (e) {
							console.log("error deleting = ", e);
						}
					},
				},
			],
			{ cancelable: true }
		);
	}

	const handleDeleteAsset = (item: Asset) => {
		Alert.alert(
			"Delete Asset",
			`Are you sure you want to delete ${item.asset_name}?`,
			[
				{
					text: "Cancel",
					style: "cancel",
				},
				{
					text: "Delete",
					style: "destructive",
					onPress: async () => {
						try {
							const resp = await deleteAsset(item.id);
							if (resp?.status) {
								ToastAndroid.show("Asset Deleted", ToastAndroid.SHORT);
								fetchAssets();
							}
						} catch (e) {
							console.log("error deleting = ", e);
						}
					},
				},
			],
			{ cancelable: true }
		);
	};

	const clearFilters = async () => {
		setCardId(null);  // 🔥 disable overview filtering
		await fetchAssets();    // 🔥 reload normally
	};

	useEffect(() => {
		console.log('filteredAssets final = ', filteredAssets)
	}, [filteredAssets])

	useEffect(() => {
		console.log('searchedFilteredAssets final = ', searchedFilteredAssets)
	}, [searchedFilteredAssets])

	return (
		<View style={styles.container}>
			{
				!selection && <SearchBar placeholder="Search Asset..." value={searchText} onChangeText={setSearchText} />
			}

			<FlashList
				style={styles.list}
				ListHeaderComponent={() => {
					return (
						<View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
							{

								// !selection && (
								// 	<TouchableOpacity style={styles.buttonContainer} onPress={() => router.push("/createAsset")}>
								// 		<Text style={styles.buttonText}>Create Asset</Text>
								// 	</TouchableOpacity>
								// )
							}

							{
								cardId && (
									<TouchableOpacity style={styles.clearFilters} onPress={clearFilters}>
										<Text style={styles.clearFiltersText}>Clear Filters</Text>
									</TouchableOpacity>
								)
							}

						</View>
					);
				}}
				data={searchText ? searchedFilteredAssets : filteredAssets}
				keyExtractor={(item) => item.id}
				renderItem={
					({ item }: { item: Asset }) => <AssetsCard
						asset={item}
						handleDeleteAsset={handleDeleteAsset}
						handleCopyAsset={handleCopyAsset}
					/>}
				contentContainerStyle={[
					styles.listContainer,
					(searchText ? searchedFilteredAssets : filteredAssets).length === 0 && styles.emptyListContainer,
				]}
				refreshing={refreshing}
				onRefresh={handleRefresh}
				ListEmptyComponent={
					<View style={styles.emptyState}>
						{loading || refreshing || listHydrating ? (
							<ActivityIndicator size={"large"} />
						) : (
							<Text style={styles.emptyText}>No Assets found!</Text>
						)}
					</View>
				}
			/>


			{selection && <ActionButton onPress={() => console.info("Confirm Pressed")} label="Confirm Location" buttonStyle={styles.actionButton} />}


			<CreateFAB label="Create Asset" onPress={() => router.push("/createAsset")} />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	list: {
		flex: 1,
	},
	listContainer: {
		flexGrow: 1,
		paddingHorizontal: 20,
		paddingBottom: 50,
		gap: 10,
		// marginTop: 5
	},
	emptyListContainer: {
		flexGrow: 1,
	},
	emptyState: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: 20,
	},
	emptyText: {
		fontSize: 14,
		color: "#000000",
		textAlign: "center",
		fontFamily: Fonts.regular,
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
	clearFilters: {
		marginTop: 5,
		backgroundColor: "transparent",
		borderRadius: 5,
		paddingHorizontal: 12,
		paddingVertical: 5,
		borderWidth: 1,
		borderColor: "#222",
	},
	clearFiltersText: {
		fontSize: 10,
		fontFamily: Fonts.regular,
		color: "#222",
		lineHeight: 20,
	},
});
