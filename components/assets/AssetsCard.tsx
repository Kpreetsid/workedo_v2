import { Pressable, StyleSheet, Text, ToastAndroid, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import Fonts from '@/constants/Typography'
import { Ionicons } from '@expo/vector-icons'
import { Asset } from '@/src/types/asset'
import { getSingleAssetHealthHistory } from '@/src/services/asset.service'
import { useRouter } from 'expo-router'

interface AssetsCardInterface {
	asset: Asset;
	isChild?: boolean;
	level?: number;
}

const AssetsCard = ({ asset, isChild = false, level = 0 }: AssetsCardInterface) => {
	const router = useRouter();
	const [expandedAssetId, setExpandedAssetId] = useState<string | null>(null);
	const [assetHealth, setAssetHealth] = useState<any>(null);

	const isExpanded = expandedAssetId === asset.id;
	const hasChildren = asset.childs && asset.childs.length > 0;

	useEffect(() => {
		calculateAssetHealth();
	}, [asset]);

	const calculateAssetHealth = async () => {
		try {
			if (asset?.id) {
				const assetHealthRes = await getSingleAssetHealthHistory(asset?.id);
				if (assetHealthRes) {
					setAssetHealth(assetHealthRes?.data);
				}
			} else {
				ToastAndroid.show("No Sensor is mapped against this endpoint.", ToastAndroid.SHORT);
			}
		} catch (err) {
			console.error("Error fetching asset health:", err);
			ToastAndroid.show("Failed to fetch asset health.", ToastAndroid.SHORT);
		}
	};

	return (
		<>
			{/* INDENT CHILD CARDS */}
			<Pressable
				style={[
					styles.assetCard,
					// { marginTop: isChild ? 10 : 0 }
				]}
				onPress={() => {
					router.push({
						pathname: "/assetDetail",
						params: { id: asset.id },
					});
				}}
			>
				{/* ROW 1 */}
				< View style={styles.cardRow} >

					<View style={[styles.cardRowTexts, {width: '50%'}]}>
						<Text style={styles.assetHeading}>Asset Name</Text>
						<Text style={styles.assetText} numberOfLines={2}>{asset?.asset_name}</Text>
					</View>

					<View style={[styles.cardRowTexts, {width: '40%'}]}>
						<Text style={styles.assetHeading}>Asset Type</Text>
						<Text style={styles.assetText} numberOfLines={2}>{asset?.asset_type}</Text>
					</View>

					{/* ONLY SHOW EXPAND TOGGLE ON PARENT */}
					<View style={[styles.cardRowIcons, {width: '10%'}]}>
						{!isChild && hasChildren && (
							<Pressable
								onPress={() => {
									console.log('expanding')
									setExpandedAssetId(isExpanded ? null : asset.id);
								}}
							>
								<Ionicons
									name={isExpanded ? "chevron-up" : "chevron-down"}
									size={18}
									color="black"
								/>
							</Pressable>
						)}

						<Ionicons name="ellipsis-vertical" size={18} color="black" />

						{/* {!isChild && hasChildren && (
							<Ionicons
								name={isExpanded ? "chevron-up" : "chevron-down"}
								size={18}
								color="black"
							/>
						)} */}
					</View >

				</View >

				{/* ROW 2 - Asset Health */}
				< View style={styles.cardRow} >
					<View style={styles.cardRowTexts}>
						<Text style={styles.assetHeading}>Asset Health</Text>
						<Text style={styles.assetText}>{assetHealth?.assetHealth ?? "N/A"}</Text>
					</View>
				</View>

				{/* ROW 3 - Location */}
				< View style={styles.cardRow} >
					<View style={styles.cardRowTexts}>
						<Text style={styles.assetHeading}>Location Name</Text>
						<Text style={styles.assetText}>{asset?.locationData?.location_name}</Text>
					</View>
				</View>

				{/* ROW 4 - Assign To */}
				< View style={styles.cardRow} >
					<View style={styles.cardRowTexts}>
						<Text style={styles.assetHeading}>Assign To</Text>
						<Text style={styles.assetText} numberOfLines={2}>Atul, Aman, Kamal, Parwez</Text>
					</View>
				</View>

			</Pressable >

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
	assetHeading: {
		fontSize: 10,
		fontFamily: Fonts.regular,
		color: "#201F23",
	},
	assetText: {
		fontSize: 12,
		fontFamily: Fonts.semiBold,
		color: "#201F23",
	},
	assetCard: {
		backgroundColor: '#fff',
		minHeight: 200,
		padding: 16,
		borderWidth: 1,
		borderColor: '#D9D9D9',
		borderRadius: 12,
		flexDirection: 'column',
		marginBottom: 10,
		gap: 15
	},
	cardRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	cardRowTexts: {
		flexDirection: 'column',
		alignItems: 'flex-start',
	},
	cardRowIcons: {
		flexDirection: 'row',
		alignItems: 'center',
	},
})
