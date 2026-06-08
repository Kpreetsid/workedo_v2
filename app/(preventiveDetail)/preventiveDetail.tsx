import Header from "@/components/global/Header";
import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Dimensions, Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Fonts from "@/constants/Typography";
import { AssignUserRightIcon } from "@/constants/IconProvider";
import { useEffect, useState } from "react";
import AssignedUsersModal from "@/components/work-order-detail/AssignUserModal";
import PartsInfoModal from "@/components/work-order-detail/PartsInfoModal";
import MoreInfoModal from "@/components/work-order-detail/MoreInfoModal";
import { endpoints } from "@/src/api/endpoints";
import moment from "moment";
import { getSOPs, toggleWorkOrderStatus } from "@/src/services/preventive.service";
import PreventiveDetails from "./Preventive-details";
import PreventiveForm from "./Preventive-form";
import Tasks from "@/components/work-order-detail/Tasks";
import { TabView } from "react-native-tab-view";
import { parseJsonRouteParam } from "@/src/utils/routeParams";

export default function PreventiveDetail() {
	const params: any = useLocalSearchParams();
	let item = parseJsonRouteParam<any>(params?.data, {});

	const [preventiveDetails, setPreventiveDetails] = useState(item);
	const [preventiveStatus, setPreventiveStatus] = useState(item?.schedule?.enabled);
	const layout = Dimensions.get("window");
	const [index, setIndex] = useState(0);
	const [routes] = useState([
		{ key: "details", title: "Details" },
		{ key: "tasks", title: "Tasks" },
		{ key: "forms", title: "Forms" },
	]);

	const [userModalVisible, setUserModalVisible] = useState(false);
	const [partsModalVisible, setPartsModalVisible] = useState(false);
	const [moreInfoModalVisible, setMoreInfoModalVisible] = useState(false);

	const toggleStatus = async () => {
		try {
			let scheduleEnabled = !item.schedule.enabled;
			item.schedule.enabled = scheduleEnabled;
			console.log('item schedule = ', item?.schedule);
			const resp = await toggleWorkOrderStatus(item?.id, item);
			console.log('resp = ', resp);
			if (resp?.status) {
				setPreventiveStatus(resp?.data?.schedule?.enabled);
			}
		} catch (error) {
			console.log('error = ', error);
		}
	}

	useEffect(() => {
		console.log('preventive details = ', preventiveDetails);
	}, [preventiveDetails])

	return (
		<View style={{ backgroundColor: "#F5F7FA", flex: 1 }}>
			<Header title="Preventive Details" />

			<View style={styles.tabBar}>
				{routes.map((route, i) => {
					const isActive = i === index;
					return (
						<TouchableOpacity
							key={route.key}
							style={[styles.tabItem, isActive && styles.activeTab]}
							onPress={() => setIndex(i)}
						>
							<Text style={[styles.tabText, isActive && styles.activeTabText]}>
								{route.title}
							</Text>
						</TouchableOpacity>
					);
				})}
			</View>

			<TabView
				navigationState={{ index, routes }}
				renderScene={({ route }) => {
					switch (route.key) {
						case "details":
							return <PreventiveDetails item={preventiveDetails} />;
						case "tasks":
							return <Tasks params={preventiveDetails?.work_order} />;
						case "forms":
							return <PreventiveForm item={preventiveDetails} />;
						default:
							return null;
					}
				}}
				onIndexChange={setIndex}
				initialLayout={{ width: layout.width }}
				renderTabBar={() => null}
			/>




			{/* <View style={styles.header}>
				<Text style={styles.woType}>Preventive</Text>
				<Text style={styles.woTitle}>{preventiveDetails.title}</Text>
			</View>

			<View style={styles.statusInfo}>
				<Text style={styles.statusInfoText}>Status</Text>
				<Pressable style={[styles.statusView, { backgroundColor: preventiveStatus ? "#00B227" : "#FF0400" }]} onPress={toggleStatus}>
					<Text style={styles.statusText}>{preventiveStatus ? "Active" : "In Active"}</Text>
				</Pressable>
			</View>

			<View style={styles.detailContainer}>

				<View style={styles.card}>
					<Pressable style={styles.makeRow} onPress={() => setUserModalVisible(true)}>
						<Text style={styles.cardTitle}>Assigned to</Text>
						<View style={styles.avatarRow}>
							<View style={styles.avatars}>
								{preventiveDetails?.work_order?.users?.map((user: any, i: any) => {
									const profileImg = user?.user_profile_img;
									const first = user?.firstName?.[0] || "";
									const last = user?.lastName?.[0] || "";
									const initials = (first + last).toUpperCase();

									return (
										<View
											key={i}
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
							</View>
							<AssignUserRightIcon />
						</View>
					</Pressable>
					<View style={styles.rowBetween}>
						<Text style={styles.cardSubtitle}>{preventiveDetails.assignedTo || "N/A"}</Text>
					</View>
				</View>

				<Pressable style={styles.card} onPress={() => setMoreInfoModalVisible(true)}>
					<View style={styles.rowBetween}>
						<Text style={styles.cardTitle}>Location</Text>
						<Text style={[styles.linkText, { color: "#000" }]}>{preventiveDetails?.work_order?.location?.location_name}</Text>
					</View>
				</Pressable>

				<Pressable style={styles.card}>
					<View style={styles.rowBetween}>
						<Text style={styles.cardTitle}>Asset</Text>
						<View style={styles.avatarRow}>
							<Text style={styles.linkText}>{preventiveDetails?.work_order?.asset?.asset_name}</Text>
							<AssignUserRightIcon />
						</View>
					</View>
				</Pressable>

				<Pressable style={styles.card} onPress={() => setMoreInfoModalVisible(true)}>
					<View style={styles.rowBetween}>
						<Text style={styles.cardTitle}>More Info</Text>
						<AssignUserRightIcon />
					</View>
				</Pressable>

				<Pressable style={styles.card} onPress={() => setPartsModalVisible(true)}>
					<View style={styles.rowBetween}>
						<Text style={styles.cardTitle}>Parts</Text>
						<View style={styles.avatarRow}>
							<Text style={styles.linkText}>{preventiveDetails?.work_order?.parts.length || 0} Parts</Text>
							<AssignUserRightIcon />
						</View>
					</View>
				</Pressable>
			</View>

			<View style={styles.detailContainer}>
				<Text style={styles.cardTitle}>Description</Text>
				<Text style={styles.description}>
					{preventiveDetails?.work_order?.description || "No description available."}
				</Text>
			</View>
			<AssignedUsersModal
				visible={userModalVisible}
				onClose={() => setUserModalVisible(false)}
				users={preventiveDetails?.work_order?.users}
			/>

			<PartsInfoModal visible={partsModalVisible} onClose={() => setPartsModalVisible(false)} parts={preventiveDetails?.work_order?.parts} />

			<MoreInfoModal visible={moreInfoModalVisible} onClose={() => setMoreInfoModalVisible(false)}
				estimatedTime={preventiveDetails?.work_order?.estimated_time} requestedBy={preventiveDetails?.createdBy?.firstName + " " + preventiveDetails?.createdBy?.lastName} createdOn={moment(preventiveDetails?.work_order?.createdAt).format("MMM DD, YYYY")} /> */}
		</View>
	)
}

const styles = StyleSheet.create({
	tabBar: {
		flexDirection: "row",
		justifyContent: "space-between",
		paddingHorizontal: 20,
		marginTop: 12,
		marginBottom: 10,
	},
	tabItem: {
		paddingVertical: 8,
		paddingHorizontal: 16,
		borderRadius: 30,
	},
	activeTab: {
		backgroundColor: "#742BDE",
	},
	tabText: {
		fontSize: 12,
		fontFamily: Fonts.regular,
		color: "#000",
	},
	activeTabText: {
		color: "#fff",
		fontFamily: Fonts.semiBold,
	},
	header: {
		backgroundColor: "#742BDE",
		borderRadius: 8,
		padding: 16,
		margin: 20,
		gap: 4
	},
	woType: {
		fontSize: 11,
		fontFamily: Fonts.regular,
		color: "#742BDE",
		backgroundColor: "#fff",
		alignSelf: "flex-start",
		paddingHorizontal: 10,
		paddingVertical: 3,
		borderRadius: 4
	},
	woTitle: {
		fontSize: 12,
		fontFamily: Fonts.semiBold,
		color: "#fff",
	},
	statusInfo: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingVertical: 15,
		paddingHorizontal: 20,
		backgroundColor: "#fff",
		marginHorizontal: 20,
		borderRadius: 10
	},
	statusInfoText: {
		fontFamily: Fonts.semiBold,
		fontSize: 12
	},
	statusView: {
		paddingVertical: 7,
		paddingHorizontal: 15,
		alignItems: "center",
		justifyContent: "center",
		borderRadius: 5
	},
	statusText: {
		fontFamily: Fonts.regular,
		fontSize: 10,
		color: "#fff",
	},
	detailContainer: {
		backgroundColor: "#F1F3F8",
		borderRadius: 4,
		padding: 15,
		marginHorizontal: 20,
		marginTop: 20,
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: "#000000",
	},
	card: {
		backgroundColor: "#fff",
		borderRadius: 8,
		padding: 14,
		marginBottom: 10,
		shadowColor: "#00000099",
		shadowOpacity: 0.05,
		shadowRadius: 4,
		elevation: 2,
		borderWidth: 0.1,
		borderColor: "#00000099",
		gap: 5
	},
	cardTitle: {
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
		gap: 10,
	},
	avatars: {
		flexDirection: "row",
	},
	avatar: {
		width: 25,
		height: 25,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: "#fff",
	},
	cardSubtitle: {
		fontSize: 10,
		fontFamily: Fonts.light,
		color: "#666",
	},
	rowBetween: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
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
		width: 25,
		height: 25,
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
		borderWidth: 1,
		borderColor: "#fff",
	},

	avatarInitials: {
		color: "#fff",
		fontWeight: "600",
		fontSize: 12,
	},
})
