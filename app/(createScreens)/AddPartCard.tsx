import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import Fonts from '@/constants/Typography';
import { Ionicons } from '@expo/vector-icons';

const AddPartCard = ({ item, onAdd }: any) => {
	const [qty, setQty] = useState("");

	return (
		<View style={styles.card}>
			{/* LEFT INFO */}
			<View style={{ width: '50%' }}>
				<Text style={styles.title}>{item.part_name}</Text>

				<View style={styles.row}>
					<Text style={styles.code}>{item.part_number}</Text>
					<View style={styles.dot} />
					<Text style={styles.spare}>{item.part_type}</Text>
				</View>

				<View style={styles.row}>
					<Text style={styles.available}>Available Qty.</Text>
					<Text style={styles.qty}> {item.quantity}</Text>
				</View>

			</View>

			{/* INPUT + PLUS BUTTON */}
			<View style={styles.rightContainer}>
				<View style={styles.inputContainer}>
					<TextInput
						placeholder=""
						style={styles.input}
						keyboardType="numeric"
						value={qty}
						onChangeText={setQty}
					/>

					<TouchableOpacity
						style={styles.plusBtn}
						onPress={() => onAdd(item, qty)}
					>
						<Ionicons name="add" size={20} style={styles.plus} />
					</TouchableOpacity>
				</View>

				<Text style={styles.uom}>UOM : {item.unit}</Text>
			</View>
		</View>
	);
}

export default AddPartCard

const styles = StyleSheet.create({
	card: {
		marginHorizontal: 20,
		flexDirection: "row",
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: "#752BDF",
		borderRadius: 14,
		padding: 14,
		marginVertical: 8,
		backgroundColor: "#fff",
	},
	title: {
		fontSize: 12,
		fontFamily: Fonts.semiBold,
		color: "#000",
		marginBottom: 4,
	},
	row: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 3,
	},
	code: {
		fontSize: 10,
		fontFamily: Fonts.regular,
		color: "#000",
	},
	dot: {
		height: 6,
		width: 6,
		borderRadius: 3,
		backgroundColor: "#752BDF",
		marginHorizontal: 6,
	},
	spare: {
		fontSize: 10,
		fontFamily: Fonts.regular,
		color: "#000",
	},
	available: {
		fontSize: 10,
		fontFamily: Fonts.regular,
		color: "#000",
	},
	qty: {
		fontSize: 10,
		fontFamily: Fonts.regular,
		color: "#201F23",
	},
	uom: {
		marginTop: 6,
		fontSize: 12,
		fontFamily: Fonts.regular,
		fontStyle: "italic",
		alignSelf: "flex-end",
		color: "#201F23",
	},

	rightContainer: {
		width: '50%',
		justifyContent: 'flex-end',
		alignItems: 'center',
	},

	inputContainer: {
		width: '100%',
		height: 40,
		borderWidth: 0.8,
		borderColor: "rgba(117, 43, 223, 0.3)",
		borderRadius: 10,
		flexDirection: "row",
		alignItems: "center",
		overflow: "hidden",
	},
	input: {
		flex: 1,
		paddingHorizontal: 10,
		height: "100%",
		fontSize: 12,
		color: "#000",
		fontFamily: Fonts.regular
	},
	plusBtn: {
		width: 40,
		height: 40,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: '#F5F7FA'
	},
	plus: {
		color: "#742BDE",
	},
});