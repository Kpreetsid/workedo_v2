import Header from "@/components/global/Header";
import { Pressable, Text, StyleSheet, FlatList, View, Dimensions } from "react-native";
import Fonts from "@/constants/Typography";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import { TickIcon } from "@/constants/IconProvider";
import ActionButton from "@/components/create-screens/ActionButton";
import { router, useLocalSearchParams } from "expo-router";
import { getUsers } from "@/src/services/preventive.service";
import { usePreventiveStore } from "@/src/store/usePreventiveStore";
import { useWorkOrderStore } from "@/src/store/useWorkOrderStore";
import { useCreateAssetStore } from "@/src/store/useCreateAsset";
import { useCreateLocationStore } from "@/src/store/useCreateLocationStore";

const width = Dimensions.get("window").width;
export default function SelectUser() {
	const params: any = useLocalSearchParams();
	const comingFrom = params?.comingFrom;

	const [users, setUsers] = useState<any[]>([]);
	const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
	const { setPreventiveValue } = usePreventiveStore();
	const { setWorkForm } = useWorkOrderStore();

	const {setCreateAssetValue} = useCreateAssetStore();
	const {setCreateLocationValue} = useCreateLocationStore();

	const workOrderAssignedUsers: any = useWorkOrderStore((state) => state.assigned_users);
	const createAssetAssignedUsers: any = useCreateAssetStore((state) => state.assigned_users);
	const createLocationAssignedUsers: any = useCreateLocationStore((state) => state.assigned_users);

	useEffect(() => {
		fetchUsers();
	}, []);

	useEffect(() => {
		if (!users.length) return;

		if (comingFrom === "createAsset") {
			console.log('in select user = ', createAssetAssignedUsers);
			const preselected = users.filter((u) =>
				(createAssetAssignedUsers || []).some(
					(sel: any) => (sel.user?.id || sel.id) === (u._id || u.id)
				)
			);

			setSelectedUsers(preselected);

		} else if(comingFrom === "createLocation") {
			// no need to preselect because its a new location, so no user will be preselected
			
			// const preselected = users.filter((u) =>
			// 	(createLocationAssignedUsers || []).some(
			// 		(sel: any) => (sel.user?.id || sel.id) === (u._id || u.id)
			// 	)
			// );

			// setSelectedUsers(preselected);
		}
		else {
			const preselected = users.filter((u) =>
				(workOrderAssignedUsers || []).some(
					(sel: any) => (sel._id || sel.id) === (u._id || u.id)
				)
			);

			setSelectedUsers(preselected);
		}

	}, [users, workOrderAssignedUsers]);

	const fetchUsers = async () => {
		try {
			const res = await getUsers();
			if (res?.status && Array.isArray(res?.data)) {
				console.log('users = ', res?.data);
				setUsers(res.data);
			}
		} catch (err) {
			console.error("Error fetching users:", err);
		}
	};

	// ✅ Toggle selection
	const toggleUserSelection = (user: any) => {
		const userId = user._id || user.id;

		const alreadySelected = selectedUsers.some(
			(u) => (u._id || u.id) === userId
		);

		if (alreadySelected) {
			setSelectedUsers(selectedUsers.filter((u) => (u._id || u.id) !== userId));
		} else {
			setSelectedUsers([...selectedUsers, user]);
		}
	};

	// ✅ Confirm selection
	const handleConfirm = () => {
		if (selectedUsers.length === 0) return;

		// Save all selected users into preventive store
		if (comingFrom === "newWorkOrder") {
			console.log('selected users in select user = ', selectedUsers);
			setWorkForm("assigned_users", selectedUsers);
		} else if(comingFrom === "createAsset") {
			setCreateAssetValue("assigned_users", selectedUsers);
		} else if(comingFrom === "createLocation") {
			setCreateLocationValue("assigned_users", selectedUsers);
		} else {
			setPreventiveValue("assigned_users", selectedUsers);
		}
		router.back();
	};

	return (
		<>
			<Header title="Select User" />
			<FlatList
				data={users}
				keyExtractor={(item) =>
					item.id?.toString() ||
					item._id?.toString() ||
					Math.random().toString()
				}
				renderItem={({ item }) => {
					const isSelected = selectedUsers.some(
						(u) => (u._id || u.id) === (item._id || item.id)
					);
					return (
						<Pressable
							style={[
								styles.userButton,
								isSelected && { borderColor: "#A259FF", backgroundColor: "#F4EDFF" },
							]}
							onPress={() => toggleUserSelection(item)}
						>
							{isSelected ? (
								<View style={styles.tickIcon}>
									<TickIcon />
								</View>
							) : (
								<LinearGradient colors={["#A259FF", "#C7AAF2"]} style={styles.initials}>
									<Text style={styles.initialText}>
										{
											item?.username
												?.split(" ")
												.map((part: string) => part[0])
												.join("")
												.toUpperCase()
										}
									</Text>
								</LinearGradient>
							)}
							<Text style={styles.userText}>
								{item?.firstName + "--" + item?.user_role}
							</Text>
						</Pressable>
					);
				}}
				contentContainerStyle={styles.contentContainer}
			/>
			<ActionButton onPress={handleConfirm} label="Confirm User" buttonStyle={styles.actionButton} />
		</>
	)
}

const styles = StyleSheet.create({
	contentContainer: {
		flexGrow: 1,
		backgroundColor: "#F5F7FA",
		paddingHorizontal: 25,
		paddingTop: 15,
		paddingBottom: 105,
		gap: 10
	},
	userButton: {
		borderWidth: 1,
		borderColor: "#E1E8EE66",
		borderRadius: 7,
		backgroundColor: "#EFF2FC",
		height: 50,
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 20,
		gap: 10
	},
	initials: {
		width: 35,
		height: 35,
		borderRadius: 18,
		alignItems: "center",
		justifyContent: "center"
	},
	tickIcon: {
		width: 35,
		height: 35,
		borderRadius: 18,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#742BDE",
	},
	initialText: {
		color: "#FFFFFF",
		fontSize: 10,
		fontFamily: Fonts.semiBold
	},
	userText: {
		fontSize: 10,
		fontFamily: Fonts.semiBold,
		color: "#201F23",
	},
	actionButton: {
		position: "absolute",
		bottom: "2%",
		alignSelf: "center",
		width: width - 50
	}
})
