import Header from "@/components/global/Header";
import SearchBar from "@/components/global/SearchBar";
import { useCallback, useState } from "react";
import { StyleSheet, View, Text, Pressable, FlatList } from "react-native";
import { Entypo, FontAwesome } from "@expo/vector-icons";
import Fonts from "@/constants/Typography";
import { router, useFocusEffect } from "expo-router";
import { getParts } from "@/src/services/part.service";
import FAB from "@/components/overview-screen/FAB";
import CreateFAB from "@/components/global/CreateFAB";

export default function PartsInventory() {
	const [searchQuery, setSearchQuery] = useState("");
	const [refreshing, setRefreshing] = useState(false);
	const [parts, setParts] = useState<any[]>([]);

	useFocusEffect(
		useCallback(() => {
			fetchParts();
		}, [])
	);

	const handleRefresh = async () => {
		setRefreshing(true);
		await fetchParts();
		setRefreshing(false);
	};

	const fetchParts = async () => {
		try {
			const resp = await getParts();
			console.log('resp = ', resp);
			if (resp.status) {
				setParts(resp?.data);
			}
		} catch (error) {
			console.log('error = ', error);
		}
	}

	return (
		<>
			<Header title="Parts Inventory" />
			<View style={styles.container}>
				<SearchBar value={searchQuery} onChangeText={setSearchQuery} />

				<FlatList
					data={parts}
					keyExtractor={(item) => item.id}
					showsVerticalScrollIndicator={false}
					renderItem={({ item }) => (
						<Pressable
							style={styles.partInfoCard}
							onPress={() => router.push({
								pathname: "partDetail",
								params: { data: JSON.stringify(item) }
							})}
						>
							<Text style={styles.partName}>{item.part_name}</Text>

							<View style={styles.makeRow}>
								<FontAwesome name="gears" size={12} color="#000" style={styles.icon} />
								<Text style={styles.partInfo}>Type : {item.part_type}</Text>
							</View>

							<View style={styles.makeRow}>
								<Entypo name="location-pin" size={12} color="#000" style={styles.icon} />
								<Text style={styles.partInfo}>Location : {item?.location?.location_name || ""}</Text>
							</View>

							<View style={styles.makeRow}>
								<FontAwesome name="cubes" size={12} color="#000" style={styles.icon} />
								<Text style={styles.partInfo}>Quantity : {item.quantity}</Text>
							</View>
						</Pressable>
					)}
					contentContainerStyle={{ paddingBottom: 100, gap: 10 }}
					refreshing={refreshing}
					onRefresh={handleRefresh}
				/>
			</View>

			<CreateFAB label="Create Part" onPress={() => router.push("/createPart")} />

		</>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingVertical: 20,
		backgroundColor: "#F5F7FA"
	},
	partInfoCard: {
		backgroundColor: "rgba(255, 255, 255, 0.90)",
		borderRadius: 8,
		paddingHorizontal: 20,
		paddingVertical: 10,
		marginHorizontal: 20,
		borderWidth: 0.6,
		borderColor: "rgba(225, 232, 238, 0.40)",
		shadowColor: "#d3d3d3",
		shadowOpacity: 0.06,
		shadowOffset: { width: 0, height: 2 },
		shadowRadius: 3,
		elevation: 2,
	},
	makeRow: {
		flexDirection: "row",
		alignItems: "center",
	},
	partName: {
		fontSize: 10,
		fontFamily: Fonts.semiBold
	},
	icon: {
		width: 22
	},
	partInfo: {
		fontSize: 10,
		fontFamily: Fonts.regular
	}
})