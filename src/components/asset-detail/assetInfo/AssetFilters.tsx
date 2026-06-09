    // @ts-ignore
import { View, Pressable, Text, StyleSheet } from "react-native";
import Fonts from "@/constants/Typography";
import SignalFilter from "./SignalFilter";

type AssetFiltersProps = {
	selectedAxis: string[];
	toggleAxis: (axis: string) => void;
	selectedSignal: string;
	selectedValueType: string;
	setSelectedSignal: (v: string) => void;
	setSelectedValueType: (v: string) => void;
};

export default function AssetFilters({
	selectedAxis,
	toggleAxis,
	selectedSignal,
	selectedValueType,
	setSelectedSignal,
	setSelectedValueType,
}: AssetFiltersProps) {
	const AXES = ["Horizontal", "Vertical", "Axial"];

	// ----------------------------------------
	// FIX: Prevent double-trigger on re-render
	// ----------------------------------------
	const handleAxisPress = (axis: string) => {
		requestAnimationFrame(() => {
			toggleAxis(axis);
		});
	};

	return (
		<View style={{ marginTop: 20 }}>
			{/* Axis Tabs */}
			<View style={styles.modeTabs}>
				{AXES.map((axis) => {
					const active = selectedAxis.includes(axis);

					return (
						<Pressable
							key={axis}
							style={[styles.modeTab, active && styles.modeTabActive]}
							onPress={() => handleAxisPress(axis)}
						>
							<Text style={[styles.modeTabText, active && styles.modeTabTextActive]}>
								{axis}
							</Text>
						</Pressable>
					);
				})}
			</View>

			{/* Signal Filters */}
			<View style={{ justifyContent: "center", alignItems: "center" }}>
				<SignalFilter
					selectedSignal={selectedSignal}
					selectedValueType={selectedValueType}
					onSignalChange={setSelectedSignal}
					onValueTypeChange={setSelectedValueType}
				/>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	modeTabs: {
		flexDirection: "row",
		marginHorizontal: 20,
		gap: 10,
		flexWrap: "wrap",
		alignItems: "center",
		justifyContent: "space-around",
		marginBottom: 10,
	},
	modeTab: {
		width: '30%',
		backgroundColor: "#fff",
		paddingVertical: 6,
		borderRadius: 5,
		borderWidth: 0.3,
		borderColor: "#00000020",
		marginVertical: 10,
		alignItems: "center",
	},
	modeTabActive: {
		backgroundColor: "#742BDE",
	},
	modeTabText: {
		color: "#00000080",
		fontSize: 10,
		fontFamily: Fonts.regular,
	},
	modeTabTextActive: {
		color: "#fff",
		fontFamily: Fonts.semiBold,
	},
});