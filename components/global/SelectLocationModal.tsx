import Fonts from "@/constants/Typography";
import React, { useState } from "react";
import {
	View,
	Text,
	Modal,
	FlatList,
	Pressable,
	StyleSheet,
	Dimensions,
} from "react-native";
import Header from "./Header";
import { Location } from "@/src/types/location";
import { ArrowRight, MapIcon } from "@/constants/IconProvider";

interface SelectLocationModalProps {
	visible: boolean;
	onClose: () => void;
	locations: any[];
	onSelect: (item: any) => void;
}

const width = Dimensions.get("window").width;

const SelectLocationModal: React.FC<SelectLocationModalProps> = ({
	visible,
	onClose,
	locations,
	onSelect,
}) => {

	const [selectedLocation, setSelectedLocation] = useState<Location>();

	return (
		<Modal
			visible={visible}
			animationType="slide"
			onRequestClose={onClose}
			transparent={false}
		>
			<>
				<Header title="Select Location" modal={true} dismiss={onClose} />
				<View style={{ flex: 1 }}>
					<FlatList
						data={locations}
						keyExtractor={(_, index) => index.toString()}
						renderItem={({ item }) => (
							<Pressable style={[styles.locationButton, { backgroundColor: selectedLocation === item ? "#FFBF0080" : "#fff", borderColor: selectedLocation === item ? "#FFC1074D" : "#99999933" }]}
								onPress={() => {
									onSelect(item);
								}}
							>
								<View style={styles.textRow}>
									<Text style={styles.locationText}>{item.location_name}</Text>
									<ArrowRight color={"#201F23CC"} />
								</View>
								<MapIcon />
							</Pressable>)}
						contentContainerStyle={styles.container}
					/>
				</View>
			</>
		</Modal>
	);
};

export default SelectLocationModal;

const styles = StyleSheet.create({
	searchContainer: {
		backgroundColor: "#fff",
		borderRadius: 8,
		alignItems: "center",
		flexDirection: "row",
		paddingHorizontal: 20,
		marginHorizontal: 20,
		marginVertical: 10,
		gap: 10
	},
	input: {
		fontSize: 12,
		fontFamily: Fonts.regular
	},
	container: {
		flexGrow: 1,
		backgroundColor: "#F5F7FA",
		paddingHorizontal: 25,
		paddingTop: 15,
		paddingBottom: 105,
		gap: 10
	},
	locationButton: {
		borderWidth: 0.6,
		borderRadius: 7,
		height: 50,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 20,
	},
	textRow: {
		flexDirection: "row",
		gap: 5,
		alignItems: "center",
	},
	locationText: {
		fontSize: 10,
		fontFamily: Fonts.semiBold,
		color: "#201F23",
		lineHeight: 20
	},
	actionButton: {
		position: "absolute",
		bottom: 20,
		alignSelf: "center",
		width: width - 50
	}
});
