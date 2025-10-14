import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { MaterialIcons, } from "@expo/vector-icons";
import Fonts from "@/constants/Typography";
import { JSX } from "react";
import EndpointCards from "@/components/asset-detail/EndpointCards";
import ConfigSections from "@/components/asset-detail/ConfigSections";
import { router } from "expo-router";
import { useAssetStore } from "@/src/store/useAssetStore";
import { Asset } from "@/src/types/asset";

interface Props {
	asset_data: Asset;
}

export default function SensorsScreen({ asset_data }: Props) {

	return (
		<ScrollView contentContainerStyle={styles.screenContainer} showsVerticalScrollIndicator={false}>

			<View style={styles.createRow}>
				<Text style={styles.headerTitle}>New End Point</Text>
				<TouchableOpacity style={styles.createButton} onPress={() => router.push("/createNewEndPoint")}>
					<MaterialIcons name="add-circle" size={12} color="#FFFFFF" />
					<Text style={styles.createButtonText}>Create</Text>
				</TouchableOpacity>
			</View>

			<EndpointCards asset_data={asset_data} />

			<ConfigSections />

		</ScrollView>
	);
}

const styles = StyleSheet.create({
	screenContainer: {
		flexGrow: 1,
		paddingBottom: 10,
	},
	createRow: {
		marginHorizontal: 16,
		backgroundColor: "#FFFFFF",
		borderRadius: 10,
		paddingVertical: 12,
		paddingHorizontal: 16,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		shadowColor: "#000",
		shadowOpacity: 0.06,
		shadowRadius: 10,
		shadowOffset: { width: 0, height: 6 },
		elevation: 2,
	},
	headerTitle: {
		fontSize: 11,
		fontFamily: Fonts.semiBold,
		color: "#201F23",
	},
	createButton: {
		backgroundColor: "#742BDE",
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 12,
		paddingVertical: 5,
		borderRadius: 8,
		gap: 3
	},
	createButtonText: {
		color: "#FFFFFF",
		fontFamily: Fonts.regular,
		fontSize: 11,
		lineHeight: 16
	}
});
