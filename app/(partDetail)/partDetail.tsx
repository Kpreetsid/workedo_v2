import Header from "@/components/global/Header";
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, ToastAndroid, View } from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";
import Fonts from "@/constants/Typography";
import { useCallback, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Part } from "@/src/types/part";
import { getPartById, updatePart } from "@/src/services/part.service";
import moment from "moment";

export default function partDetail() {
	const router = useRouter();
	const params: any = useLocalSearchParams();
	const data: Part = JSON.parse(params?.data);

	const [part, setPart] = useState(data);
	const [showAddStock, setShowAddStock] = useState(false);
	const [addQty, setAddQty] = useState("");
	const [refreshing, setRefreshing] = useState(false);
	const [savingStock, setSavingStock] = useState(false);

	const createdByName = part?.user
		? `${part.user.firstName} ${part.user.lastName}`.trim()
		: part?.createdBy || "-";
	const updatedByName = createdByName || "-";
	const createdOn = part?.createdAt ? moment(part.createdAt).format("DD-MM-YYYY hh:mm A") : "-";
	const updatedOn = part?.updatedAt ? moment(part.updatedAt).format("DD-MM-YYYY hh:mm A") : "-";
	const addQtyNumber = Number(addQty) || 0;
	const newQuantity = (Number(part?.quantity) || 0) + addQtyNumber;

	const handleAddStock = async () => {
		if (!addQty || Number(addQty) <= 0) {
			ToastAndroid.show("Please enter a valid quantity", ToastAndroid.SHORT);
			return;
		}
		if (savingStock) return;
		setSavingStock(true);
		try {
			const res = await updatePart(part?.id, String(newQuantity));
			if (res?.status) {
				setPart({ ...part, quantity: newQuantity });
				setAddQty("");
				setShowAddStock(false);
				ToastAndroid.show("Part Updated Successfully!", ToastAndroid.SHORT);
			}
		} catch (e: any) {
			console.log(e);
			ToastAndroid.show("Failed to update part", ToastAndroid.SHORT);
		} finally {
			setSavingStock(false);
		}
	};

	const handleRefresh = useCallback(async () => {
		const partId = part?.id || part?._id || data?.id || data?._id;
		if (!partId) return;
		setRefreshing(true);
		try {
			const res = await getPartById(partId);
			if (res?.status) {
				const fresh = Array.isArray(res?.data) ? res?.data?.[0] : res?.data;
				if (fresh) setPart(fresh);
			}
		} catch (e: any) {
			console.log(e);
		} finally {
			setRefreshing(false);
		}
	}, [part, data]);

	return (
		<>
			<Header title={part?.part_name || "Part Detail"} />
			<ScrollView
				style={styles.container}
				contentContainerStyle={styles.content}
				refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
			>
				<View style={styles.tableCard}>
					<Text style={styles.sectionTitle}>Part Details</Text>

					<View style={styles.row}>
						<View style={styles.col}>
							<Text style={styles.label}>Part Name</Text>
							<Text style={styles.value}>{part?.part_name || "-"}</Text>
						</View>
						<View style={styles.col}>
							<Text style={styles.label}>Part Number</Text>
							<Text style={styles.value}>{part?.part_number || "-"}</Text>
						</View>
					</View>

					<View style={styles.row}>
						<View style={styles.col}>
							<Text style={styles.label}>Part Type</Text>
							<Text style={styles.value}>{part?.part_type || "-"}</Text>
						</View>
						<View style={styles.col}>
							<Text style={styles.label}>Unit</Text>
							<Text style={styles.value}>{part?.unit || "-"}</Text>
						</View>
					</View>

					<View style={styles.row}>
						<View style={styles.col}>
							<Text style={styles.label}>Quantity</Text>
							<Text style={styles.value}>{part?.quantity ?? "-"}</Text>
						</View>
						<View style={styles.col}>
							<Text style={styles.label}>Minimum Quantity</Text>
							<Text style={styles.value}>{part?.min_quantity ?? "-"}</Text>
						</View>
					</View>

					<View style={styles.row}>
						<View style={styles.col}>
							<Text style={styles.label}>Cost</Text>
							<Text style={styles.value}>{part?.cost ?? "-"}</Text>
						</View>
						<View style={styles.col}>
							<Text style={styles.label}>Location Name</Text>
							<Text style={styles.value}>{part?.location?.location_name || "-"}</Text>
						</View>
					</View>

					<View style={styles.row}>
						<View style={styles.col}>
							<Text style={styles.label}>Location Type</Text>
							<Text style={styles.value}>{part?.location?.location_type || "-"}</Text>
						</View>
						<View style={styles.col}>
							<Text style={styles.label}>Description</Text>
							<Text style={styles.value}>{part?.description || "-"}</Text>
						</View>
					</View>

					<View style={styles.row}>
						<View style={styles.col}>
							<Text style={styles.label}>Created By</Text>
							<Text style={styles.value}>{createdByName}</Text>
						</View>
						<View style={styles.col}>
							<Text style={styles.label}>Created On</Text>
							<Text style={styles.value}>{createdOn}</Text>
						</View>
					</View>

					<View style={[styles.row, styles.lastRow]}>
						<View style={styles.col}>
							<Text style={styles.label}>Updated By</Text>
							<Text style={styles.value}>{updatedByName}</Text>
						</View>
						<View style={styles.col}>
							<Text style={styles.label}>Updated On</Text>
							<Text style={styles.value}>{updatedOn}</Text>
						</View>
					</View>
				</View>

				<View style={styles.actionsRow}>
					<Pressable style={styles.addBtn} onPress={() => setShowAddStock(true)}>
						<FontAwesome6 name="plus" size={10} color="#fff" />
						<Text style={styles.btnText}>Add Stock</Text>
					</Pressable>
					<Pressable style={styles.closeBtn} onPress={() => router.back()}>
						<Text style={styles.closeText}>Close</Text>
					</Pressable>
				</View>

				{showAddStock && (
					<View style={styles.addStockCard}>
						<View style={styles.addStockRow}>
							<Text style={styles.label}>Add Stock Quantity</Text>
							<TextInput
								style={styles.input}
								value={addQty}
								onChangeText={setAddQty}
								placeholder="0"
								placeholderTextColor="#9CA3AF"
								keyboardType="numeric"
							/>
						</View>
						<View style={styles.newQtyRow}>
							<Text style={styles.newQtyText}>New Quantity: {newQuantity} {part?.unit || ""}</Text>
						</View>
						<View style={styles.actionsRow}>
							<Pressable style={styles.cancelBtn} onPress={() => {
								setAddQty("");
								setShowAddStock(false);
							}}>
								<Text style={styles.cancelText}>Cancel</Text>
							</Pressable>
							<Pressable style={[styles.saveBtn, savingStock && styles.saveBtnDisabled]} onPress={handleAddStock}>
								<Text style={styles.saveText}>{savingStock ? "Saving..." : "Save"}</Text>
							</Pressable>
						</View>
					</View>
				)}

				{/* Previous code:
				<View style={styles.addBtnContainer}>
					<Text style={styles.buttonTitle}>Add Quantity</Text>
					<Pressable style={styles.addBtn} onPress={() => setModalVisible(true)}>
						<FontAwesome6 name="plus" size={10} color="#fff" />
						<Text style={styles.btnText}>Add Stock</Text>
					</Pressable>
				</View>

				<View style={styles.detailRow}>
					<FormInput label="Location" labelStyle={styles.label} value={part?.location?.location_name} inputStyle={styles.value} inputContainer={styles.inputContainer}
						containerStyle={styles.textInput} required={false} editable={false} />
					<FormInput label="Part Number" labelStyle={styles.label} value={part?.part_number} inputStyle={styles.value} inputContainer={styles.inputContainer}
						containerStyle={styles.textInput} required={false} editable={false} />
					<FormInput label="Available Quantity" labelStyle={styles.label} value={part?.quantity.toString()} inputStyle={styles.value} inputContainer={styles.inputContainer}
						containerStyle={styles.textInput} required={false} editable={false} />
				</View>

				<View style={styles.detailRow}>
					<FormInput label="Min. Quantity" labelStyle={styles.label} value={part?.min_quantity.toString()} inputStyle={styles.value} inputContainer={styles.inputContainer}
						containerStyle={styles.textInput} required={false} editable={false} />
					<FormInput label="Unit Cost (Rs)" labelStyle={styles.label} value={part?.unit.toString()} inputStyle={styles.value} inputContainer={styles.inputContainer}
						containerStyle={styles.textInput} required={false} editable={false} />
					<FormInput label="Part Type" labelStyle={styles.label} value={part?.part_type} inputStyle={styles.value} inputContainer={styles.inputContainer}
						containerStyle={styles.textInput} required={false} editable={false} />
				</View>

				<View style={styles.descriptionContainer}>
					<Text style={styles.descriptionTitle}>Description</Text>
					<Text style={styles.descText}>{part?.description}</Text>
				</View>

				<UpdatePartInventoryModal
					part={part}
					visible={modalVisible} onClose={() => setModalVisible(false)}
					onSubmit={async (data) => {
						console.log("Inventory Updated:", data);
						setModalVisible(false);
						try {
							const res = await updatePart(part?.id, data?.total);
							if (res?.status) {
								setPart({ ...part, quantity: Number(data?.total) });
								ToastAndroid.show("Part Updated Successfully!", ToastAndroid.SHORT);
							}
						} catch (e: any) {
							console.log(e);
						}
					}}
				/>
				*/}
			</ScrollView>
		</>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#F5F7FA",
	},
	content: {
		paddingHorizontal: 20,
		paddingVertical: 16,
		paddingBottom: 40,
	},
	tableCard: {
		backgroundColor: "#fff",
		borderRadius: 8,
		paddingVertical: 10,
		paddingHorizontal: 12,
		borderWidth: 0.6,
		borderColor: "rgba(225, 232, 238, 0.80)",
	},
	sectionTitle: {
		fontSize: 12,
		fontFamily: Fonts.semiBold,
		color: "#742BDE",
		marginBottom: 6,
	},
	row: {
		flexDirection: "row",
		paddingVertical: 10,
		borderBottomWidth: 0.6,
		borderBottomColor: "#E1E8EE",
	},
	lastRow: {
		borderBottomWidth: 0,
	},
	col: {
		flex: 1,
		gap: 4,
		paddingRight: 10,
	},
	label: {
		fontSize: 10,
		fontFamily: Fonts.semiBold,
		color: "#201F23",
	},
	value: {
		fontSize: 10,
		fontFamily: Fonts.regular,
		color: "#111827",
	},
	actionsRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginTop: 16,
	},
	addBtn: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 6,
		backgroundColor: "#742BDE",
		borderRadius: 4,
		paddingHorizontal: 16,
		paddingVertical: 8,
		elevation: 2,
	},
	btnText: {
		fontSize: 11,
		fontFamily: Fonts.regular,
		color: "#fff",
	},
	closeBtn: {
		backgroundColor: "#6B7280",
		borderRadius: 6,
		paddingHorizontal: 16,
		paddingVertical: 8,
	},
	closeText: {
		fontSize: 11,
		fontFamily: Fonts.regular,
		color: "#fff",
	},
	addStockCard: {
		marginTop: 12,
		backgroundColor: "#FFF7F2",
		borderRadius: 8,
		padding: 12,
		borderWidth: 0.6,
		borderColor: "#F3D7C8",
	},
	addStockRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: 10,
	},
	input: {
		minWidth: 90,
		borderWidth: 1,
		borderColor: "#BFD1FF",
		borderRadius: 6,
		paddingHorizontal: 10,
		paddingVertical: 6,
		fontSize: 11,
		fontFamily: Fonts.regular,
		color: "#111827",
		backgroundColor: "#fff",
	},
	newQtyRow: {
		marginTop: 8,
		backgroundColor: "#FFF2E6",
		paddingVertical: 6,
		paddingHorizontal: 10,
		borderRadius: 6,
	},
	newQtyText: {
		fontSize: 11,
		fontFamily: Fonts.semiBold,
		color: "#201F23",
	},
	cancelBtn: {
		backgroundColor: "#3B4CCA",
		borderRadius: 6,
		paddingHorizontal: 16,
		paddingVertical: 8,
	},
	cancelText: {
		fontSize: 11,
		fontFamily: Fonts.regular,
		color: "#fff",
	},
	saveBtn: {
		backgroundColor: "#742BDE",
		borderRadius: 6,
		paddingHorizontal: 16,
		paddingVertical: 8,
	},
	saveBtnDisabled: {
		opacity: 0.6,
	},
	saveText: {
		fontSize: 11,
		fontFamily: Fonts.regular,
		color: "#fff",
	},
});
