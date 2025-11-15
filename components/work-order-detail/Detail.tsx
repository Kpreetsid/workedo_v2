import { View, Text, StyleSheet, ScrollView, Image, Pressable } from "react-native";
import Fonts from "@/constants/Typography";
import { useState } from "react";
import AssignedUsersModal from "./AssignUserModal";
import PartsInfoModal from "./PartsInfoModal";
import MoreInfoModal from "./MoreInfoModal";
import { WorkOrder } from "@/src/types/workOrder";
import { endpoints } from "@/src/api/endpoints";
import moment from "moment";
import { Ionicons } from "@expo/vector-icons";

interface Props {
	params: WorkOrder;
}

export default function Detail({ params }: Props) {
	console.log('params = ', params);
	const [userModalVisible, setUserModalVisible] = useState(false);
	const [partsModalVisible, setPartsModalVisible] = useState(false);
	const [moreInfoModalVisible, setMoreInfoModalVisible] = useState(false);
	return (
		<ScrollView style={styles.container}>

			{/* Assigned Section */}
			<View style={styles.card}>
				<View style={[styles.makeRow, { backgroundColor: '#FAFAFB', paddingVertical: 10, paddingHorizontal: 8 }]}>
					<Text style={styles.cardTitle}>Assigned to</Text>
					<Pressable style={styles.avatarRow} onPress={() => setUserModalVisible(true)}>
						<ScrollView
							horizontal
							showsHorizontalScrollIndicator={false}
							contentContainerStyle={{ alignItems: "center" }}
							style={{ maxWidth: 150 }}   // optional if you want it capped
						>
							{params?.assignedUsers?.map((user, i) => {
								const profileImg = user?.user?.user_profile_img;
								const first = user?.user?.firstName?.[0] || "";
								const last = user?.user?.lastName?.[0] || "";
								const initials = (first + last).toUpperCase();

								return (
									<View
										key={user.id}
										style={[
											{ marginLeft: i === 0 ? 0 : -8 },
											styles.avatarContainer,
										]}
									>
										{profileImg ? (
											<Image
												source={{ uri: `${endpoints.baseURL}user_profile_img/${profileImg}` }}
												style={styles.avatar}
											/>
										) : (
											<View style={styles.avatarFallback}>
												<Text style={styles.avatarInitials}>{initials}</Text>
											</View>
										)}
									</View>
								);
							})}
						</ScrollView>

						<Ionicons name="chevron-forward" size={18} color="#742BDE" />
					</Pressable>
				</View>
				<View style={styles.rowBetween}>
					<Text style={styles.cardSubtitle}>
						{params?.assignedUsers?.map((user) => user.user.firstName).join(", ") || "N/A"}
					</Text>
				</View>
			</View>

			{/* Priority Section */}
			<View style={styles.card}>
				<View style={[styles.rowBetween, { backgroundColor: '#FAFAFB', paddingVertical: 10, paddingHorizontal: 8 }]}>
					<Text style={styles.cardTitle}>Priority</Text>
					<Text style={[styles.badge, params?.priority === "Low" && styles.badgeLow, params?.priority === "Medium" && styles.badgeMedium, params?.priority === "High" && styles.badgeHigh]}>
						#{params?.priority}
					</Text>
				</View>
				<View style={styles.rowBetween}>
					<Text style={styles.cardSubtitle}>Start Date</Text>
					<Text style={styles.cardSubtitle}>End Date</Text>
				</View>
				<View style={styles.rowBetween}>
					<Text style={styles.cardValue}>{moment(params?.createdAt).format('MMM DD, YYYY') || "N/A"}</Text>
					<Text style={styles.cardValue}>{moment(params?.end_date).format('MMM DD, YYYY') || "N/A"}</Text>
				</View>
			</View>

			{/* More Info */}
			<Pressable style={styles.card} onPress={() => setMoreInfoModalVisible(true)}>
				<View style={styles.rowBetween}>
					<Text style={styles.cardTitle}>More Info</Text>
					<Ionicons name="chevron-forward" size={18} color="#742BDE" />
				</View>
			</Pressable>

			{/* Parts Section */}
			<Pressable style={styles.card} onPress={() => setPartsModalVisible(true)}>
				<View style={styles.rowBetween}>
					<Text style={styles.cardTitle}>Parts</Text>
					<View style={styles.avatarRow}>
						<Text style={styles.linkText}>{params?.parts?.length || 0} Parts</Text>
						<Ionicons name="chevron-forward" size={18} color="#742BDE" />
					</View>
				</View>
			</Pressable>

			{/* Description Section */}
			<View style={styles.card}>
				<Text style={styles.cardTitle}>Description</Text>
				<Text style={styles.description}>
					{params?.description || "No description available."}
				</Text>
			</View>

			<AssignedUsersModal visible={userModalVisible} onClose={() => setUserModalVisible(false)} users={params?.assignedUsers} />

			<PartsInfoModal visible={partsModalVisible} onClose={() => setPartsModalVisible(false)} parts={params?.parts} />

			<MoreInfoModal visible={moreInfoModalVisible} onClose={() => setMoreInfoModalVisible(false)}
				estimatedTime={params?.estimated_time?.toString()} requestedBy={params?.assignedUsers[0]?.user?.firstName} createdOn={moment(params?.createdAt).format('DD/MM/YYYY')} />

		</ScrollView>
	)
}

const styles = StyleSheet.create({
	container: {
		flexGrow: 1,
		paddingVertical: 12,
		paddingHorizontal: 20,
	},
	card: {
		backgroundColor: "#F1F3F8",
		borderRadius: 8,
		padding: 14,
		marginBottom: 10,
		// shadowColor: "#00000099",
		// shadowOpacity: 0.05,
		// shadowRadius: 4,
		// elevation: 2,
		borderWidth: 0.3,
		borderColor: "rgba(0, 0, 0, 0.60)",
		gap: 5
	},
	cardTitle: {
		width: '50%',
		fontSize: 11,
		fontFamily: Fonts.regular,
		color: "#000000",
	},
	makeRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center"
	},
	avatarRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 2,
		flexShrink: 1,
	},
	avatars: {
		flexDirection: "row",
		backgroundColor: 'red'
	},
	avatar: {
		width: 28,
		height: 28,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: "#fff",
	},
	cardSubtitle: {
		fontSize: 10,
		fontFamily: Fonts.medium,
		color: "#000",
	},
	cardValue: {
		fontSize: 10,
		fontFamily: Fonts.light,
		color: "#333",
	},
	rowBetween: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	badge: {
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 4,
		fontSize: 10,
		fontFamily: Fonts.regular,
		color: "#742BDE",
		borderColor: "#742BDE",
		borderWidth: 1,
	},
	badgeLow: { backgroundColor: "rgba(116, 43, 222, 0.14);" },
	badgeMedium: { backgroundColor: "rgba(255, 213, 128, 0.14);" },
	badgeHigh: { backgroundColor: "rgba(255, 155, 155, 0.14);" },
	linkText: {
		fontSize: 10,
		fontFamily: Fonts.medium,
		color: "#742BDE",
	},
	description: {
		fontSize: 10,
		fontFamily: Fonts.light,
		color: "#444",
	},
	avatarContainer: {
		width: 28,
		height: 28,
		borderRadius: 35 / 2,
		overflow: "hidden",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#f0f0f0",
	},
	avatarFallback: {
		width: "100%",
		height: "100%",
		borderRadius: 35 / 2,
		backgroundColor: "#9999FF", // or any accent color
		alignItems: "center",
		justifyContent: "center",
	},
	avatarInitials: {
		color: "#fff",
		fontWeight: "600",
		fontSize: 12,
	},

});
