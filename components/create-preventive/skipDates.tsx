import React from "react";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { usePreventiveStore } from "@/src/store/usePreventiveStore";
import moment from "moment";
import Fonts from "@/constants/Typography";

interface SkipDatesProps {
	onDateFieldPress: (index: number) => void;
	onAdd: () => void;
	onRemove: (index: number) => void;
}

export default function SkipDatesUI({ onDateFieldPress, onAdd, onRemove }: SkipDatesProps) {
	const skip_dates = usePreventiveStore((s) => s.skip_dates);

	console.log('skip dates in skip = ', skip_dates)

	return (
		<View style={styles.wrapper}>
			<Text style={styles.heading}>Skip Dates (optional)</Text>

			{skip_dates.map((date, index) => (
				<View style={styles.row} key={index}>
					{/* Open date picker */}
					<TouchableOpacity
						style={styles.inputWrapper}
						onPress={() => onDateFieldPress(index)}
					>
						<TextInput
							style={styles.input}
							editable={false}
							value={date ? moment(date).format("DD-MM-YYYY") : ""}
							placeholder="dd-mm-yyyy"
							placeholderTextColor="#6b7280"
						/>
						<Ionicons style={styles.icon} name="calendar-outline" size={20} color="#6b7280" />
					</TouchableOpacity>

					<TouchableOpacity style={styles.removeBtn} onPress={() => onRemove(index)}>
						<Text style={styles.removeText}>Remove</Text>
					</TouchableOpacity>
				</View>
			))}

			<TouchableOpacity style={styles.addBtn} onPress={onAdd}>
				<Ionicons name="add" size={18} color="#6366f1" />
				<Text style={styles.addText}>Add Skip Date</Text>
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	wrapper: { backgroundColor: 'transparent' },
	heading: {
		fontSize: 12,
		fontFamily: Fonts.semiBold,
		marginBottom: 8,
	},
	row: {
		width: "100%",
		backgroundColor: '#fff',
		flexDirection: "row",
		justifyContent: 'space-between',
		alignItems: "center",
		marginBottom: 10,
	},
	inputWrapper: {
		flex: 1,
		// width: '66%',
		flexDirection: "row",
		alignItems: "center",
		borderWidth: 1,
		borderColor: "#e5e7eb",
		backgroundColor: '#fff',
		paddingHorizontal: 12,
		// paddingVertical: 10,
	},
	input: {
		flex: 1,
		// width: '100%',
		backgroundColor: '#fff',
		fontSize: 12,
		fontFamily: Fonts.regular,
	},
	icon: {
		// width: '5%',
		backgroundColor: '#fff',
	},
	removeBtn: {
		// width: '30%',
		backgroundColor: '#fff',
		paddingVertical: 10,
		paddingHorizontal: 10,
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: "#ee5856",
		justifyContent: 'flex-end',
		alignItems: 'center'
	},
	removeText: {
		color: "#ee5856",
		fontSize: 12,
		fontFamily: Fonts.regular,
	},
	addBtn: {
		flexDirection: "row",
		alignItems: "center",
		marginTop: 4,
		alignSelf: 'flex-start',
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 4,
		borderColor: '#742BDE',
		borderWidth: StyleSheet.hairlineWidth,
	},
	addText: {
		color: "#742BDE",
		fontSize: 12,
		marginLeft: 4,
		fontFamily: Fonts.regular,
	},
});