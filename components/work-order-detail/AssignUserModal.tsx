import { FC, useState } from "react";
import { View, Text, StyleSheet, Modal, TextInput, FlatList, Image, TouchableOpacity, Pressable, Dimensions } from "react-native";
import Fonts from "@/constants/Typography";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { CloseIcon } from "@/constants/IconProvider";
import { AssignedUser } from "@/src/types/workOrder";
import { endpoints } from "@/src/api/endpoints";

interface AssignedUsersModalProps {
	visible: boolean;
	onClose: () => void;
	users: AssignedUser[];
}

const { height } = Dimensions.get("window");

const AssignedUsersModal: FC<AssignedUsersModalProps> = ({ visible, onClose, users }) => {
	const [search, setSearch] = useState("");

	const filteredUsers = users.filter((u) => u?.user?.firstName?.toLowerCase().includes(search.toLowerCase()));

	return (
		<Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} >
			<Pressable style={styles.modalOverlay} onPress={onClose}>
				<KeyboardAvoidingView contentContainerStyle={styles.bottomSheet} behavior="position" keyboardVerticalOffset={30}>
					<View style={styles.handle} />
					<View style={styles.headerRow}>
						<Text style={styles.sheetTitle}>Assigned Users</Text>
						<Pressable onPress={onClose}>
							<CloseIcon />
						</Pressable>
					</View>


					<TextInput
						placeholder="Search users..."
						placeholderTextColor="#888"
						value={search}
						onChangeText={setSearch}
						style={styles.searchInput}
					/>

					<FlatList
						data={filteredUsers}
						keyExtractor={(item) => item.id}
						renderItem={({ item }) => {
							const profileImg = item?.user?.user_profile_img;
							const first = item?.user?.firstName?.[0] || "";
							const last = item?.user?.lastName?.[0] || "";
							const initials = (first + last).toUpperCase();

							return (
								<TouchableOpacity style={styles.userRow}>
									{profileImg ? (
										<Image
											source={{ uri: `${endpoints.baseURL}user_profile_img/${profileImg}` }}
											style={styles.userAvatar}
										/>
									) : (
										<View style={styles.avatarFallback}>
											<Text style={styles.avatarInitials}>{initials}</Text>
										</View>
									)}

									<Text style={styles.userName}>{item?.user?.firstName}</Text>
								</TouchableOpacity>
							);
						}}
						keyboardShouldPersistTaps="handled"
						showsVerticalScrollIndicator={false}
						style={{ maxHeight: height * 0.23 }}
					/>
				</KeyboardAvoidingView>
			</Pressable>
		</Modal>
	);
};

const styles = StyleSheet.create({
	modalOverlay: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.3)",
		justifyContent: "flex-end"
	},
	bottomSheet: {
		backgroundColor: "#fff",
		borderTopLeftRadius: 32,
		borderTopRightRadius: 32,
		paddingHorizontal: 20,
		paddingTop: 10,
		paddingBottom: 40
	},
	handle: {
		width: 60,
		height: 3,
		alignSelf: "center",
		backgroundColor: "#742BDE30",
		borderRadius: 10,
		marginBottom: 10,
	},
	headerRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	sheetTitle: {
		fontFamily: Fonts.semiBold,
		fontSize: 13,
		color: "#742BDE",
	},
	searchInput: {
		backgroundColor: "#F0F0F0",
		borderRadius: 8,
		paddingHorizontal: 12,
		paddingVertical: 8,
		fontFamily: Fonts.regular,
		fontSize: 11,
		marginVertical: 8,
	},
	userRow: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 8,
		gap: 10,
	},
	userAvatar: {
		width: 26,
		height: 26,
		borderRadius: 18,
	},
	userName: {
		fontFamily: Fonts.regular,
		fontSize: 11,
		color: "#000",
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
		width: 25,
		height: 25,
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
});

export default AssignedUsersModal;
