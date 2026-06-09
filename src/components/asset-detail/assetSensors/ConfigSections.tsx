import { View, Text, StyleSheet, Dimensions, ActivityIndicator } from "react-native";
import Fonts from "@/constants/Typography";
import { useAssetStore } from "@/src/state/assets/useAssetStore";
import { useState } from "react";

export default function ConfigSections() {
	const { deviceInfo } = useAssetStore((state) => state);
    // @ts-ignore
	const [loading, setLoading] = useState(false);

	if (!deviceInfo) {
		return (
			<View>
				<Text style={{ textAlign: "center", color: "#777" }}>
					Select an endpoint to view configuration
				</Text>
			</View>
		);
	}

	const formatAxisMapping = (value: string) => {
		try {
			const parsed = JSON.parse(value);

			if (!parsed || typeof parsed !== "object") return value;

			return `X: ${parsed.x}\nY: ${parsed.y}\nZ: ${parsed.z}`;
		} catch {
			return value;
		}
	};

	return (
		<View style={styles.configContainer}>
			{
				!deviceInfo ? <ActivityIndicator size="large" color="#742BDE" /> : (
					(deviceInfo as any[])?.map((section: any, sectionIndex: number) => (
						<View key={sectionIndex} style={styles.section}>
							<Text style={styles.sectionTitle}>{section?.title}</Text>
							<View style={styles.configRow}>
								{(section?.data as any[])?.map((item: any, index: number) => (
									<View key={index} style={styles.configBox}>
										<Text style={styles.configLabel}>{item?.label}</Text>
										<Text style={styles.configValue}>
											{
												item.label === "Custom Mapping"
													? formatAxisMapping(item?.value)
													: item?.value
											}
										</Text>
									</View>
								))}
							</View>
						</View>
					))
				)
			}
		</View>
	);
};

const SCREEN_WIDTH = Dimensions.get("window").width;

const styles = StyleSheet.create({
	configContainer: {
		flexGrow: 1,
		paddingBottom: 10,
		justifyContent: "flex-start",
	},
	section: {
		marginHorizontal: 16,
		backgroundColor: "#FFFFFF",
		borderRadius: 6,
		paddingVertical: 12,
		paddingHorizontal: 12,
		borderWidth: 0.6,
		borderColor: "#D9D9D9",
		marginBottom: 16,
	},
	sectionTitle: {
		fontSize: 12,
		fontFamily: Fonts.semiBold,
		color: "#000000",
		backgroundColor: "#FBF8FF",
		borderWidth: 0.3,
		borderColor: "#00214320",
		borderRadius: 2,
		paddingHorizontal: 5,
		paddingVertical: 3,
		alignSelf: "flex-start",
		marginBottom: 4,
	},
	configRow: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "space-between",
	},
	configBox: {
		backgroundColor: "#F9F5FF70",
		borderLeftWidth: 0.5,
		borderColor: "#3F009A",
		padding: 5,
		marginVertical: 5,
		alignItems: "center",
		justifyContent: "center",
		maxWidth: (SCREEN_WIDTH / 3) - 28,
		flexGrow: 1,
	},
	configLabel: {
		fontSize: 11,
		fontFamily: Fonts.semiBold,
		color: "#1C1C1C",
		// letterSpacing: 0.3,
		textShadowColor: "#00000025",
		textShadowOffset: { width: 1, height: 1 },
		textShadowRadius: 2,
	},
	configValue: {
		fontSize: 11,
		fontFamily: Fonts.light,
		color: "#742BDE",
		textShadowColor: "#742BDE25",
		textShadowOffset: { width: 1, height: 1 },
		textShadowRadius: 2,
	},
});
