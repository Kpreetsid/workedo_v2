import Header from "@/components/global/Header";
import { Dimensions, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import ActionButton from "@/components/create-screens/ActionButton";
import { router } from "expo-router";
import Fonts from "@/constants/Typography";
import { ArrowRight, MapIcon, TickIcon } from "@/constants/IconProvider";
import { useEffect, useState } from "react";
import { getParts } from "@/src/services/part.service";
import { usePreventiveStore } from "@/src/store/usePreventiveStore";

interface PartInterface {
	showHeader?: boolean;
	selection?: boolean;
}

const width = Dimensions.get("window").width;

export default function SelectPart({ showHeader = true, selection = true }: PartInterface) {
	const [parts, setParts] = useState<any[]>([]);
	const { parts: storeParts, setPreventiveValue } = usePreventiveStore();

	// ✅ Load previously selected parts from store
	const [selectedParts, setSelectedParts] = useState<any[]>(storeParts || []);

	useEffect(() => {
		fetchParts();
	}, []);

	const fetchParts = async () => {
		try {
			const res = await getParts();
			if (res.status && Array.isArray(res.data)) {
				setParts(res.data);
			}
		} catch (err: any) {
			console.error("Fetching parts failed:", err);
		}
	};

	// ✅ Toggle selection
	const toggleSelectPart = (part: any) => {
		const exists = selectedParts.find((p) => p.id === part.id);
		if (exists) {
			setSelectedParts(selectedParts.filter((p) => p.id !== part.id));
		} else {
			setSelectedParts([...selectedParts, part]);
		}
	};

	// ✅ Save selected parts in store and go back
	const handleConfirm = () => {
		if (selectedParts.length === 0) {
			return;
		}
		setPreventiveValue("parts", selectedParts);
		router.back();
	};

	return (
		<>
			{showHeader && <Header title="Select Parts" />}
			<View style={{ flex: 1 }}>
				<FlatList
					data={parts}
					keyExtractor={(item) => item.id?.toString() || item._id?.toString()}
					renderItem={({ item }) => {
						const isSelected = selectedParts.some((p) => p.id === item.id);
						return (
							<Pressable
								style={[
									styles.partButton,
									{
										backgroundColor: isSelected ? "#FFBF0080" : "#fff",
										borderColor: isSelected ? "#FFC1074D" : "#99999933",
									},
								]}
								onPress={() => toggleSelectPart(item)}
							>
								<View style={styles.textRow}>
									<Text style={styles.partText}>{item.part_name}</Text>
									{/* {isSelected ? <TickIcon /> : <ArrowRight />} */}
								</View>
								<MapIcon />
							</Pressable>
						);
					}}
					contentContainerStyle={styles.container}
				/>

				{selection && (
					<ActionButton
						onPress={handleConfirm}
						label={`Confirm (${selectedParts.length})`}
						buttonStyle={styles.actionButton}
					/>
				)}
			</View>
		</>
	);
}

const styles = StyleSheet.create({
	container: {
		flexGrow: 1,
		backgroundColor: "#F5F7FA",
		paddingHorizontal: 25,
		paddingTop: 15,
		paddingBottom: 105,
		gap: 10,
	},
	partButton: {
		borderWidth: 0.6,
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
	partText: {
		fontSize: 10,
		fontFamily: Fonts.semiBold,
		color: "#201F23",
		lineHeight: 20,
	},
	actionButton: {
		position: "absolute",
		bottom: 20,
		alignSelf: "center",
		width: width - 50,
	},
});
