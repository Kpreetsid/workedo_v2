import { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Fonts from "@/constants/Typography";
import { locationTree } from "@/src/services/location.service";
import { assetTreeForSingleLocation } from "@/src/services/asset.service";
import { useCMMSStore } from "@/src/store/useCMMSStore";
import { useDateRangeStore } from "@/src/store/useDateRangeStore";
import { type LocationAsset } from "@/src/types/locationAsset";
import { type Location } from "@/src/types/location";
import DateRangeCalendar from "./DateRangeCalendar";
import LocationPickerCMMS from "./LocationPickerCMMS";
import AssetPickerCMMS from "./AssetPickerCMMS";

type LocationNode = Pick<Location, "id" | "location_name"> & {
	childs?: LocationNode[];
};

const collectParentAssetIds = (assets: LocationAsset[]) =>
	assets.map((asset) => asset.id).filter((id): id is string => Boolean(id));

const countAssetNodes = (assets: LocationAsset[]): number =>
	assets.reduce((total, asset) => {
		const childCount = asset.childs?.length ? countAssetNodes(asset.childs as LocationAsset[]) : 0;
		return total + 1 + childCount;
	}, 0);

const collectLocationIds = (node: LocationNode): string[] => {
	const childIds = node.childs?.flatMap((child) => collectLocationIds(child)) ?? [];
	return [node.id, ...childIds];
};

const countSelectedLocations = (selectedIds: string[], locations: LocationNode[]) => {
	const selectedSet = new Set(selectedIds);
	const countedIds = new Set<string>();

	const visit = (node: LocationNode) => {
		if (selectedSet.has(node.id)) {
			collectLocationIds(node).forEach((id) => countedIds.add(id));
			return;
		}

		node.childs?.forEach(visit);
	};

	locations.forEach(visit);
	return countedIds.size;
};

export default function CMMSDashboardLocationSelect() {
	const [locationOpen, setLocationOpen] = useState(false);
	const [assetOpen, setAssetOpen] = useState(false);
	const [showCalendar, setShowCalendar] = useState(false);
	const [locations, setLocations] = useState<LocationNode[]>([]);

	const parentLocations = useCMMSStore((state) => state.parentLocations);
	const childAssets = useCMMSStore((state) => state.childAssets);
	const selectedAssets = useCMMSStore((state) => state.selectedAssets);
	const setParentLocations = useCMMSStore((state) => state.setParentLocations);
	const setChildAssets = useCMMSStore((state) => state.setChildAssets);
	const setSelectedAssets = useCMMSStore((state) => state.setSelectedAssets);

	const { startDate, endDate } = useDateRangeStore();

	useEffect(() => {
		fetchLocationsTree();
	}, []);

	const fetchLocationsTree = async () => {
		const res = await locationTree();
		if (res?.data?.length > 0) {
			setLocations(res.data as LocationNode[]);
		}
		const hasSelectedLocation = useCMMSStore.getState().parentLocations.length > 0;
		if (res?.data?.length > 0 && !hasSelectedLocation) {
			setParentLocations([{ id: res.data[0].id, location_name: res.data[0].location_name }]);
		}
	};

	useEffect(() => {
		if (!parentLocations.length) return;
		fetchAssetsForLocation();
	}, [parentLocations]);

	const fetchAssetsForLocation = async () => {
		try {
			const locationIds = parentLocations.map((location) => location.id).join(",");
			if (!locationIds) {
				setChildAssets([]);
				setSelectedAssets([]);
				return;
			}

			const res = await assetTreeForSingleLocation(locationIds);
			console.log("res assets for location = ", res);
			if (res.status) {
				const fetchedAssets = (res?.data ?? []) as LocationAsset[];
				setChildAssets(fetchedAssets);
				setSelectedAssets(collectParentAssetIds(fetchedAssets));
				return;
			}

			setChildAssets([]);
			setSelectedAssets([]);
		} catch (e: any) {
			console.log("error assets for location = ", e);
			setChildAssets([]);
			setSelectedAssets([]);
		}
	};

	const selectedLocationCount = locations.length
		? countSelectedLocations(parentLocations.map((location) => location.id), locations)
		: parentLocations.length;
	const selectedAssetCount = childAssets.length ? countAssetNodes(childAssets as LocationAsset[]) : selectedAssets.length;

	return (
		<>
			<View style={styles.container}>
				<View style={styles.selectorWrapper}>
					<Pressable style={styles.field} onPress={() => setLocationOpen((prev) => !prev)}>
						<Text style={styles.fieldLabel}>Location</Text>
					</Pressable>
					<View style={styles.countBadge}>
						<Text style={styles.countText}>{selectedLocationCount}</Text>
					</View>
				</View>

				<View style={styles.selectorWrapper}>
					<Pressable style={styles.field} onPress={() => setAssetOpen((prev) => !prev)}>
						<Text style={styles.fieldLabel}>Asset</Text>
					</Pressable>
					<View style={styles.countBadge}>
						<Text style={styles.countText}>{selectedAssetCount}</Text>
					</View>
				</View>

				<Pressable style={styles.iconView} onPress={() => setShowCalendar(true)}>
					<Ionicons color={"#777"} name="calendar" size={20} />
				</Pressable>
			</View>

			{locationOpen && (
				<LocationPickerCMMS visible={locationOpen} onClose={() => setLocationOpen(false)} />
			)}

			{assetOpen && <AssetPickerCMMS visible={assetOpen} onClose={() => setAssetOpen(false)} />}

			<Modal visible={showCalendar} transparent animationType="slide">
				<Pressable style={styles.overlayCal} onPress={() => setShowCalendar(false)} />
				<View style={styles.sheet}>
					<DateRangeCalendar
						onClose={() => setShowCalendar(false)}
						initialStartDate={startDate}
						initialEndDate={endDate}
					/>
				</View>
			</Modal>
		</>
	);
}

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		paddingTop: 20,
		paddingHorizontal: 12,
		alignItems: "center",
		gap: 14,
	},
	selectorWrapper: {
		position: "relative",
	},
	field: {
		backgroundColor: "#FFFFFF",
		borderRadius: 8,
		paddingHorizontal: 18,
		borderWidth: 1,
		borderColor: "#E1E8EE",
		alignItems: "center",
		justifyContent: "center",
		height: 40,
		minWidth: 130,
	},
	fieldLabel: {
		fontSize: 14,
		color: "#8B8B8B",
		fontFamily: Fonts.regular,
	},
	countBadge: {
		position: "absolute",
		top: -10,
		right: -10,
		minWidth: 22,
		height: 22,
		paddingHorizontal: 6,
		borderRadius: 11,
		backgroundColor: "#742BDE",
		alignItems: "center",
		justifyContent: "center",
		borderWidth: 2,
		borderColor: "#fff",
	},
	countText: {
		color: "#fff",
		fontSize: 12,
		fontFamily: Fonts.semiBold,
	},
	iconView: {
		position: "absolute",
		right: 20,
		top: 25,
		alignItems: "center",
		justifyContent: "center",
	},
	overlayCal: {
		flex: 1,
		justifyContent: "flex-end",
		backgroundColor: "rgba(0,0,0,0.4)",
	},
	sheet: {
		height: "70%",
		backgroundColor: "#fff",
		borderTopLeftRadius: 16,
		borderTopRightRadius: 16,
	},
});
