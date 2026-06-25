
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import Header from "@/src/components/global/Header";
import Fonts from "@/constants/Typography";

type MoreRoute = {
	title: string;
	description: string;
	icon: keyof typeof Ionicons.glyphMap;
	path: string;
};

const moduleRoutes: MoreRoute[] = [
	{
		title: "Requests",
		description: "Review, approve, reject, and create maintenance requests.",
		icon: "git-pull-request-outline",
		path: "/requests",
	},
	{
		title: "Parts Inventory",
		description: "Track spare parts, stock levels, and part details.",
		icon: "cube-outline",
		path: "/partsInventory",
	},
	{
		title: "Preventive",
		description: "Manage recurring schedules and preventive work.",
		icon: "calendar-outline",
		path: "/preventive",
	},
	{
		title: "Library",
		description: "Browse work order templates and reusable procedures.",
		icon: "library-outline",
		path: "/library",
	},
	{
		title: "Posts",
		description: "Share updates, comments, and maintenance notes.",
		icon: "newspaper-outline",
		path: "/posts",
	},
	{
		title: "Forms",
		description: "Browse SOP forms and checklist templates.",
		icon: "document-text-outline",
		path: "/forms",
	},
	{
		title: "Inspections",
		description: "Review assigned inspection tasks and reports.",
		icon: "clipboard-outline",
		path: "/inspections",
	},
	{
		title: "Alarm Module",
		description: "Review alarm overview and threshold readiness.",
		icon: "alert-circle-outline",
		path: "/alarmModule",
	},
	{
		title: "Report Module",
		description: "Open monitoring overview, health history, and sensor tracking.",
		icon: "bar-chart-outline",
		path: "/reportModule",
	},
	{
		title: "Admin Panel",
		description: "Manage users, access permissions, and mail alerts.",
		icon: "settings-outline",
		path: "/adminPanel",
	},
	{
		title: "Gateways",
		description: "Configure gateway devices and connected sensors.",
		icon: "hardware-chip-outline",
		path: "/gateways",
	},
	{
		title: "Monitoring",
		description: "Open PDM monitoring and equipment health views.",
		icon: "pulse-outline",
		path: "/monitoring",
	},
	{
		title: "Notifications",
		description: "View backend notifications and mark them as read.",
		icon: "notifications-outline",
		path: "/notifications",
	},
	{
		title: "My Account",
		description: "Update profile details and account preferences.",
		icon: "person-circle-outline",
		path: "/myAccount",
	},
];

export default function More() {
	const router = useRouter();

	return (
		<View style={styles.container}>
			<Header title="More" showBack={false} />
			<ScrollView contentContainerStyle={styles.content}>
				<Text style={styles.sectionTitle}>Modules</Text>
				<View style={styles.grid}>
					{moduleRoutes.map((item) => (
						<Pressable
							key={item.path}
							style={styles.card}
							onPress={() => router.push(item.path as never)}
						>
							<View style={styles.iconWrap}>
								<Ionicons name={item.icon} size={22} color="#742BDE" />
							</View>
							<View style={styles.cardText}>
								<Text style={styles.cardTitle}>{item.title}</Text>
								<Text style={styles.cardDescription}>{item.description}</Text>
							</View>
							<MaterialCommunityIcons name="chevron-right" size={24} color="#8B8B94" />
						</Pressable>
					))}
				</View>
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#F5F7FA",
	},
	content: {
		padding: 16,
		paddingBottom: 32,
	},
	sectionTitle: {
		fontFamily: Fonts.semiBold,
		fontSize: 16,
		color: "#222",
		marginBottom: 12,
	},
	grid: {
		gap: 10,
	},
	card: {
		minHeight: 82,
		backgroundColor: "#fff",
		borderRadius: 8,
		paddingHorizontal: 14,
		paddingVertical: 12,
		flexDirection: "row",
		alignItems: "center",
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: "#E7E4EF",
	},
	iconWrap: {
		width: 42,
		height: 42,
		borderRadius: 8,
		backgroundColor: "#F2EBFF",
		alignItems: "center",
		justifyContent: "center",
		marginRight: 12,
	},
	cardText: {
		flex: 1,
		paddingRight: 8,
	},
	cardTitle: {
		fontFamily: Fonts.semiBold,
		fontSize: 14,
		color: "#222",
		marginBottom: 3,
	},
	cardDescription: {
		fontFamily: Fonts.regular,
		fontSize: 12,
		lineHeight: 16,
		color: "#6B6875",
	},
});
