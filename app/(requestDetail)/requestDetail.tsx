import Header from "@/components/global/Header";
import { Alert, Pressable, StyleSheet, Text, ToastAndroid, View } from "react-native";
import { FABIcon, WorkOrderCardLogo } from "@/constants/IconProvider";
import Fonts from "@/constants/Typography";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useCallback, useRef, useState } from "react";
import RejectModal from "@/components/request-detail/RejectModal.tsx";
import moment from "moment";
import { useWorkOrderStore } from "@/src/store/useWorkOrderStore";
import { deleteWorkRequest, getWorkRequestDetails, rejectWorkRequest } from "@/src/services/work-request.service";
import Popover from "react-native-popover-view";
import { WorkRequest } from "@/src/types/workRequest";

export default function WorkRequestDetail() {
	const params: any = useLocalSearchParams();
	const item = JSON.parse(params?.data);
	console.log('item rqe = ', item);

	const { setWorkForm } = useWorkOrderStore();
	const [rejectVisible, setRejectVisible] = useState(false);

	const [openPopover, setOpenPopover] = useState(false);
	const ellipsesRef = useRef<View>(null);
	const [workRequestData, setWorkRequestData] = useState<any>(item);

	const router = useRouter();

	useFocusEffect(
		useCallback(() => {
			console.log('in focus request detail')
			fetchWorkRequestDetails();
		}, [])
	);

	const fetchWorkRequestDetails = async () => {
		try {
			console.log('work req id = ', workRequestData.id);
			const res = await getWorkRequestDetails(workRequestData.id);
			console.log('work request details = ', res);
			if (res?.status) {
				setWorkRequestData(res?.data);
			}
		} catch (e) {
			console.log('e = ', e);
		}
	}

	const acceptRequest = async () => {
		console.log('accept request', workRequestData);

		setWorkForm("title", workRequestData?.title);
		setWorkForm("message", workRequestData?.description);
		setWorkForm("location", workRequestData?.location_id);
		setWorkForm("selected_asset", workRequestData?.asset_id);
		setWorkForm("nature_of_work", workRequestData?.problemType);
		setWorkForm("priority", workRequestData?.priority);
		setWorkForm("work_request_id", workRequestData?.id);
		setWorkForm("attachments", workRequestData?.files ?? null);

		// router.push("/newWorkOrder");
		router.push("/createWorkOrder");
	}

	const handleOpenEllipses = () => {
		console.log('open ellipses');
		setOpenPopover(true)
	}

	const handleDeleteRequest = async (item: WorkRequest) => {
		Alert.alert(
			"Delete Work Order",
			`Are you sure you want to delete ${item.title}?`,
			[
				{
					text: "Cancel",
					style: "cancel",
				},
				{
					text: "Delete",
					style: "destructive",
					onPress: async () => {
						console.log('deleting WO = ', item);
						// setDeleteLoading(true)
						try {
							const resp = await deleteWorkRequest(item?.id);
							console.log('resp = ', resp);
							if (resp?.status) {
								ToastAndroid.show("Work Order Deleted", ToastAndroid.SHORT);
								router.back();
								// setDeleteLoading(false)
							}
						} catch (e) {
							// setDeleteLoading(false)
							console.log('error deleting = ', e);
						}
					},
				},
			],
			{ cancelable: true }
		);
	}

	return (
		<>
			<Header title="Work Request Detail" showEllipses={true} openEllipses={handleOpenEllipses} ellipsesRef={ellipsesRef} />

			<Popover
				isVisible={openPopover}
				onRequestClose={() => setOpenPopover(false)}
				popoverStyle={{ borderRadius: 15 }}
				from={ellipsesRef}
			>
				<View style={styles.popoverContent}>
					{
						[
							{ icon: '', text: 'Select Option', type: 'heading' },
							{ icon: '', text: 'Edit', type: 'option' },
							{ icon: '', text: 'Delete', type: 'option' }
						].map((option, index) => {
							return (
								<Pressable
									style={styles.popoverItem}
									key={index}
									onPress={async () => {
										if (index === 0) {

										} else if (index === 1) {
											console.log(item)
											router.push({
												pathname: "/newWorkRequest",
												params: {
													passedData: JSON.stringify(item),
													isEdit: 'true'
												},
											});
										} else if (index === 2) {
											handleDeleteRequest?.(item)
										}
										setOpenPopover(false)
									}}
								>
									<View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', justifyContent: 'flex-start' }}>
										{option.icon != '' && <Ionicons name={option.icon as any} size={16} color="#71717A" />}

										<Text style={
											[
												{ color: "#71717A", fontFamily: Fonts.regular },
												option.type == 'heading' ? { color: "#742BDE", fontFamily: Fonts.semiBold } : {}
											]
										}>
											{option.text}
										</Text>

										{/* {
														(deleteLoading && index === 3) && <ActivityIndicator size={"small"} color={"#71717A"} />
													} */}
									</View>
								</Pressable>
							);
						})
					}
				</View>
			</Popover>


			<View style={styles.container}>
				<View style={styles.card}>
					<View style={styles.textContainer}>
						<Text style={styles.title}>{workRequestData?.title}</Text>
						<Text style={styles.subText}>Requested By : {workRequestData?.createdBy?.firstName + " " + workRequestData?.createdBy?.lastName}</Text>
						<Text style={styles.subText}>Created On : {moment(workRequestData?.createdAt).format("MMM D, YYYY")}</Text>
					</View>

					<View style={styles.rightContainer}>
						<WorkOrderCardLogo />
						<View style={styles.tagButton}>
							<Text style={styles.tagText}>{workRequestData?.status}</Text>
						</View>
					</View>
				</View>

				<View style={styles.card}>
					<Text style={styles.title}>Status</Text>
					<Text style={styles.subText}>{workRequestData?.status}</Text>
				</View>

				<View style={styles.card}>
					<Text style={styles.title}>Location</Text>
					<Text style={styles.subText}>{workRequestData?.location_id?.location_name}</Text>
				</View>

				<View style={styles.card}>
					<Text style={styles.title}>Assets</Text>
					<Text style={styles.subText}>{workRequestData?.asset_id?.asset_name}</Text>
				</View>

				<View style={styles.descBox}>
					<Text style={styles.desText}>Description</Text>
					<Text style={styles.desText}>{workRequestData?.description}</Text>
				</View>

				{
					workRequestData?.status === "Open" && <View style={styles.actionButtons}>
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

			<RejectModal visible={rejectVisible} item={workRequestData} onCancel={() => setRejectVisible(false)}
				onSubmit={async (reason) => {
					setRejectVisible(false);
					try {
						const response = await rejectWorkRequest(workRequestData?.id, reason);
						if (response?.status) {
							ToastAndroid.show("Request Rejected Successfully", ToastAndroid.SHORT);
							router.back();
						}
					} catch (error: any) {
						console.error("Error rejecting work request:", error);
						if (!error?.status) {
							ToastAndroid.show(error?.message, ToastAndroid.SHORT);
						}
					}
				}} />
		</>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#F5F7FA",
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
	},
	popoverContent: {
		borderRadius: 20,
		backgroundColor: "#fff",
		padding: 10,
	},
	popoverItem: {
		width: 150,
		padding: 10,
	},
})