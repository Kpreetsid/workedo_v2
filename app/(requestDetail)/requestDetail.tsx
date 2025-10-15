import Header from "@/components/global/Header";
import { Pressable, StyleSheet, Text, ToastAndroid, View } from "react-native";
import { WorkOrderCardLogo } from "@/constants/IconProvider";
import Fonts from "@/constants/Typography";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import RejectModal from "@/components/request-detail/RejectModal.tsx";
import moment from "moment";
import { useWorkOrderStore } from "@/src/store/useWorkOrderStore";
import { rejectWorkRequest } from "@/src/services/work-request.service";

export default function WorkRequestDetail() {
	const params: any = useLocalSearchParams();
	const item = JSON.parse(params?.data);

	const { workForm, setWorkForm } = useWorkOrderStore();
	const [rejectVisible, setRejectVisible] = useState(false);

	const router = useRouter();

	const acceptRequest = async () => {
		console.log('accept request', item);
		setWorkForm("title", item?.title);
		setWorkForm("message", item?.description);
		setWorkForm("location", item?.location_id);
		setWorkForm("selected_asset", item?.asset_id);
		setWorkForm("nature_of_work", item?.problemType);
		setWorkForm("priority", item?.priority);
		setWorkForm("work_request_id", item?.id);

		router.push("/newWorkOrder");
	}

	return (
		<>
			<Header title="Work Request Detail" />
			<View style={styles.container}>
				<View style={styles.card}>
					<View style={styles.textContainer}>
						<Text style={styles.title}>{item?.title}</Text>
						<Text style={styles.subText}>Requested By : {item?.createdBy?.firstName + " " + item?.createdBy?.lastName}</Text>
						<Text style={styles.subText}>Created On : {moment(item?.createdAt).format("MMM D, YYYY")}</Text>
					</View>

					<View style={styles.rightContainer}>
						<WorkOrderCardLogo />
						<View style={styles.tagButton}>
							<Text style={styles.tagText}>{item?.status}</Text>
						</View>
					</View>
				</View>

				<View style={styles.card}>
					<Text style={styles.title}>Status</Text>
					<Text style={styles.subText}>{item?.status}</Text>
				</View>

				<View style={styles.card}>
					<Text style={styles.title}>Location</Text>
					<Text style={styles.subText}>{item?.location_id?.location_name}</Text>
				</View>

				<View style={styles.card}>
					<Text style={styles.title}>Assets</Text>
					<Text style={styles.subText}>{item?.asset_id?.asset_name}</Text>
				</View>

				<View style={styles.descBox}>
					<Text style={styles.desText}>Description</Text>
					<Text style={styles.desText}>{item?.description}</Text>
				</View>

				{
					item?.status === "Open" && <View style={styles.actionButtons}>
						<Pressable style={[styles.actionBtn, { backgroundColor: "#FF0400" }]} onPress={() => setRejectVisible(true)}>
							<MaterialIcons name="cancel" size={15} color="#fff" />
							<Text style={styles.actionBtnTxt}>Reject</Text>
						</Pressable>

						<Pressable style={[styles.actionBtn, { backgroundColor: "#742bde" }]} onPress={acceptRequest}>
							<Ionicons name="checkmark-circle" size={15} color="#fff" />
							<Text style={styles.actionBtnTxt}>Accept</Text>
						</Pressable>
					</View>
				}
			</View>

			<RejectModal visible={rejectVisible} item={item} onCancel={() => setRejectVisible(false)}
				onSubmit={async (reason) => {
					setRejectVisible(false);
					try {
						const response = await rejectWorkRequest(item?.id, reason);
						if(response?.status) {
							ToastAndroid.show("Request Rejected Successfully", ToastAndroid.LONG);
							router.back();
						}
					} catch (error: any) {
						console.error("Error rejecting work request:", error);
						if(!error?.status) {
							ToastAndroid.show(error?.message, ToastAndroid.LONG);
						}
					}
				}} />
		</>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
		padding: 20
	},
	card: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		backgroundColor: "#f9f9ff",
		padding: 12,
		borderRadius: 5,
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
	descBox: {
		backgroundColor: "#f9f9ff",
		paddingHorizontal: 10,
		paddingBottom: 50,
		paddingTop: 5,
		borderRadius: 5,
		marginVertical: 6,
		shadowColor: "#000",
		shadowOpacity: 0.06,
		shadowOffset: { width: 0, height: 2 },
		shadowRadius: 3,
		elevation: 2,
	},
	desText: {
		fontSize: 11,
		fontFamily: Fonts.light,
		color: "#000",
	},
	actionButtons: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginTop: 30
	},
	actionBtn: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 5,
		paddingHorizontal: 20,
		paddingVertical: 10,
		width: "47%",
		borderRadius: 5
	},
	actionBtnTxt: {
		fontFamily: Fonts.regular,
		fontSize: 10,
		color: "#fff",
		lineHeight: 16
	}
})