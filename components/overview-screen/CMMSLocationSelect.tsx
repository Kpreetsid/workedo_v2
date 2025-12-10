import { useState } from "react";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import Dropdown from "@/components/overview-screen/DropDown";
import { useOverviewStore } from "@/src/store/useOverviewStore";

export default function CMMSDashboardLocationSelect() {
	const { parentLocations, childLocations, parentSelectionId, childSelectionIds, setParentSelectionId, setChildSelectionIds } = useOverviewStore();
	const [openDropdown, setOpenDropdown] = useState<string | null>(null);

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

				<Dropdown
					name="child"
					label="Child Location"
					options={childLocations}
					value={childSelectionIds}
					onValueChange={(v: any) => setChildSelectionIds(v ?? null)}
					openDropdown={openDropdown}
					setOpenDropdown={setOpenDropdown}
				/>
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
