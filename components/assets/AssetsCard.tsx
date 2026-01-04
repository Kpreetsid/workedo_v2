import { Dimensions, Pressable, StyleSheet, Text, ToastAndroid, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { Location } from '@/src/types/location';
import { useRouter } from 'expo-router';
import Fonts from '@/constants/Typography';
import { useWorkOrderStore } from '@/src/store/useWorkOrderStore';
import { useWorkRequestStore } from '@/src/store/useWorkRequestStore';
import { usePartFormStore } from '@/src/store/usePartFormStore';
import { usePreventiveStore } from '@/src/store/usePreventiveStore';
import { Ionicons } from '@expo/vector-icons';
import Popover, { PopoverMode, Rect } from 'react-native-popover-view';
import { Asset } from '@/src/types/asset';
import { getSingleAssetHealthHistory } from '@/src/services/asset.service';
import { FABIcon } from '@/constants/IconProvider';

interface AssetsCardInterface {
	asset: Asset;
	isChild?: boolean;
	level?: number;
	handleDeleteAsset?: (asset: Asset) => void;
	handleCopyAsset?: (asset: Asset) => void;
}

const width = Dimensions.get("window").width;

const COLORS: any = {
	"Healthy": "#22C55E",
	"Alert": "#FACC15",
	"Danger": "#F97316",
	"Critical": "#EF4444",
	"Not Defined": "#b0b0b0"
};

const AssetsCard = ({ asset, isChild = false, level = 0, handleDeleteAsset, handleCopyAsset }: AssetsCardInterface) => {
	const router = useRouter();
	const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);
	const [expandedAssetId, setExpandedAssetId] = useState<string | null>(null);
	const [assetHealth, setAssetHealth] = useState<any>(null);

	const isExpanded = expandedAssetId === asset.id;
	const hasChildren = asset.childs && asset.childs.length > 0;

	const { setWorkForm } = useWorkOrderStore();
	const { setWorkRequestForm } = useWorkRequestStore();
	const { setPartFormValue } = usePartFormStore();
	const { setPreventiveValue } = usePreventiveStore();


	// useEffect(() => {
	// calculateAssetHealth();
	// }, [asset]);

	const calculateAssetHealth = async () => {
		try {
			if (asset?.id) {
				const assetHealthRes = await getSingleAssetHealthHistory(asset?.id);
				if (assetHealthRes) {
					setAssetHealth(assetHealthRes?.data);
				}
			} else {
				ToastAndroid.show("No Sensor is mapped against this asset.", ToastAndroid.SHORT);
			}
		} catch (err) {
			console.error("Error fetching asset health:", err);
			ToastAndroid.show("Failed to fetch asset health.", ToastAndroid.SHORT);
		}
	};

	return (
		<>
			<Pressable
				style={({ pressed }) => [
					styles.locationButton,
					pressed && {backgroundColor: '#fadb7d'},

					asset?.asset_status && {
						borderLeftWidth: 8,
						borderLeftColor: COLORS[asset.asset_status],
					},

					isExpanded && {
						borderBottomLeftRadius: 0,
						borderBottomRightRadius: 0,
					},

					{ marginBottom: 20 },
				]}
				onPress={() => {
					router.push({
						pathname: "/assetDetail",
						params: { id: asset.id },
						// params: { data: JSON.stringify(asset) },
					});
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
									setExpandedAssetId(isExpanded ? null : asset.id);
								}}
							>
								<Ionicons
									name={isExpanded ? "chevron-down" : "chevron-forward"}
									size={16}
									color="black"
									style={hasChildren ? { display: 'flex' } : (isChild ? { display: 'none' } : { display: 'flex' })}
								/>
							</Pressable>
						)}

						<Text style={styles.locationText}>{asset.asset_name}</Text>
					</View>

				</View>

				<Popover
					popoverStyle={{ borderRadius: 15 }}
					isVisible={openPopoverId === asset.id}
					onRequestClose={() => setOpenPopoverId(null)}
					from={(
						<TouchableOpacity style={{ padding: 6 }} onPress={() => setOpenPopoverId(asset.id)}>
							<Ionicons name="ellipsis-vertical" size={18} color="#201F23CC" />
						</TouchableOpacity>
					)}
				>
					<View style={styles.popoverContent}>
						{
							[
								{ icon: 'add', text: 'Add' },
								// { icon: 'pencil', text: 'Edit' },
								{ icon: 'copy', text: 'Copy' },
								{ icon: 'trash', text: 'Delete' }
							].map((option, index) => {
								return (
									<Pressable
										style={styles.popoverItem}
										key={index}
										onPress={async () => {
											if (index === 0) {
												router.push({
													pathname: "/createAsset",
													params: {
														asset_data: JSON.stringify(asset),
														mode: 'child',
														isEdit: 'false'
													},
												});
											} else if (index === 1) {
												handleCopyAsset?.(asset)
											} else if (index === 2) {
												handleDeleteAsset?.(asset)
											}
											setOpenPopoverId(null)
										}}
									>
										<View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', justifyContent: 'flex-start' }}>

											{
												option.icon === "add" ? <FABIcon color='#71717A' width={16} height={16} /> : <Ionicons name={option.icon as any} size={16} color="#71717A" />
											}

											<Text style={{ color: "#71717A", fontFamily: Fonts.regular }}>
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
			</Pressable>


			{/* RECURSIVE CHILDREN */}
			{
				isExpanded && hasChildren && (
					<View>
						{asset?.childs?.map(child => (
							<AssetsCard
								key={child.id}
								asset={child}
								isChild={true}
								level={level + 1}
								handleDeleteAsset={() => handleDeleteAsset?.(child)}
								handleCopyAsset={() => handleCopyAsset?.(child)}
							/>
						))}
					</View>
				)
			}
		</>
	)
}

export default AssetsCard

const styles = StyleSheet.create({

	locationButton: {
		backgroundColor: "#fff",
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