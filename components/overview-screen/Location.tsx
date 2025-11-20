import { useEffect, useState } from "react";
import { TouchableOpacity, View, StyleSheet, ToastAndroid } from "react-native";
import Dropdown from "@/components/overview-screen/DropDown";
import { assetHealthKPIHistory, childAssetsAgainstLocation, fetchKPIFilterLocations, fetchParentLocationDetails, locationTree } from "@/src/services/location.service";
import { AssetHealthSummary } from "@/src/types/assetHistory";
import { useOverviewStore } from "@/src/store/useOverviewStore";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useGlobalStore } from "@/src/store/useGlobal";

export default function Location() {
	const {
		parentLocations,
		childLocations,
		childAssets,
		parentSelectionId,
		childSelectionIds,

		setParentLocations,
		setChildLocations,
		setChildAssets,
		setParentSelectionId,
		setChildSelectionIds,
		setAssetKPIHistory,
	} = useOverviewStore();

	const { user } = useAuthStore();

	const setLocationsTree = useGlobalStore((state) => state.setLocationsTree);

	const [openDropdown, setOpenDropdown] = useState<string | null>(null);

	useEffect(() => {
		fetchLocations();
		fetchLocationsTree();
	}, []);

	const fetchLocationsTree = async () => {
		try {
			const res = await locationTree();

			if (res.status) {
				console.log('res locations = ', res?.data);
				setLocationsTree(res.data);
			}
		} catch (err: any) {
			console.error("Login failed:", err);
		}
	};

	// 🧩 Fetch all locations initially and select first parent
	const fetchLocations = async () => {
		const res = await fetchKPIFilterLocations();
		console.log('res kpi = ', res);
		if (res.status) {
			setParentLocations(res.data.levelOneLocations);

			const firstParent = res.data.levelOneLocations[0];
			if (firstParent) setParentSelectionId(firstParent.id); // triggers below effect
		}
	};

	// 🧠 When parent changes — fetch its child locations
	useEffect(() => {
		if (!parentSelectionId) return;

		const fetchChildsForParent = async () => {
			try {
				const childs = await fetchParentLocationDetails(parentSelectionId, "parent");
				console.log('childs = ', childs);

				// 🧠 CASE 1: API returns success but "status": false (no data found)
				if (!childs?.status || !Array.isArray(childs.data) || childs.data.length === 0) {
					handleNoChildData();
					return;
				}

				// 🧠 CASE 2: We have valid data
				setChildLocations(childs.data);

				// Select ALL child IDs by default
				const allChildIds = childs.data.map((child: any) => child.id);
				setChildSelectionIds(allChildIds);

				// Fetch assets for selected children
				fetchChildAssets(parentSelectionId ?? undefined, allChildIds);

			} catch (error: any) {
				console.error("fetchParentLocationDetails failed:", error);
				if (!error.status) {
					ToastAndroid.show("No Data Found", ToastAndroid.SHORT);
					// Select ALL child IDs by default
					const allChildIds: string[] = []
					setChildSelectionIds(allChildIds);

					// Fetch assets for selected children
					fetchChildAssets(parentSelectionId ?? undefined, allChildIds);
				}
				// handleNoChildData();
			}
		};

		fetchChildsForParent();
	}, [parentSelectionId]);

	const handleNoChildData = () => {
		setChildLocations([]);
		setChildSelectionIds([]);
		setChildAssets([]);
		setAssetKPIHistory(null);

		ToastAndroid.show("No Data Found", ToastAndroid.SHORT);
	};

	// 🧠 When child selections change (user toggles checkboxes)
	useEffect(() => {
		if (!childSelectionIds.length) {
			setChildAssets([]);
			setAssetKPIHistory(null);
			return;
		}

		fetchChildAssets(parentSelectionId ?? undefined, childSelectionIds);
	}, [childSelectionIds]);


	// Fetch child assets for a parent + selected children
	const fetchChildAssets = async (parentId?: string, childIds?: string[]) => {
		const payload = {
			levelOneLocations: [parentId || parentLocations[0]?.id],
			levelTwoLocations: childIds || childLocations.map((i) => i.id),
		};

		console.log('payload = ', payload);

		const childAssetsRes = await childAssetsAgainstLocation(payload);
		console.log('childAssetsRes = ', childAssetsRes);
		if (childAssetsRes.status) {
			setChildAssets(childAssetsRes.data.assetList);
		}
	};

	// When child assets are ready, fetch KPI data
	useEffect(() => {
		if (!childAssets.length) return;
		fetchAssetHealthKPIHistory();
	}, [childAssets]);

	const fetchAssetHealthKPIHistory = async () => {
		const payload = {
			org_id: user?.account_id,
			asset_list: childAssets.map((item) => item.id),
		};
		console.log('payload = ', payload);
		const res = await assetHealthKPIHistory(payload);
		setAssetKPIHistory(res.data);
	};


	return (
		<>
			{openDropdown && (
				<TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setOpenDropdown(null)} />
			)}
			<View style={styles.container}>
				<Dropdown
					name="parent"
					label="Parent Location"
					options={parentLocations}
					openDropdown={openDropdown}
					setOpenDropdown={setOpenDropdown}
					value={parentSelectionId ?? undefined}
					onValueChange={(v: any) => setParentSelectionId(v ?? null)}
				/>

				{childLocations.length > 0 && (
					<Dropdown
						name="child"
						label="Child Location"
						options={childLocations}
						value={childSelectionIds}
						onValueChange={(v: any) => setChildSelectionIds(v ?? null)}
						openDropdown={openDropdown}
						setOpenDropdown={setOpenDropdown}
					/>
				)}
			</View>
		</>
	);
}

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		paddingTop: 20,
		paddingHorizontal: 20,
		alignItems: "center",
		gap: 25,
	},
	overlay: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		zIndex: 99,
	},
});
