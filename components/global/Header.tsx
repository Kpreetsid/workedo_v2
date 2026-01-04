import { SafeAreaView } from "react-native-safe-area-context";
import { Text, StyleSheet, View, TouchableOpacity, Pressable, ViewStyle } from "react-native";
import { ArrowBack } from "@/constants/IconProvider";
import Fonts from "@/constants/Typography";
import { router } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

interface HeaderProps {
	title: string;
	modal?: boolean;
	dismiss?: () => void | null;
	editAsset?: boolean;
	handleEditAsset?: () => void;
	showBack?: boolean;
	showClose?: boolean;
	showOrientation?: boolean;
	toggleOrientation?: () => void;
	styling?: ViewStyle;
}

export default function Header({ title, modal = false, dismiss, editAsset, handleEditAsset, showBack = true, showClose = false, showOrientation = false, toggleOrientation, styling }: HeaderProps) {
	return (
		<SafeAreaView edges={["top"]} style={styles.safeArea}>
			<View style={[styles.headerContainer, styling]}>
				<View style={[
					styles.rowBetween,
					showClose && { width: '100%', justifyContent: 'space-between' }
				]}>
					{
						showBack && <TouchableOpacity onPress={() => modal ? dismiss!() : router.back()} style={styles.backButton} hitSlop={200}>
							<Ionicons name="chevron-back" size={22} color={"#fff"} />
						</TouchableOpacity>
					}

					<Text style={styles.title}>{title}</Text>


					<View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
						{
							showOrientation && (
								<Pressable onPress={toggleOrientation} style={styles.editButton}>
									<MaterialIcons name="screen-rotation" color={"#fff"} size={22} />
								</Pressable>
							)
						}

						{
							showClose && <TouchableOpacity onPress={() => modal ? dismiss!() : router.back()} style={styles.backButton}>
								<Ionicons name="close" size={22} color={"#fff"} />
							</TouchableOpacity>
						}
					</View>


				</View>

				{
					editAsset && (
						<TouchableOpacity onPress={handleEditAsset} style={styles.editButton}>
							<Ionicons name="pencil" size={22} color={"#fff"} />
						</TouchableOpacity>
					)
				}
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		backgroundColor: "#A259FF",
	},
	headerContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 25,
		paddingVertical: 15,
	},
	backButton: {
		marginRight: 5,
		padding: 5,
	},
	rowBetween: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
	},
	editButton: {
		padding: 5,
	},
	title: {
		fontSize: 16,
		fontFamily: Fonts.semiBold,
		lineHeight: 20,
		letterSpacing: 0.15,
		color: "#FFFFFF",
	},
});
