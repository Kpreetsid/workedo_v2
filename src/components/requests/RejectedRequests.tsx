import { ActivityIndicator,  Pressable, StyleSheet, Text, View } from "react-native";
import Fonts from "@/constants/Typography";
import { WorkOrderCardLogo } from "@/constants/IconProvider";
import { router } from "expo-router";
import moment from "moment";
import { FlashList } from "@shopify/flash-list";

interface Props {
	data: any[];
	loading: boolean;
	refreshing: boolean;
	onRefresh: () => void;
}

export default function RejectedRequests({
	data,
	loading,
	refreshing,
	onRefresh,
}: Props) {
	if (loading) {
		return <ActivityIndicator size="large" />;
	}


	return (
		<FlashList
			removeClippedSubviews={false}
			data={data}
			keyExtractor={(item) => item.id}
			renderItem={({ item, index }) => (
				<Pressable
					style={({ pressed }) => [
						styles.card,
						pressed && { backgroundColor: '#fadb7d' },
						index === data.length - 1 && { marginBottom: 100 },
					]}
					onPress={() =>
						router.push({
							pathname: "/requestDetail",
							params: { data: JSON.stringify(item) },
						})
					}
				>
					<View style={styles.textContainer}>
						<Text style={styles.title}>{item.title}</Text>
						<Text style={styles.subText}>
							Requested By: {item.createdBy.firstName} {item.createdBy.lastName}
						</Text>
						<Text style={styles.subText}>
							Created On: {moment(item.createdAt).format("MMM D, YYYY")}
						</Text>
					</View>

					<View style={styles.rightContainer}>
						<WorkOrderCardLogo />
						<View style={styles.tagButton}>
							<Text style={styles.tagText}>{item.status}</Text>
						</View>
					</View>
				</Pressable>
			)}
			showsVerticalScrollIndicator={false}
			contentContainerStyle={styles.listContainer}
			refreshing={refreshing}
			onRefresh={onRefresh}
		/>
	);
}

const styles = StyleSheet.create({
	listContainer: {
		flexGrow: 1,
		backgroundColor: "#F5F7FA",
		paddingHorizontal: 20,
	},
	card: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		backgroundColor: "#fff",
		borderRadius: 10,
		padding: 12,
		marginVertical: 6,
		shadowColor: "#000",
		shadowOpacity: 0.06,
		shadowOffset: { width: 0, height: 2 },
		shadowRadius: 3,
		elevation: 2,
	},
	textContainer: {
		flex: 1,
	},
	title: {
		fontSize: 11,
		fontFamily: Fonts.semiBold,
		color: "#201F23",
		marginBottom: 2,
	},
	subText: {
		fontSize: 9,
		fontFamily: Fonts.regular,
		color: "#000000A0",
		marginVertical: 1,
	},
	rightContainer: {
		alignItems: "center",
		justifyContent: "center",
		gap: 10
	},
	tagButton: {
		backgroundColor: "#ff716a",
		paddingVertical: 5,
		paddingHorizontal: 10,
		borderRadius: 6,
	},
	tagText: {
		color: "#fff",
		fontSize: 9,
		fontFamily: Fonts.regular,
	},
});
