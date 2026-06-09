import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import { MaterialIcons, } from "@expo/vector-icons";
import Fonts from "@/constants/Typography";
import ConfigSections from "@/src/components/asset-detail/assetSensors/ConfigSections";
import { router } from "expo-router";
import { Asset } from "@/src/types/asset";
import EndpointCards from "./EndpointCards";

interface Props {
	asset_data: Asset;
	refreshing: boolean;
	onRefresh: () => void;
}

export default function AssetSensorsTab({ asset_data, refreshing, onRefresh }: Props) {

	return (
		<ScrollView
			contentContainerStyle={styles.screenContainer}
			showsVerticalScrollIndicator={false}
			refreshControl={
				<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
			}
		>

			<View style={styles.createRow}>
				<Text style={styles.headerTitle}>New End Point</Text>
				<TouchableOpacity style={styles.createButton} onPress={() => router.push({
					pathname: "/createNewEndPoint",
					params: { id: asset_data?.id }
				})}>
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
