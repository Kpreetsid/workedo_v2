import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import Fonts from "@/constants/Typography";

const WEEK_DAYS = [
	"Sunday",
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
];

const WeekDays = ({
	selected = [],
	onToggle,
}: {
	selected?: number[];
	onToggle: (index: number) => void;
}) => {
	return (
		<View style={styles.weekDaysWrapper}>
			{WEEK_DAYS.map((day, index) => {
				const isActive = selected.includes(index);

				return (
					<TouchableOpacity
						key={index}
						style={[
							styles.dayBox,
							isActive && styles.dayBoxActive,
						]}
						onPress={() => onToggle(index)}
					>
						{/* Checkbox */}
						<View style={styles.checkboxContainer}>
							{isActive ? (
								<View
									style={[
										styles.checkboxOutline,
										styles.checkboxActive,
									]}
								>
									<Ionicons name="checkmark" size={12} color="#fff" />
								</View>
							) : (
								<View style={styles.checkboxOutline} />
							)}
						</View>

						{/* Label */}
						<Text style={[styles.dayText, isActive && styles.dayTextActive]}>
							{day}
						</Text>
					</TouchableOpacity>
				);
			})}
		</View>
	);
};

export default WeekDays;

const styles = StyleSheet.create({
	weekDaysWrapper: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 4,
		marginTop: 15,
	},

	dayBox: {
		flexDirection: "row",
		paddingVertical: 8,
		borderRadius: 6,
	},
	dayBoxActive: {
		// backgroundColor: "#3399FF22",
		// borderColor: "#3399FF",
	},

	dayText: {
		fontSize: 12,
		color: "#222",
		fontFamily: Fonts.regular
	},
	dayTextActive: {
		
	},

	monthDaysWrapper: {
		marginHorizontal: 25,
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 10,
		marginTop: 15,
	},

	numBox: {
		width: 40,
		height: 40,
		borderRadius: 6,
		justifyContent: "center",
		alignItems: "center",
		borderWidth: 1,
		borderColor: "#ddd",
	},
	numBoxActive: {
		backgroundColor: "#3399FF22",
		borderColor: "#3399FF",
	},

	numText: {
		fontSize: 14,
		color: "#333",
	},
	numTextActive: {
		color: "#3399FF",
		fontWeight: "600",
	},
	checkboxContainer: {
		marginHorizontal: 8
	},
	checkboxOutline: {
		width: 18,
		height: 18,
		borderWidth: 1,
		borderRadius: 4,
		borderColor: "#656565",
		justifyContent: "center",
		alignItems: "center"
	},
	checkboxActive: {
		backgroundColor: "#742BDE",
		borderColor: "#742BDE",
	},
});
