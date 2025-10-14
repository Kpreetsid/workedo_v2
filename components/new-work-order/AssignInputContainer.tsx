import { Pressable, StyleSheet, View, Text } from "react-native";
import { ArrowRight } from "@/constants/IconProvider";
import { FontAwesome } from "@expo/vector-icons";
import Fonts from "@/constants/Typography";

const assignInputs = [{ title: "Location", name: "report testing" },
{ title: "Asset", name: "Portable Test 8G" },
{ title: "Assign User", name: "Assign" },
{ title: "Start Date", name: "Select Date" },
{ title: "End Date", name: "Select Date" },
]
export default function AssignInputContainer() {
	return (
		<View style={styles.subContainer}>
			{assignInputs.map((input, index) => (
				<View key={index} style={styles.assignInputContainer}>
					<View style={styles.makeRow}>
						<Text style={styles.assignInputText}>{input.title}</Text>
						<FontAwesome name="asterisk" size={6} color="#FF0400" />
					</View>
					<Pressable style={styles.makeRow}>
						<Text style={styles.btnText}>{input.name}</Text>
						<ArrowRight color={"#742BDE"} />
					</Pressable>
				</View>
			))}
		</View>
	)
}

const styles = StyleSheet.create({
	subContainer: {
		backgroundColor: "#f9f9ff",
		marginHorizontal: 10
	},
	assignInputContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		padding: 10
	},
	assignInputText: {
		fontSize: 11,
		fontFamily: Fonts.semiBold
	},
	btnText: {
		fontSize: 10,
		fontFamily: Fonts.regular,
		color: "#742BDE",
		lineHeight: 15
	},
	makeRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 1
	},
})