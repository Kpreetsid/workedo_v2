import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import { Asset } from '@/src/types/asset';
import { usePreventiveStore } from '@/src/store/usePreventiveStore';
import { useWorkOrderStore } from '@/src/store/useWorkOrderStore';
import { useWorkRequestStore } from '@/src/store/useWorkRequestStore';
import { useRouter } from 'expo-router';
import Fonts from '@/constants/Typography';
import { Ionicons } from '@expo/vector-icons';
import Popover from 'react-native-popover-view';

interface SelectAssetCardInterface {
	item: Asset;
	isChild?: boolean;
	level?: number;
	comingFrom?: string;
}

const width = Dimensions.get("window").width;

const SelectAssetsCard = ({ item, isChild = false, level = 0, comingFrom }: SelectAssetCardInterface) => {
	console.log('asset card select item = ', item);
	const router = useRouter();
	const [selectedAsset, setSelectedAsset] = useState<Asset>();
	const [expandedAssetId, setExpandedAssetId] = useState<string | null>(null);

	const isExpanded = expandedAssetId === item.id;
	const hasChildren = item.childs && item.childs.length > 0;

	const { setPreventiveValue } = usePreventiveStore();
	const { setWorkForm } = useWorkOrderStore();
	const { setWorkRequestForm } = useWorkRequestStore();

	return (
		<>
			<Pressable style={
				[
					styles.locationButton,
					isExpanded ? {
						borderBottomLeftRadius: 0,
						borderBottomRightRadius: 0,
					} : {},
					{
						backgroundColor: selectedAsset?.id === item.id ? "#FFBF0080" : "#fff",
						borderColor: selectedAsset?.id === item.id ? "#FFC1074D" : "#99999933"
					},
				]
			}
				// style={[styles.locationButton, { backgroundColor: selectedAsset === item ? "#FFBF0080" : "#fff", borderColor: selectedAsset === item ? "#FFC1074D" : "#99999933" }]}
				onPress={() => {
					setSelectedAsset(item);
					// updating selected asset in zustand store while creating preventive
					if (comingFrom === "newWorkOrder") {
						setWorkForm("selected_asset", item);
						setWorkForm("assigned_users", item.userList);
					} else if (comingFrom === "newWorkRequest") {
						setWorkRequestForm("selected_asset", item);
					} else {
						setPreventiveValue("selected_asset", item);
					}
					router.back();
				}}
			>
				<View style={{ flexDirection: "column", alignItems: "flex-start", justifyContent: "center" }}>
					<View style={[
						styles.textRow,
						{
							marginLeft: level * 20
						}
					]}>
						{hasChildren && (
							<Pressable
								onPress={() => {
									console.log('expanding')
									setExpandedAssetId(isExpanded ? null : item.id);
								}}
							>
								<Ionicons
									name={isExpanded ? "chevron-down" : "chevron-forward"}
									size={14}
									color="black"
									style={hasChildren ? { display: 'flex' } : (isChild ? { display: 'none' } : { display: 'flex' })}
								/>
							</Pressable>
						)}

						<Text style={styles.locationText}>{item.asset_name}</Text>
					</View>

				</View>
			</Pressable>
		</>
	)
}

export default SelectAssetsCard

const styles = StyleSheet.create({
	locationButton: {
		// borderWidth: 0.6,
		borderRadius: 7,
		height: 50,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 20,
	},
	textRow: {
		flexDirection: "row",
		gap: 5,
		alignItems: "center",
	},
	childContainer: {
		backgroundColor: "#fff",
		paddingLeft: 40,
		paddingBottom: 10,
		borderBottomLeftRadius: 7,
		borderBottomRightRadius: 7,
	},
	childButton: {
		paddingVertical: 5,
	},
	childText: {
		fontSize: 10,
		color: "#555",
		fontFamily: Fonts.regular,
	},
	childLabel: {
		marginTop: 3,
		fontSize: 10,
		color: "#201F23",
		fontFamily: Fonts.light,
	},
	locationText: {
		fontSize: 11,
		fontFamily: Fonts.semiBold,
		color: "#201F23",
		lineHeight: 20
	},
	actionButton: {
		position: "absolute",
		width: width - 50,
		bottom: 0,
		alignSelf: "center",
	},

	/* Add Task Button */
	buttonContainer: {
		marginTop: 5,
		alignSelf: "flex-start",
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#742BDE",
		justifyContent: "center",
		gap: 5,
		paddingHorizontal: 12,
		paddingVertical: 5,
		borderRadius: 5,
		elevation: 5,
		shadowColor: "rgba(116, 43, 222, 0.80)",
		shadowOffset: { width: 2, height: 2 },
		shadowOpacity: 0.60,
		shadowRadius: 2,
	},
	buttonText: {
		fontSize: 10,
		fontFamily: Fonts.regular,
		color: "#FFFFFF",
		lineHeight: 20,
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