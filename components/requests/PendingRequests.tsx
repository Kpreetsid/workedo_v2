import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import Fonts from "@/constants/Typography";
import { WorkOrderCardLogo } from "@/constants/IconProvider";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { getWorkRequests } from "@/src/services/work-request.service";
import { WorkRequest } from "@/src/types/workRequest";
import moment from "moment";

export default function PendingRequests() {
	console.log('pending requests');
	const [pendingRequests, setPendingRequests] = useState<WorkRequest[]>([]);
	const [refreshing, setRefreshing] = useState(false);

	useFocusEffect(
		useCallback(() => {
			fetchPendingRequests();
		}, [])
	);

	const fetchPendingRequests = async () => {
		try {
			const res = await getWorkRequests();
			if (res?.status) {
				console.log(res);
				setPendingRequests(res?.data.reverse());
			}
		} catch (e) {
			console.log(e);
		}
	}

	const onRefresh = () => {
		setRefreshing(true);
		fetchPendingRequests();
		setRefreshing(false);
	}

	return (
		<FlatList
			data={pendingRequests}
			keyExtractor={(item) => item.id}
			renderItem={({ item }: { item: WorkRequest }) => (
				<Pressable style={styles.card} onPress={() => router.push({ pathname: "/requestDetail", params: { data: JSON.stringify(item) } })}>

					<View style={styles.textContainer}>
						<Text style={styles.title}>{item.title}</Text>
						<Text style={styles.subText}>Requested By : {item.createdBy.firstName + " " + item.createdBy.lastName}</Text>
						<Text style={styles.subText}>Created On : {moment(item.createdAt).format("MMM D, YYYY")}</Text>
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
		backgroundColor: "#F7F7F9",
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
		backgroundColor: "#742BDE",
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
