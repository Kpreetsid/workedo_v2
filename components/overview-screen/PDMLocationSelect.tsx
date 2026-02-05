import { useEffect, useState } from "react";
import { TouchableOpacity, View, StyleSheet, ToastAndroid } from "react-native";
import Dropdown from "@/components/overview-screen/DropDown";
import { assetHealthKPIHistory, childAssetsAgainstLocation, fetchKPIFilterLocations, fetchParentLocationDetails, locationTree } from "@/src/services/location.service";
import { useOverviewStore } from "@/src/store/useOverviewStore";
import { useAuthStore } from "@/src/store/useAuthStore";

export default function PDMDashboardLocationSelect() {
	console.log('pdm location')
	// state (read-only)
	const parentLocations = useOverviewStore(s => s.parentLocations);
	const childLocations = useOverviewStore(s => s.childLocations);
	const childAssets = useOverviewStore(s => s.childAssets);
	const parentSelectionId = useOverviewStore(s => s.parentSelectionId);
	const childSelectionIds = useOverviewStore(s => s.childSelectionIds);
	const assetKPIHistory = useOverviewStore(s => s.assetKPIHistory);

	// actions (stable, no re-render cost)
	const setParentLocations = useOverviewStore(s => s.setParentLocations);
	const setChildLocations = useOverviewStore(s => s.setChildLocations);
	const setChildAssets = useOverviewStore(s => s.setChildAssets);
	const setParentSelectionId = useOverviewStore(s => s.setParentSelectionId);
	const setChildSelectionIds = useOverviewStore(s => s.setChildSelectionIds);
	const setAssetKPIHistory = useOverviewStore(s => s.setAssetKPIHistory);

	const { user } = useAuthStore();

	const [openDropdown, setOpenDropdown] = useState<string | null>(null);

	useEffect(() => {
		fetchLocations();
	}, []);

	// 🧩 Fetch all locations initially and select first parent
	const fetchLocations = async () => {
		const res = await fetchKPIFilterLocations();
		console.log('res kpi = ', res);
		if (res.status) {
			setParentLocations(res.data.levelOneLocations);

			const firstParent = res.data.levelOneLocations[0];
			if (firstParent) {
				setParentSelectionId(firstParent.id); // triggers below effect
				return;
			}
		}
	};

	// 🧠 When parent changes — fetch its child locations
	useEffect(() => {
		// console.log('parent changes')
		if (!parentSelectionId) return;

		const fetchChildsForParent = async () => {
			try {
				const childs = await fetchParentLocationDetails(parentSelectionId, "parent");
				// console.log('childs = ', childs);

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
					const allChildIds: string[] = []
					setChildSelectionIds(allChildIds);
					setChildLocations([]);

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
		// setAssetKPIHistory(null);

		if (assetKPIHistory !== null) {
			setAssetKPIHistory(null);
		}

		ToastAndroid.show("No Data Found", ToastAndroid.SHORT);
	};

	// 🧠 When child selections change (user toggles checkboxes)
	useEffect(() => {
		if (!childSelectionIds.length) {
			setChildAssets([]);

			if (assetKPIHistory !== null) {
				setAssetKPIHistory(null);
			}

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

		// console.log('payload child assets = ', payload);

		const childAssetsRes = await childAssetsAgainstLocation(payload);
		// console.log('childAssetsRes = ', childAssetsRes);
		if (childAssetsRes?.status && Array.isArray(childAssetsRes.data?.assetList)) {
			setChildAssets(childAssetsRes.data.assetList);
			return;
		}

		// Clear stale data when API returns no data / failure
		setChildAssets([]);
		if (assetKPIHistory !== null) {
			setAssetKPIHistory(null);
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
			electric_asset: [],
			non_electric_asset: [],
			top_level_asset: childAssets.filter(item => Boolean(item.top_level)).map(item => item.id),
		};
		// console.log('payload = ', payload);
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
