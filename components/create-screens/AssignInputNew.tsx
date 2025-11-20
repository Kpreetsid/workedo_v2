import {
	Text,
	View,
	StyleSheet,
	Pressable,
	ViewStyle,
	TextStyle,
	GestureResponderEvent,
	TextInput,
	TouchableOpacity,
} from "react-native";
import Fonts from "@/constants/Typography";
import { ArrowRight } from "@/constants/IconProvider";
import { FC } from "react";
import { Ionicons } from "@expo/vector-icons";

interface AssignInputProps {
	label: string;
	field?: string;
	store?: any;
	setterName?: string;
	comingFrom?: string;
	displayKey?: string; // key to show (like username, asset_name)
	onPress?: (event: GestureResponderEvent) => void;
	required?: boolean;
	placeholder?: string;
	containerStyle?: ViewStyle;
	labelStyle?: TextStyle;
	buttonStyle?: ViewStyle;
	buttonTextStyle?: TextStyle;
}

const AssignInputNew: FC<AssignInputProps> = ({
	label,
	field,
	store,
	setterName,
	comingFrom,
	displayKey,
	required = true,
	placeholder = "Select",
	onPress,
	containerStyle,
	labelStyle,
	buttonStyle,
	buttonTextStyle,
}) => {
	let assignedUsers = [];
	assignedUsers = store((state: any) => state.assigned_users);
	// if (comingFrom === "newWorkOrder") {
	// assignedUsers = store((state: any) => state.assigned_users);
	// } else {
	// 	assignedUsers = store((state: any) => state.assigned_users);
	// }
	// ✅ Call Zustand hook only if both store and field exist
	let value: any = null;
	if (store && field) {
		console.log('store = ', store)
		console.log('field = ', field)

		try {
			value = store((state: any) => state[field]);
			console.log('store value = ', value);
		} catch (err) {
			value = null;
		}
	}

	// ✅ Render display value dynamically
	let displayValue: string | null = null;

	if (value) {
		if (Array.isArray(value)) {
			displayValue = value.map((item) => item?.[displayKey || "username"]).join(", ");
		} else if (typeof value === "object") {
			displayValue =
				value?.[displayKey || "name"] ||
				value?.name ||
				value?.title ||
				value?.toString?.();
		} else {
			displayValue = value;
		}

		console.log('display value = ', displayValue)
	}

	const onRemoveUser = (user: any) => {
		const setter = store.getState()[setterName!];
		const current = store.getState().assigned_users;

		console.log('setter = ', setter)
		console.log('current = ', current)

		const updated = current.filter(
			(u: any) => (u._id || u.id) !== (user._id || user.id)
		);

		setter("assigned_users", updated);
	};

	return (
		<Pressable style={styles.outerContainer} onPress={onPress}>
			<View style={styles.labelContainer}>
				<Text style={[styles.inputText]}>{label}</Text>
				{required && <Text style={styles.asterisk}>*</Text>}
			</View>

			{
				field === "attachments" ?
					<View style={styles.container1}>
						<View style={styles.inputRow1}>
							<TouchableOpacity style={styles.button1} onPress={() => { }}>
								<Text style={styles.buttonText1}>Choose File</Text>
							</TouchableOpacity>

							<Text style={styles.fileName1}>
								No File Chosen
							</Text>
						</View>
					</View>

					:
					<View style={styles.outerInputContainer}>
						<View style={[styles.field, field === 'assigned_users' ? { width: '100%' } : { width: '75%' }]}>

							{field === "assigned_users" ? (
								<View style={styles.userChipsContainer}>
									{assignedUsers?.map((u: any) => (
										<View key={u._id || u.id} style={styles.chip}>
											<Text style={styles.chipText}>
												{u.firstName || u.username || u.user?.firstName || u.user?.username}
											</Text>

											<Pressable
												style={styles.closeIconContainer}
												onPress={() => onRemoveUser(u)}
											>
												<Ionicons name="close" size={16} color="black" style={styles.closeIcon} />
											</Pressable>
										</View>
									))}
								</View>
							) : (
								<TextInput
									readOnly
									value={displayValue || ""}
									style={[styles.inputField]}
									placeholderTextColor="#6B788899"
								/>
							)}

						</View>


						{
							field !== "assigned_users" &&
							<View style={[styles.buttonContainer, buttonStyle]}>
								<Text style={[styles.buttonText, buttonTextStyle]}>{placeholder}</Text>
								<ArrowRight />
							</View>
						}

					</View>

			}


		</Pressable>
	);
};

export default AssignInputNew;

const styles = StyleSheet.create({
	outerContainer: {
		paddingHorizontal: 25,
		paddingVertical: 7.5,
	},
	outerInputContainer: {
		width: '100%',
		flexDirection: "row",
		justifyContent: "space-between",
		// backgroundColor: "red",
		backgroundColor: "transparent",
		borderRadius: 8,
		gap: 5
	},
	container: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		backgroundColor: "#FFFFFF",
		marginHorizontal: 25,
		marginVertical: 7.5,
		borderRadius: 8,
		borderWidth: 0.6,
		borderColor: "#E1E8EE",
		height: 50,
		paddingHorizontal: 25,
	},
	labelContainer: {
		flex: 1,
		marginBottom: 6,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "flex-start",
	},
	labelText: {
		fontSize: 11,
		fontFamily: Fonts.semiBold,
		color: "#201F23",
	},
	inputText: {
		fontSize: 12,
		fontFamily: Fonts.regular,
		color: "#201f23",
		lineHeight: 20,
	},
	asterisk: {
		color: "#D63928",
		fontSize: 12,
		fontFamily: Fonts.regular,
		marginTop: -2,
		marginLeft: 2,
	},
	buttonContainer: {
		width: '25%',
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#742BDE",
		justifyContent: "center",
		gap: 5,
		borderRadius: 5,
		elevation: 5,
		shadowColor: "rgba(116, 43, 222, 0.80)",
		shadowOffset: {
			width: 2,
			height: 2,
		},
		shadowOpacity: 0.60,
		shadowRadius: 2,
	},
	buttonText: {
		fontSize: 10,
		fontFamily: Fonts.regular,
		color: "#FFFFFF",
		lineHeight: 20,
	},
	field: {
		width: '75%',
		backgroundColor: "#fff",
		borderRadius: 8,
		paddingHorizontal: 10,
		borderWidth: 1,
		borderColor: "#E1E8EE",
	},
	inputField: {
		backgroundColor: '#fff',
		padding: 10,
		fontSize: 12,
		color: "#1C1C1C",
		fontFamily: Fonts.light,
	},
	messageInput: {
		height: 80,
		textAlignVertical: "top"
	},
	userChipsContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		minHeight: 45,
		gap: 10,
		paddingHorizontal: 10,
		paddingVertical: 10,
	},

	chip: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 4,
		paddingHorizontal: 14,
		borderRadius: 4,
		backgroundColor: "#F4EDFF",
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: "#A259FF",
		marginRight: 5,
		// marginBottom: 10,
	},

	chipText: {
		fontSize: 12,
		color: "#000",
	},

	closeIconContainer: {
		position: 'absolute',
		right: -5,
		top: -5,
		width: 16,
		height: 16,
		borderRadius: 10,
		backgroundColor: "#222",
		alignItems: "center",
		justifyContent: "center",
	},

	closeIcon: {
		color: "#fff",
		fontSize: 12,
		fontWeight: "bold",
	},



	container1: {
		marginVertical: 10,
	},
	label1: {
		fontSize: 14,
		color: "#000",
		marginBottom: 6,
		fontWeight: "500",
	},
	inputRow1: {
		backgroundColor: '#fff',
		borderWidth: 1,
		borderColor: "#E1E8EE",
		borderRadius: 6,
		flexDirection: "row",
		alignItems: "center",
		overflow: "hidden",
	},
	button1: {
		backgroundColor: "#F3F4F6",
		paddingVertical: 10,
		paddingHorizontal: 14,
		borderRightWidth: 1,
		borderRightColor: "#E1E8EE",
	},
	buttonText1: {
		fontSize: 12,
		color: "#111827",
	},
	fileName1: {
		flex: 1,
		paddingHorizontal: 10,
		color: "#6B7280",
		fontSize: 12,
	},
});