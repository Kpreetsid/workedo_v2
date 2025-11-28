import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Fonts from "@/constants/Typography";
import { usePreventiveStore } from "@/src/store/usePreventiveStore";

export default function SkipWeekendSelector() {
	const {
		skipWeekends,
		skipWeekendSaturday,
		skipWeekendSunday,
		setPreventiveValue
	} = usePreventiveStore();

	// --- Toggle main option ---
	const toggleSkipWeekends = () => {
		const newValue = !skipWeekends;

		setPreventiveValue("skipWeekends", newValue);
		setPreventiveValue("skipWeekendSaturday", newValue);
		setPreventiveValue("skipWeekendSunday", newValue);
	};

	// --- Toggle Saturday ---
	const toggleSaturday = () => {
		setPreventiveValue("skipWeekendSaturday", !skipWeekendSaturday);
	};

	// --- Toggle Sunday ---
	const toggleSunday = () => {
		setPreventiveValue("skipWeekendSunday", !skipWeekendSunday);
	};

	return (
		<View style={styles.container}>

			{/* Skip Weekends */}
			<TouchableOpacity style={styles.row} onPress={toggleSkipWeekends}>
				<Checkbox checked={skipWeekends} />
				<Text style={styles.label}>Skip Weekends</Text>
			</TouchableOpacity>

			{/* Sub-options */}
			{skipWeekends && (
				<>
					<TouchableOpacity
						style={[styles.row, { marginLeft: 30 }]}
						onPress={toggleSaturday}
					>
						<Checkbox checked={skipWeekendSaturday} />
						<Text style={styles.label}>Skip Saturday</Text>
					</TouchableOpacity>

					<TouchableOpacity
						style={[styles.row, { marginLeft: 30 }]}
						onPress={toggleSunday}
					>
						<Checkbox checked={skipWeekendSunday} />
						<Text style={styles.label}>Skip Sunday</Text>
					</TouchableOpacity>
				</>
			)}
		</View>
	);
}

const Checkbox = ({ checked }: { checked: boolean }) => (
	<View
		style={[
			styles.checkbox,
			checked ? { backgroundColor: "#742BDE" } : { backgroundColor: "#fff" },
		]}
	>
		{checked && <Ionicons name="checkmark" size={16} color="#fff" />}
	</View>
);

const styles = StyleSheet.create({
	container: {
		paddingTop: 10,
	},
	row: {
		flexDirection: "row",
		alignItems: "center",
		marginVertical: 8,
	},
	checkbox: {
		height: 22,
		width: 22,
		borderRadius: 6,
		borderWidth: 2,
		borderColor: "#742BDE",
		alignItems: "center",
		justifyContent: "center",
		marginRight: 10,
	},
	label: {
		fontSize: 14,
		fontFamily: Fonts.regular,
		color: "#000",
	},
});
