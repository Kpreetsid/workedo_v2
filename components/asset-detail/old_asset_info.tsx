import { Dimensions, Pressable, ScrollView, StyleSheet, Text, ToastAndroid, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { Feather, FontAwesome, FontAwesome6 } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import Fonts from "@/constants/Typography";
import { ArrowRight } from "@/constants/IconProvider";
import InfoCards from "@/components/overview-screen/InfoCards";
import SelectEndpoint from "@/components/asset-detail/SelectEndpoint";
import { useLocalSearchParams } from "expo-router";
import { getAllEndpoints, getChildren, getSingleAssetHealthHistory } from "@/src/services/asset.service";
import { Asset } from "@/src/types/asset";
import { AssetEndpoint } from "@/src/types/assetEndpoint";

const dataAxial = [
	{ value: 0.05 },
	{ value: 0.07 },
	{ value: 0.09 },
	{ value: 0.03 },
	{ value: 0.08 },
	{ value: 0.06 },
	{ value: 0.07 },
];

const dataHorizontal = [
	{ value: 0.04 },
	{ value: 0.06 },
	{ value: 0.03 },
	{ value: 0.08 },
	{ value: 0.06 },
	{ value: 0.07 },
	{ value: 0.09 },
];

const dataVertical = [
	{ value: 0.03 },
	{ value: 0.05 },
	{ value: 0.04 },
	{ value: 0.06 },
	{ value: 0.07 },
	{ value: 0.05 },
	{ value: 0.06 },
];

interface AssetInfoTabProps {
	asset_data: Asset;
}

export default function AssetInfoTab({ asset_data }: AssetInfoTabProps) {
	const [activeTab, setActiveTab] = useState("Horizontal");
	const [endpoints, setEndpoints] = useState<AssetEndpoint[]>([]);
	const [endpointSelected, setEndpointSelected] = useState<any>(null);
	const [compositeIdSelected, setCompositeIdSelected] = useState<string | null>(null);
	const [assetHealth, setAssetHealth] = useState<any>();


	useEffect(() => {
		fetchAssetChildren();
	}, []);

	const fetchAssetChildren = async () => {
		console.log('asset_data in info = ', asset_data);
		const childrenRes = await getChildren(asset_data?.id);
		console.log("asset children =", childrenRes);
		if (childrenRes.result == 1) {
			if (childrenRes.message == "Data Found") {
				let allChildAssets = childrenRes.data;
				fetchEndpoints(allChildAssets);
			}
		}
	}

	const fetchEndpoints = async (allChildAssets: Asset[]) => {
		console.log('allChildAssets in info = ', allChildAssets);
		let payload: any[] = [];

		allChildAssets.forEach((snap: any) => {
			payload.push(snap.id);
		})

		console.log('payload = ', payload);
		const endpointsRes = await getAllEndpoints(payload);
		console.log('res endpoints = ', endpointsRes);

		const categorized = await categorizeEachEndpointWithAssetName(allChildAssets, endpointsRes);

		if (categorized.length !== 0) {
			setEndpoints(categorized);

			const first = categorized[0];
			setEndpointSelected({
				name: `${first.point_name}-${first.mount_location}`,
				asset_name: first.asset_name,
			});

			if (first.composite_id != null) {
				setCompositeIdSelected(first.composite_id);
				const assetHealth = await getSingleAssetHealthHistory(asset_data?.id);
				console.log('asset health = ', assetHealth);
				if (assetHealth) {
					setAssetHealth(assetHealth?.data);
				}
			} else {
				ToastAndroid.show("No Sensor is mapped against this endpoint", ToastAndroid.SHORT);
			}
		} else {
			setEndpointSelected({
				name: "No Endpoints Found",
				asset_name: "",
			});
			ToastAndroid.show("No endpoints created against selected asset.", ToastAndroid.SHORT);
		}
	}

	const categorizeEachEndpointWithAssetName = (allChildAssets: any, endpointsRes: any): Promise<any> => {
		return new Promise((resolve, reject) => {
			var endpointsArr: any = [];

			// Iterate through endpoints array
			endpointsRes?.data.forEach((endpoint: any) => {
				// Find the matching childAsset
				const matchingChildAsset = allChildAssets.find((childAsset: any) => childAsset.id === endpoint.asset_id);
				// Add a new property to the endpoint based on the matching childAsset
				if (matchingChildAsset) {
					endpoint.asset_name = matchingChildAsset.asset_name;
					endpointsArr.push(endpoint);
				}
			});

			console.log('final endpoints = ', endpointsArr)
			resolve(endpointsArr)
		})
	}

	return (
		<ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
			{/* Summary Card */}
			<View style={styles.summaryCard}>
				<View style={styles.rowBetween}>
					<View style={styles.cameraIcon}>
						<Feather name="camera" size={20} color="#201f23" />
					</View>
					<View>
						<Text style={styles.summaryTitle}>Assets Health</Text>
						{assetHealth && (
							<Text
								style={[
									styles.summaryValue,
									assetHealth.assetHealth === "Healthy" && styles.healthy,
									assetHealth.assetHealth === "Alert" && styles.alert,
									assetHealth.assetHealth === "Danger" && styles.danger,
									assetHealth.assetHealth === "Critical" && styles.critical,
									assetHealth.assetHealth === "Not Defined" && styles.not_defined,
								]}
							>
								{assetHealth?.assetScore ? assetHealth.assetScore : "-"}
							</Text>
						)}

					</View>
					<View>
						<Text style={styles.summaryTitle}>Temperature</Text>
						<View style={[styles.rowBetween, { gap: 5 }]}>
							<FontAwesome name="thermometer-half" size={15} color="#CA8A04" />
							<Text style={[styles.summaryValue, { color: "#FFB84D" }]}>39°C</Text>
						</View>
					</View>
				</View>
			</View>

			{/* Asset Details */}
			{/* <View style={styles.detailsRow}>
				<DetailPill icon="orcid" label="Asset ID" value="A-01" iconColor="#742bde" />
				<DetailPill icon="screwdriver-wrench" label="Asset Type" value="Fan_blower" iconColor="#FF8D54" />
				<DetailPill icon="location-dot" label="Location" value="New Delhi" iconColor="#EE2E6B" />
			</View> */}

			<SelectEndpoint endpointSelected={endpointSelected} endpoints={endpoints} />

			{/* <InfoCards /> */}

			{/* Mode Tabs */}
			{/* <View style={styles.modeTabs}>
				{["Horizontal", "Vertical", "Axial", "Velocity", "RMS"].map((tab) => (
					<Pressable key={tab} style={[styles.modeTab, activeTab === tab && styles.modeTabActive]} onPress={() => setActiveTab(tab)}>
						<Text style={[styles.modeTabText, activeTab === tab && styles.modeTabTextActive]}>{tab}</Text>
					</Pressable>
				))}
			</View> */}

			{/* Chart */}
			{/* <View style={styles.chartContainer}>
				<LineChart
					curved
					data={dataAxial}
					data2={dataHorizontal}
					data3={dataVertical}
					color1="#E056FD"
					color2="#742BDE"
					color3="#FF9D00"
					thickness={2}
					hideRules={false}
					hideDataPoints={false}
					dataPointsColor1="#E056FD"
					dataPointsColor2="#742BDE"
					dataPointsColor3="#FF9D00"
					yAxisTextStyle={{ color: "#A0A0A0", fontSize: 8 }}
					xAxisLabelTextStyle={{ color: "#A0A0A0", fontSize: 8 }}
					backgroundColor="transparent"
					rulesColor="#F0F0F0"
					initialSpacing={20}
					endSpacing={20}
					noOfSections={4}
					spacing={40}
					areaChart={false}
					hideAxesAndRules={false}
					xAxisColor="#EAEAEA"
					yAxisColor="#EAEAEA"
					xAxisThickness={1}
					yAxisThickness={1}
					yAxisLabelWidth={20}
					height={180}
				/>

				<View style={styles.legendRow}>
					<View style={styles.legendItem}>
						<View style={[styles.dot, { backgroundColor: "#E056FD" }]} />
						<Text style={styles.legendText}>Axial</Text>
						<Text style={styles.legendValue}>1.11</Text>
					</View>
					<View style={styles.legendItem}>
						<View style={[styles.dot, { backgroundColor: "#742BDE" }]} />
						<Text style={styles.legendText}>Horizontal</Text>
						<Text style={styles.legendValue}>3.69</Text>
					</View>
					<View style={styles.legendItem}>
						<View style={[styles.dot, { backgroundColor: "#FF9D00" }]} />
						<Text style={styles.legendText}>Vertical</Text>
						<Text style={styles.legendValue}>3.69</Text>
					</View>
				</View>
			</View> */}
		</ScrollView>
	)
}

const DetailPill = ({ icon, label, value, iconColor }: { icon: string; label: string; value: string, iconColor: string }) => (
	<View style={styles.detailPill}>
		<FontAwesome6 name={icon as any} size={14} color={iconColor} />
		<View>
			<Text style={styles.detailLabel}>{label}</Text>
			<Text style={styles.detailValue}>{value}</Text>
		</View>
	</View>
);

const { width } = Dimensions.get("window");
const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	summaryCard: {
		backgroundColor: "#FEFCE8",
		borderRadius: 10,
		paddingVertical: 15,
		paddingHorizontal: 25,
		borderWidth: 1.1,
		borderColor: "#FFE000",
		marginHorizontal: 20
	},
	rowBetween: {
		flexDirection: "row",
		alignItems: "center",
		gap: 25
	},
	cameraIcon: {
		backgroundColor: "#fff",
		height: 36,
		width: 43,
		alignItems: "center",
		justifyContent: "center",
		borderRadius: 8,
		borderColor: "#000",
		borderWidth: 0.1
	},
	summaryTitle: {
		fontSize: 12,
		fontFamily: Fonts.semiBold,
		color: "#201f23"
	},
	summaryValue: {
		fontFamily: Fonts.semiBold,
		color: "#CA8A04",
		lineHeight: 18
	},

	healthy: {
		fontSize: 14,
		margin: 0,
		color: '#51FC4C'
	},
	alert: {
		color: '#F7FA4B'
	},
	danger: {
		color: '#FA8349'
	},
	critical: {
		color: '#ff181e'
	},
	not_defined: {
		color: '#B0B0B0'
	},
	detailsRow: {
		flexDirection: "row",
		justifyContent: "space-around",
		margin: 20,
		backgroundColor: "#fff",
		borderRadius: 10,
		alignItems: "center",
		elevation: 2,
	},
	detailPill: {
		padding: 8,
		flexDirection: "row",
		alignItems: "center",
		gap: 10
	},
	detailLabel: {
		fontSize: 10,
		fontFamily: Fonts.regular,
		color: "#201f23"
	},
	detailValue: {
		fontSize: 11,
		color: "#201f23",
		fontFamily: Fonts.semiBold,
		lineHeight: 15
	},
	modeTabs: {
		flexDirection: "row",
		margin: 20,
		gap: 10,
		flexWrap: "wrap",
		alignItems: "center",
		justifyContent: "space-around",
	},
	modeTab: {
		backgroundColor: "#fff",
		paddingVertical: 6,
		borderRadius: 5,
		borderWidth: 0.3,
		borderColor: "#00000020",
		width: (width / 3) - 30,
	},
	modeTabActive: {
		backgroundColor: "#742BDE"
	},
	modeTabText: {
		color: "#00000060",
		fontSize: 10,
		fontFamily: Fonts.regular,
		textAlign: "center",
	},
	modeTabTextActive: {
		color: "#fff",
		fontFamily: Fonts.semiBold
	},
	chartContainer: {
		backgroundColor: "#fff",
		marginHorizontal: 20,
		borderRadius: 10,
		paddingHorizontal: 20,
		paddingVertical: 10
	},
	legendRow: {
		flexDirection: "row",
		justifyContent: "space-around",
		marginTop: 10,
		paddingVertical: 4,
	},
	legendItem: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4
	},
	dot: {
		width: 8,
		height: 8,
		borderRadius: 4
	},
	legendText: {
		fontSize: 10,
		color: "#666"
	},
	legendValue: {
		fontSize: 10,
		fontWeight: "600",
		color: "#000",
		marginLeft: 4
	},
});
