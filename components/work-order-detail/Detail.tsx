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
import { useRouter } from "expo-router";

interface Props {
	params: WorkOrder;
}

export default function Detail({ params }: Props) {
	const router = useRouter();
	const [userModalVisible, setUserModalVisible] = useState(false);
	const [partsModalVisible, setPartsModalVisible] = useState(false);
	const [moreInfoModalVisible, setMoreInfoModalVisible] = useState(false);

	const assignedUsers = Array.isArray(params?.assignedUsers) ? params.assignedUsers : [];
	const childOrders = Array.isArray(params?.childOrders) ? params.childOrders : [];
	const procedures = Array.isArray(params?.procedure_entries)
		? params.procedure_entries
		: Array.isArray(params?.procedures)
			? params.procedures
			: [];

	const assignedUserNames = assignedUsers
		.map((entry) => [entry?.user?.firstName, entry?.user?.lastName].filter(Boolean).join(" "))
		.filter(Boolean)
		.join(", ") || "N/A";

	const requestedBy = params?.createdBy && typeof params.createdBy === "object"
		? [params.createdBy.firstName, params.createdBy.lastName].filter(Boolean).join(" ")
		: "--";

	const createdOn = params?.createdAt ? moment(params.createdAt).format("DD/MM/YYYY hh:mm A") : "--";
	const estimatedTime = params?.estimated_time?.toString() || "--";
	const childSummary = params?.hierarchy?.childStatusSummary;

	return (
		<ScrollView style={styles.container}>
			{params?.hierarchy?.executionOwnedByChildren ? (
				<View style={styles.infoBanner}>
					<Text style={styles.infoBannerTitle}>Execution owned by child work orders</Text>
					<Text style={styles.infoBannerText}>
						Parts, procedures, labor, and actual execution updates should be recorded on the child work orders for this parent.
					</Text>
				</View>
			) : null}

			{params?.parentOrder || params?.hierarchy?.parentReference ? (
				<Pressable
					style={styles.linkCard}
					onPress={() => {
						const parent = params?.parentOrder || params?.hierarchy?.parentReference;
						router.push({
							pathname: "/workOrderDetail",
							params: {
								id: parent?.id || parent?._id,
								composite_id: parent?.order_no,
							},
						});
					}}
				>
					<View style={{ flex: 1 }}>
						<Text style={styles.cardTitle}>Parent Work Order</Text>
						<Text style={styles.cardValue}>
							{params?.parentOrder?.order_no || params?.hierarchy?.parentReference?.order_no} - {params?.parentOrder?.title || params?.hierarchy?.parentReference?.title}
						</Text>
					</View>
					<Ionicons name="chevron-forward" size={18} color="#742BDE" />
				</Pressable>
			) : null}

			{params?.hierarchy?.isParentWorkOrder ? (
				<View style={styles.card}>
					<Text style={styles.cardTitle}>Child Work Order Progress</Text>
					<Text style={styles.cardSubtitle}>
						{params?.hierarchy?.childProgressLabel || `${childSummary?.completed || 0}/${childSummary?.total || 0} completed`}
					</Text>
					<View style={[styles.rowBetween, { marginTop: 8 }]}>
						<Text style={styles.cardValue}>Open: {childSummary?.open || 0}</Text>
						<Text style={styles.cardValue}>In Progress: {childSummary?.in_progress || 0}</Text>
					</View>
					<View style={[styles.rowBetween, { marginTop: 4 }]}>
						<Text style={styles.cardValue}>On Hold: {childSummary?.on_hold || 0}</Text>
						<Text style={styles.cardValue}>Completed: {childSummary?.completed || 0}</Text>
					</View>
				</View>
			) : null}

			{childOrders.length > 0 ? (
				<View style={styles.card}>
					<Text style={styles.cardTitle}>Child Work Orders</Text>
					{childOrders.map((child) => (
						<Pressable
							key={child.id || child._id || child.order_no}
							style={styles.childRow}
							onPress={() => {
								router.push({
									pathname: "/workOrderDetail",
									params: {
										id: child.id || child._id,
										composite_id: child.order_no,
									},
								});
							}}
						>
							<View style={{ flex: 1 }}>
								<Text style={styles.childTitle}>{child.order_no} - {child.title}</Text>
								<Text style={styles.childMeta}>{child.status}</Text>
							</View>
							<Ionicons name="chevron-forward" size={18} color="#742BDE" />
						</Pressable>
					))}
				</View>
			) : null}

			{Array.isArray(params?.inventoryWarnings) && params.inventoryWarnings.length > 0 ? (
				<View style={styles.warningCard}>
					<Text style={styles.warningTitle}>Inventory warnings</Text>
					{params.inventoryWarnings.map((warning, index) => (
						<Text key={`${warning.part_id || warning.part_name}-${index}`} style={styles.warningText}>
							{warning.part_name || "Part"}: {warning.message || `Need ${warning.quantity || 0}`}
						</Text>
					))}
				</View>
			) : null}

			<View style={styles.card}>
				<View style={[styles.makeRow, styles.sectionHeader]}>
					<Text style={styles.cardTitle}>Assigned to</Text>
					<Pressable style={styles.avatarRow} onPress={() => setUserModalVisible(true)}>
						<ScrollView
							horizontal
							showsHorizontalScrollIndicator={false}
							contentContainerStyle={{ alignItems: "center" }}
							style={{ maxWidth: 150 }}
						>
							{assignedUsers.map((user, i) => {
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
					<Text style={styles.cardSubtitle}>{assignedUserNames}</Text>
				</View>
			</View>

			<View style={styles.card}>
				<View style={[styles.rowBetween, styles.sectionHeader]}>
					<Text style={styles.cardTitle}>Priority</Text>
					<Text style={[
						styles.badge,
						params?.priority === "Low" && styles.badgeLow,
						params?.priority === "Medium" && styles.badgeMedium,
						params?.priority === "High" && styles.badgeHigh,
						params?.priority === "Urgent" && styles.badgeHigh,
					]}>
						#{params?.priority || "None"}
					</Text>
				</View>
				<View style={styles.rowBetween}>
					<Text style={styles.cardSubtitle}>Start Date</Text>
					<Text style={styles.cardSubtitle}>End Date</Text>
				</View>
				<View style={styles.rowBetween}>
					<Text style={styles.cardValue}>{params?.start_date ? moment(params.start_date).format("MMM DD, YYYY") : "N/A"}</Text>
					<Text style={styles.cardValue}>{params?.end_date ? moment(params.end_date).format("MMM DD, YYYY") : "N/A"}</Text>
				</View>
			</View>

			<Pressable style={styles.card} onPress={() => setMoreInfoModalVisible(true)}>
				<View style={styles.rowBetween}>
					<Text style={styles.cardTitle}>More Info</Text>
					<Ionicons name="chevron-forward" size={18} color="#742BDE" />
				</View>
			</Pressable>

			<Pressable style={styles.card} onPress={() => setPartsModalVisible(true)}>
				<View style={styles.rowBetween}>
					<Text style={styles.cardTitle}>Parts</Text>
					<View style={styles.avatarRow}>
						<Text style={styles.linkText}>{params?.parts?.length || 0} Parts</Text>
						<Ionicons name="chevron-forward" size={18} color="#742BDE" />
					</View>
				</View>
			</Pressable>

			{procedures.length > 0 ? (
				<View style={styles.card}>
					<Text style={styles.cardTitle}>Linked Procedures</Text>
					{procedures.map((procedure) => (
						<View key={procedure.id} style={styles.procedureRow}>
							<Text style={styles.procedureName}>{procedure.name}</Text>
							<Text style={styles.procedureMeta}>
								{procedure.submitted ? "Submitted" : "Pending"}
								{procedure.score_summary?.percentage !== undefined && procedure.score_summary?.percentage !== null
									? ` - ${procedure.score_summary.percentage}%`
									: ""}
							</Text>
						</View>
					))}
				</View>
			) : null}

			<View style={styles.card}>
				<Text style={styles.cardTitle}>Description</Text>
				<Text style={styles.description}>
					{params?.description || "No description available."}
				</Text>
			</View>

			<AssignedUsersModal visible={userModalVisible} onClose={() => setUserModalVisible(false)} users={params?.assignedUsers} />

			<PartsInfoModal visible={partsModalVisible} onClose={() => setPartsModalVisible(false)} parts={params?.parts} />

			<MoreInfoModal
				visible={moreInfoModalVisible}
				onClose={() => setMoreInfoModalVisible(false)}
				estimatedTime={estimatedTime}
				requestedBy={requestedBy}
				createdOn={createdOn}
			/>
		</ScrollView>
	);
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
		borderWidth: 0.3,
		borderColor: "rgba(0, 0, 0, 0.60)",
		gap: 5,
	},
	linkCard: {
		backgroundColor: "#F0F5FF",
		borderRadius: 8,
		padding: 14,
		marginBottom: 10,
		borderWidth: 0.8,
		borderColor: "#ADC6FF",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	infoBanner: {
		backgroundColor: "#FFF7E6",
		borderRadius: 8,
		padding: 12,
		marginBottom: 10,
		borderWidth: 0.8,
		borderColor: "#FFD591",
	},
	infoBannerTitle: {
		fontSize: 11,
		fontFamily: Fonts.semiBold,
		color: "#7A4A00",
		marginBottom: 4,
	},
	infoBannerText: {
		fontSize: 10,
		fontFamily: Fonts.regular,
		color: "#7A4A00",
	},
	warningCard: {
		backgroundColor: "#FFF1F0",
		borderRadius: 8,
		padding: 12,
		marginBottom: 10,
		borderWidth: 0.8,
		borderColor: "#FFA39E",
	},
	warningTitle: {
		fontSize: 11,
		fontFamily: Fonts.semiBold,
		color: "#A8071A",
		marginBottom: 4,
	},
	warningText: {
		fontSize: 10,
		fontFamily: Fonts.regular,
		color: "#7F1D1D",
		marginBottom: 3,
	},
	cardTitle: {
		width: "50%",
		fontSize: 11,
		fontFamily: Fonts.regular,
		color: "#000000",
	},
	sectionHeader: {
		backgroundColor: "#FAFAFB",
		paddingVertical: 10,
		paddingHorizontal: 8,
	},
	makeRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	avatarRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 2,
		flexShrink: 1,
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
	badgeLow: { backgroundColor: "rgba(116, 43, 222, 0.14)" },
	badgeMedium: { backgroundColor: "rgba(255, 213, 128, 0.24)" },
	badgeHigh: { backgroundColor: "rgba(255, 155, 155, 0.24)" },
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
	childRow: {
		paddingVertical: 8,
		borderTopWidth: 0.5,
		borderTopColor: "#D6DEE6",
		flexDirection: "row",
		alignItems: "center",
	},
	childTitle: {
		fontSize: 10,
		fontFamily: Fonts.medium,
		color: "#111827",
	},
	childMeta: {
		fontSize: 10,
		fontFamily: Fonts.regular,
		color: "#64748B",
		marginTop: 2,
	},
	procedureRow: {
		paddingTop: 8,
		borderTopWidth: 0.5,
		borderTopColor: "#D6DEE6",
	},
	procedureName: {
		fontSize: 10,
		fontFamily: Fonts.medium,
		color: "#111827",
	},
	procedureMeta: {
		fontSize: 10,
		fontFamily: Fonts.regular,
		color: "#64748B",
		marginTop: 2,
	},
	avatarContainer: {
		width: 28,
		height: 28,
		borderRadius: 14,
		overflow: "hidden",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#f0f0f0",
	},
	avatarFallback: {
		width: "100%",
		height: "100%",
		borderRadius: 14,
		backgroundColor: "#9999FF",
		alignItems: "center",
		justifyContent: "center",
	},
	avatarInitials: {
		color: "#fff",
		fontWeight: "600",
		fontSize: 12,
	},
});
