import { useState, useRef } from "react";
import {
	Text,
	View,
	StyleSheet,
	Pressable,
	ScrollView,
	Modal,
	LayoutRectangle,
} from "react-native";
import { DateDropDownIcon } from "@/constants/IconProvider";
import Fonts from "@/constants/Typography";

interface DropDownLocationProps {
	label: string;
	required?: boolean;
	value?: any; // controlled value
	options: string[];
	onSelect?: (value: string) => void;
	containerStyle?: object;
	fieldStyle?: object;

	// Optional dynamic store binding
	field?: string;
	store?: any;
	displayKey?: string;
}

export default function DropDownLocation({
	label,
	required = true,
	value,
	options,
	onSelect,
	containerStyle,
	fieldStyle,
	field,
	store,
}: DropDownLocationProps) {
	const [visible, setVisible] = useState(false);
	const [fieldLayout, setFieldLayout] = useState<LayoutRectangle | null>(null);

	const fieldRef = useRef<View>(null);

	// CURRENT DISPLAYED VALUE
	const actualValue = value ?? "Select";

	// ----------------------------
	// OPEN DROPDOWN
	// ----------------------------
	const toggleDropdown = () => {
		if (!fieldRef.current) return;

		// more reliable than measure()
		fieldRef.current.measureInWindow((x, y, width, height) => {

			setFieldLayout({ x, y, width, height });
			setVisible(true);
		});
	};

	// ----------------------------
	// HANDLE OPTION SELECT
	// ----------------------------
	const handleSelect = (selected: string) => {
		if (onSelect) {
			onSelect(selected);
		} else if (store && field) {
			try {
				const setValue =
					store((state: any) => state.setPreventiveValue || state.setPartFormValue);
				setValue?.(field, selected);
			} catch (err) {
				console.warn("Unable to update store:", err);
			}
		}

		setVisible(false);
	};

	return (
		<>
			{/* FIELD + LABEL */}
			<View style={[styles.container, containerStyle]}>
				<View style={styles.labelContainer}>
					<Text style={styles.labelText}>{label}</Text>
					{required && <Text style={styles.asterisk}>*</Text>}
				</View>

				{/* IMPORTANT: View holds the ref, not Pressable */}
				<View ref={fieldRef} style={[styles.field, fieldStyle]}>
					<Pressable
						style={styles.pressable}
						onPress={toggleDropdown}
					>
						<Text
							style={[
								styles.inputText,
								actualValue === "Select" && { color: "#888" },
							]}
							numberOfLines={1}
						>
							{actualValue}
						</Text>
						<DateDropDownIcon />
					</Pressable>
				</View>
			</View>

			{/* DROPDOWN MODAL */}
			{visible && fieldLayout && (
				<Modal transparent animationType="fade">
					{/* Close overlay */}
					<Pressable
						style={StyleSheet.absoluteFill}
						onPress={() => setVisible(false)}
					/>

					{/* Dropdown list */}
					<View
						style={[
							styles.dropdownContainer,
							{
								top: fieldLayout.y + fieldLayout.height + 4,
								left: fieldLayout.x,
								width: fieldLayout.width,
							},
						]}
					>
						<ScrollView nestedScrollEnabled style={{ maxHeight: 200 }}>
							{options.map((option) => (
								<Pressable
									key={option}
									style={styles.dropdownItem}
									onPress={() => handleSelect(option)}
								>
									<Text style={styles.dropdownItemText}>{option}</Text>
								</Pressable>
							))}
						</ScrollView>
					</View>
				</Modal>
			)}
		</>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingVertical: 7.5,
		paddingHorizontal: 25,
	},
	labelContainer: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 5,
	},
	labelText: {
		fontSize: 12,
		fontFamily: Fonts.regular,
		color: "#1C1C1C",
	},
	asterisk: {
		color: "#D63928",
		fontSize: 14,
		marginLeft: 2,
	},
	field: {
		backgroundColor: "#FFFFFF",
		borderRadius: 8,
		paddingHorizontal: 20,
		borderWidth: 1,
		borderColor: "#E1E8EE",
		justifyContent: "center",
	},
	pressable: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingVertical: 10,
	},
	inputText: {
		fontSize: 12,
		color: "#1C1C1C",
		fontFamily: Fonts.light,
	},
	dropdownContainer: {
		position: "absolute",
		backgroundColor: "#fff",
		borderWidth: 1,
		borderColor: "#E1E8EE",
		borderRadius: 6,
		shadowColor: "#000",
		shadowOpacity: 0.12,
		shadowRadius: 5,
		shadowOffset: { width: 0, height: 2 },
		elevation: 6,
		zIndex: 999,
	},
	dropdownItem: {
		paddingVertical: 10,
		paddingHorizontal: 15,
	},
	dropdownItemText: {
		fontSize: 12,
		color: "#1C1C1C",
		fontFamily: Fonts.regular,
	},
});