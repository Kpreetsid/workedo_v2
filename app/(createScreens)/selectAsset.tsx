import Header from "@/components/global/Header";
import { Dimensions, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import ActionButton from "@/components/create-screens/ActionButton";
import { router, useLocalSearchParams } from "expo-router";
import Fonts from "@/constants/Typography";
import { ArrowRight, MapIcon } from "@/constants/IconProvider";
import { useEffect, useState } from "react";
import SearchBar from "@/components/global/SearchBar";
import { locationTree } from "@/src/services/location.service";
import { useAuthStore } from "@/src/store/useAuthStore";
import { Location } from "@/src/types/location";
import { useLocationStore } from "@/src/store/useLocationStore";
import { usePreventiveStore } from "@/src/store/usePreventiveStore";
import { getFilteredAssets } from "@/src/services/preventive.service";
import { Asset } from "@/src/types/asset";
import { useWorkOrderStore } from "@/src/store/useWorkOrderStore";
import { useWorkRequestStore } from "@/src/store/useWorkRequestStore";

interface AssetInterface {
	showHeader?: boolean,
	selection?: boolean
}

const width = Dimensions.get("window").width;
export default function SelectAsset({ showHeader = true, selection = true }: AssetInterface) {
	const params: any = useLocalSearchParams();
	const comingFrom = params?.comingFrom;
	const [selectedAsset, setSelectedAsset] = useState<Asset>();
	const [searchText, setSearchText] = useState("");
	const user = useAuthStore((state) => state.user);
	const [assets, setAssets] = useState<Asset[]>([]);
	const [refreshing, setRefreshing] = useState(false);
	const { formData, setFormValue } = usePreventiveStore();
	const { setWorkForm } = useWorkOrderStore();
	const { setWorkRequestForm } = useWorkRequestStore();

	useEffect(() => {
		fetchAssets();
	}, []);

	const fetchAssets = async () => {
		try {
			const payload = {
				"locationList": [
					formData.location?.id || formData.location?._id
				]
			}
			const res = await getFilteredAssets(payload);

			if (res.status) {
				console.log('res assets = ', res?.data);
				setAssets(res?.data);
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
			{showHeader && <Header title="Select Asset" />}
			<View style={{ flex: 1 }}>

				<FlatList
					data={assets}
					keyExtractor={(_, index) => index.toString()}
					renderItem={({ item }) => (
						<Pressable style={[styles.locationButton, { backgroundColor: selectedAsset === item ? "#FFBF0080" : "#fff", borderColor: selectedAsset === item ? "#FFC1074D" : "#99999933" }]}
							onPress={() => {
								if (selection) {
									setSelectedAsset(item);
									// updating selected asset in zustand store while creating preventive
									if (comingFrom === "newWorkOrder") {
										setWorkForm("selected_asset", item);
									} else if (comingFrom === "newWorkRequest") {
										setWorkRequestForm("selected_asset", item);
									} else {
										setFormValue("selected_asset", item);
									}
									router.back();
								}
							}}
						>
							<View style={styles.textRow}>
								<Text style={styles.locationText}>{item.asset_name}</Text>
								<ArrowRight color={"#201F23CC"} />
							</View>
							<MapIcon />
						</Pressable>)}
					contentContainerStyle={styles.container}
					refreshing={refreshing}
					onRefresh={handleRefresh}
				/>

				{selection && <ActionButton onPress={() => router.back()} label="Confirm Asset" buttonStyle={styles.actionButton} />}
			</View>
		</>
	)
}

const styles = StyleSheet.create({
	searchContainer: {
		backgroundColor: "#fff",
		borderRadius: 8,
		alignItems: "center",
		flexDirection: "row",
		paddingHorizontal: 20,
		marginHorizontal: 20,
		marginVertical: 10,
		gap: 10
	},
	input: {
		fontSize: 12,
		fontFamily: Fonts.regular
	},
	container: {
		flexGrow: 1,
		backgroundColor: "#F5F7FA",
		paddingHorizontal: 25,
		paddingTop: 15,
		paddingBottom: 105,
		gap: 10
	},
	locationButton: {
		borderWidth: 0.6,
		borderRadius: 7,
		height: 50,
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
	locationText: {
		fontSize: 10,
		fontFamily: Fonts.semiBold,
		color: "#201F23",
		lineHeight: 20
	},
	actionButton: {
		position: "absolute",
		bottom: 20,
		alignSelf: "center",
		width: width - 50
	}
})
