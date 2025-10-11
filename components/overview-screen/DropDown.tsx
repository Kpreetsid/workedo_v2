import { StyleSheet, TouchableOpacity, Text, View, TextInput, ScrollView } from "react-native";
import Fonts from "@/constants/Typography";
import { ArrowRight, DropDownIcon, SearchIcon, TickMark } from "@/constants/IconProvider";
import { Dispatch, SetStateAction } from "react";

interface DropdownOption {
	id: string;
	location_name: string;
}

interface DropdownProps {
	name: string;
	label: string;
	options: DropdownOption[];
	value?: string | string[] | null;
	onValueChange?: (value: string | string[] | null) => void;
	openDropdown: string | null;
	setOpenDropdown: Dispatch<SetStateAction<string | null>>;
}

export default function Dropdown(
	{
		name,
		label,
		options,
		value,
		onValueChange,
		openDropdown,
		setOpenDropdown
	}: DropdownProps) {
	const selected = options.find((option) => option.id === value) || options[0];
	const isOpen = openDropdown === name;
	const variant = isOpen ? "purple" : "gray";

	const isMulti = Array.isArray(value);
	const selectedIds = isMulti ? (value as string[]) : [value as string];

	const toggleSelection = (id: string) => {
		if (!onValueChange) return;
		if (!isMulti) return onValueChange(id);

		const newSelection = selectedIds.includes(id)
			? selectedIds.filter((x) => x !== id)
			: [...selectedIds, id];

		onValueChange(newSelection);
	};

	return (
		<View style={styles.dropdownWrapper}>
			<View style={[styles.dropdownBox, variant === "purple" ? styles.purpleBorder : styles.grayBorder]}>

				<View style={[styles.labelMask, variant === "gray" && { width: 74 }]} />
				<Text style={[styles.floatingLabel, variant === "purple" ? styles.labelPurple : styles.labelGray]}>{label}</Text>

				<TouchableOpacity style={styles.dropdownTouchable} activeOpacity={0.8} onPress={() => setOpenDropdown(isOpen ? null : name)}>
					<Text numberOfLines={1} ellipsizeMode="tail" style={styles.dropdownText}>{selected?.location_name}</Text>
					<DropDownIcon />
				</TouchableOpacity>

				{isOpen && (
					<View style={styles.optionsContainer}>
						<Text style={styles.searchLabel}>Search Location</Text>
						<View style={styles.searchContainer}>
							<SearchIcon />
							<TextInput
								placeholder="Search"
								placeholderTextColor="#71717A"
								style={styles.input}
							/>
						</View>

						<ScrollView style={styles.scrollView} showsVerticalScrollIndicator={true} nestedScrollEnabled>
							{options.map((option) => {
								const isChecked = selectedIds.includes(option.id);
								return (
									<TouchableOpacity
										key={option.id}
										style={styles.optionItem}
										onPress={() => toggleSelection(option.id)}
									>
										<View style={[styles.checkbox, { backgroundColor: isChecked ? "#742BDE" : undefined }]}>
											<TickMark />
										</View>
										<Text style={styles.optionText}>{option.location_name}</Text>
										<ArrowRight color="#333333CC" />
									</TouchableOpacity>
								);
							})}

						</ScrollView>
					</View>
				)}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	dropdownWrapper: {
		position: "relative",
		width: 130,
		height: 35,
	},
	dropdownBox: {
		borderRadius: 4,
		backgroundColor: "#fff",
		position: "relative",
	},
	labelMask: {
		position: "absolute",
		top: -1,
		left: 15,
		width: 79,
		height: 1.5,
		backgroundColor: "#fff",
	},
	purpleBorder: {
		borderWidth: 1,
		borderColor: "#742BDE",
	},
	grayBorder: {
		borderWidth: 1,
		borderColor: "#E1E8EE",
	},
	floatingLabel: {
		position: "absolute",
		top: -9,
		left: 12,
		paddingHorizontal: 4,
		fontSize: 12,
	},
	labelPurple: {
		color: "#742BDE",
		fontSize: 9,
		fontFamily: Fonts.light,
	},
	labelGray: {
		fontSize: 9,
		fontFamily: Fonts.light,
		color: "#000000",
	},
	dropdownTouchable: {
		flexDirection: "row",
		alignItems: "center",
		width: 135,
		height: 35,
		justifyContent: "space-evenly",
	},
	dropdownText: {
		fontSize: 11,
		color: "#201F23",
		fontFamily: Fonts.regular,
	},
	optionsContainer: {
		position: "absolute",
		top: 40,
		left: 0,
		right: 0,
		backgroundColor: "#fff",
		borderRadius: 12,
		paddingVertical: 6,
		shadowColor: "#000",
		shadowOpacity: 0.08,
		shadowRadius: 8,
		elevation: 6,
		zIndex: 999,
		paddingHorizontal: 10,
		width: 155,
	},
	scrollView: {
		marginTop: 5,
		maxHeight: 225
	},
	optionItem: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
		paddingVertical: 3,
	},
	checkbox: {
		height: 15,
		width: 15,
		borderRadius: 2,
		borderWidth: 0.8,
		borderColor: "#D4D4D8",
		alignItems: "center",
		justifyContent: "center",
	},
	optionText: {
		fontSize: 10,
		color: "#333333",
		fontFamily: Fonts.regular,
		lineHeight: 20,
	},
	searchLabel: {
		fontSize: 10,
		color: "#71717A",
		fontFamily: Fonts.regular,
	},
	searchContainer: {
		marginTop: 5,
		borderWidth: 1,
		borderColor: "#D4D4D8",
		flexDirection: "row",
		alignItems: "center",
		borderRadius: 4,
		paddingHorizontal: 8,
		height: 28, // slightly increased height
	},
	input: {
		fontSize: 10,
		fontFamily: Fonts.regular,
		color: "#000",
		flex: 1,
		paddingVertical: 0, // ensures text is vertically centered
	},
});
