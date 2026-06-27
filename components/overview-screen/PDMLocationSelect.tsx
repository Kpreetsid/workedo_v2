import { useEffect, useState } from "react";
import { View, StyleSheet, Pressable, Text } from "react-native";
import { assetHealthKPIHistory, locationTree } from "@/src/services/location.service";
import { useOverviewStore } from "@/src/store/useOverviewStore";
import Fonts from "@/constants/Typography";
import { assetTreeForSingleLocation } from "@/src/services/asset.service";
import LocationPickerPDM from "./LocationPickerPDM";
import { useAuthStore } from "@/src/store/useAuthStore";
import AssetPickerPDM from "./AssetPickerPDM";
import { type LocationAsset } from "@/src/types/locationAsset";
import { type Location } from "@/src/types/location";

type AssetNode = LocationAsset & {
	childs?: AssetNode[];
};

type LocationNode = Pick<Location, "id" | "location_name"> & {
	childs?: LocationNode[];
};

const collectParentAssetIds = (assets: AssetNode[]) =>
	assets.map((asset) => asset.id).filter(Boolean);

const countAssetNodes = (assets: AssetNode[]): number =>
	assets.reduce((total, asset) => {
		const childCount = asset.childs?.length ? countAssetNodes(asset.childs) : 0;
		return total + 1 + childCount;
	}, 0);

const collectLocationIds = (node: LocationNode): string[] => {
	const childIds = node.childs?.flatMap((child) => collectLocationIds(child)) ?? [];
	return [node.id, ...childIds];
};

const collectSelectedLocationIds = (selectedIds: string[], locations: LocationNode[]) => {
	const selectedSet = new Set(selectedIds);
	const collectedIds = new Set<string>();

	const visit = (node: LocationNode, ancestorSelected = false) => {
		const isSelected = ancestorSelected || selectedSet.has(node.id);

		if (isSelected) {
			collectedIds.add(node.id);
		}

		node.childs?.forEach((child) => visit(child, isSelected));
	};

	locations.forEach((node) => visit(node));

	return Array.from(collectedIds);
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

export default function PDMDashboardLocationSelect() {
	console.log('pdm location')
	const [open, setOpen] = useState(false);
	const [assetOpen, setAssetOpen] = useState(false);
	const [locations, setLocations] = useState<LocationNode[]>([]);
	const parentLocations = useOverviewStore((state) => state.parentLocations);

	const user = useAuthStore(s => s.user);
	const childAssets = useOverviewStore(s => s.childAssets);
	const selectedAssets = useOverviewStore((state) => state.selectedAssets);
	const assetKPIHistory = useOverviewStore(s => s.assetKPIHistory);
	const setParentLocations = useOverviewStore((state) => state.setParentLocations);
	const setChildAssets = useOverviewStore((state) => state.setChildAssets);
	const setSelectedAssets = useOverviewStore((state) => state.setSelectedAssets);
	const setAssetKPIHistory = useOverviewStore((state) => state.setAssetKPIHistory);

	useEffect(() => {
		// fetchLocations();
		fetchLocationsTree();
	}, []);

	const fetchLocationsTree = async () => {
		const res = await locationTree();
		console.log('res locations PDM = ', res?.data);
		if (res?.data?.length > 0) {
			setLocations(res.data as LocationNode[]);
		}
		const hasSelectedLocation = useOverviewStore.getState().parentLocations.length > 0;
		if (res?.data?.length > 0 && !hasSelectedLocation) {
			setParentLocations([{ id: res?.data[0].id, location_name: res?.data[0].location_name }])
		}
	}

	useEffect(() => {
		if (parentLocations?.length > 0) {
			console.log('location selected for PDM = ', parentLocations)
			fetchAssetsForLocation()
		}
	}, [parentLocations, locations])

	const fetchAssetsForLocation = async () => {
		try {
			const selectedLocationIds = parentLocations?.map((location) => location.id) ?? [];
			const expandedLocationIds = locations.length
				? collectSelectedLocationIds(selectedLocationIds, locations)
				: selectedLocationIds;
			const locationIds = expandedLocationIds.join(',');
			if (!locationIds) {
				setChildAssets([]);
				setSelectedAssets([]);
				setAssetKPIHistory(null);
				return;
			}

			const res = await assetTreeForSingleLocation(locationIds)
			console.log('res assets for location = ', res?.data, 'locationIds = ', locationIds)
			const fetchedAssets = (res?.data ?? []) as AssetNode[];
			setChildAssets(fetchedAssets);
			setSelectedAssets(collectParentAssetIds(fetchedAssets));
			if (fetchedAssets.length === 0) {
				setAssetKPIHistory(null);
			}
		} catch (e: any) {
			console.log('error assets for location = ', e)
			setChildAssets([]);
			setSelectedAssets([]);
			setAssetKPIHistory(null);
		}
	}

	// When child assets are ready, fetch KPI data
	useEffect(() => {
		if (!selectedAssets.length) {
			if (assetKPIHistory !== null) {
				setAssetKPIHistory(null);
			}
			return;
		}
		fetchAssetHealthKPIHistory();
	}, [selectedAssets, user?.account_id]);

	const fetchAssetHealthKPIHistory = async () => {
		const payload = {
			org_id: user?.account_id,
			electric_asset: [],
			non_electric_asset: [],
			top_level_asset: selectedAssets,
		};
		console.log('payload = ', payload);
		try {
			const res = await assetHealthKPIHistory(payload);
			console.log('res = available = ', res)
			if (res.data) {
				setAssetKPIHistory(res.data);
				return;
			}
		} catch (e) {
			console.log('res = error = ', e);
		}

		// Clear stale KPI history when API returns no data / failure
		if (assetKPIHistory !== null) {
			setAssetKPIHistory(null);
		}
	};


	const selectedLocationCount = locations.length
		? countSelectedLocations(parentLocations.map((location) => location.id), locations)
		: parentLocations.length;
	const kpiAssetCount = assetKPIHistory
		? (assetKPIHistory.top_level_asset.Alert || 0)
		+ (assetKPIHistory.top_level_asset.Critical || 0)
		+ (assetKPIHistory.top_level_asset.Danger || 0)
		+ (assetKPIHistory.top_level_asset.Healthy || 0)
		+ (assetKPIHistory.top_level_asset["Not Defined"] || 0)
		: null;
	const selectedAssetCount = kpiAssetCount ?? (childAssets.length ? countAssetNodes(childAssets as AssetNode[]) : selectedAssets.length);

	return (
		<>
			<View style={styles.container}>
				<View style={styles.selectorWrapper}>
					<Pressable style={styles.field} onPress={() => setOpen((prev) => !prev)}>
						<Text style={styles.fieldLabel}>Location</Text>
					</Pressable>
					<View style={styles.countBadge}>
						<Text style={styles.countText}>{selectedLocationCount}</Text>
					</View>
				</View>


				{
					// open && data?.mode != 'child' && <LocationSelector />
					open &&
					<LocationPickerPDM
						visible={open}
						onClose={() => setOpen(false)}
					/>
				}

				<View style={styles.selectorWrapper}>
					<Pressable style={styles.field} onPress={() => setAssetOpen((prev) => !prev)}>
						<Text style={styles.fieldLabel}>Asset</Text>
					</Pressable>
					<View style={styles.countBadge}>
						<Text style={styles.countText}>{selectedAssetCount}</Text>
					</View>
				</View>


				{
					// open && data?.mode != 'child' && <LocationSelector />
					assetOpen &&
					<AssetPickerPDM
						visible={assetOpen}
						onClose={() => setAssetOpen(false)}
					/>
				}

			</View>
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
	overlay: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		zIndex: 99,
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
});
