import { useEffect, useState } from "react";
import { TouchableOpacity, View, StyleSheet, ToastAndroid, Pressable, Modal } from "react-native";
import Dropdown from "@/src/components/overview-screen/DropDown";
import { useAuthStore } from "@/src/state/auth/useAuthStore";
import { assetHealthKPIHistory, childAssetsAgainstLocation, fetchKPIFilterLocations, fetchParentLocationDetails, fetchParentLocationDetails1 } from "@/src/services/location.service";
import { useCMMSStore } from "@/src/state/app/useCMMSStore";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import DateRangeCalendar from "./DateRangeCalendar";
import { useDateRangeStore } from "@/src/state/app/useDateRangeStore";

export default function CMMSDashboardLocationSelect() {
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
	} = useCMMSStore();

	const { user } = useAuthStore();
	const [showCalendar, setShowCalendar] = useState(false);
	const [openDropdown, setOpenDropdown] = useState<string | null>(null);
	const { startDate, endDate } = useDateRangeStore();

	useEffect(() => {
		fetchLocations();
	}, []);

	// 🧩 Fetch all locations initially and select first parent
	const fetchLocations = async () => {
		const res = await fetchKPIFilterLocations();
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
				const childs = await fetchParentLocationDetails1(parentSelectionId, "parent");

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
				// console.error("fetchParentLocationDetails failed:", error);
				if (!error.status) {
					ToastAndroid.show("No Data Found", ToastAndroid.SHORT);
					// Select ALL child IDs by default
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

		const childAssetsRes = await childAssetsAgainstLocation(payload);
		if (childAssetsRes.status) {
			setChildAssets(childAssetsRes.data.assetList);
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

				<Pressable style={styles.iconView} onPress={() => {
					setShowCalendar(true)
				}}>
					<Ionicons color={"#777"} name="calendar" size={20} />
				</Pressable>

			</View>

			<Modal
				visible={showCalendar}
				transparent
				animationType="slide"
			>
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
	iconView: {
		// backgroundColor: 'orange',
		position: 'absolute',
		right: 20,
		top: 25,
		alignItems: 'center',
		justifyContent: 'center'
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
		// padding: 16,
	},
});
