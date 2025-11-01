import { Comment } from "@/constants/IconProvider";
import Fonts from "@/constants/Typography";
import { WorkOrderComment } from "@/src/types/workOrder";
import moment from "moment";
import { StyleSheet, TextInput, View, Image, Text, FlatList } from "react-native";

export default function Comments({ comments }: { comments: WorkOrderComment[] }) {
	console.log('comments = ', comments);

	return (
		<View style={styles.container}>
			<View style={styles.inputContainer}>
				<TextInput
					placeholder="Comments"
					placeholderTextColor="#00000050"
					style={styles.commentInput}
					multiline
				/>
				<View style={styles.iconWrapper}>
					<Comment />
				</View>
			</View>


			<FlatList
				data={comments}
				keyExtractor={(item) => item.id}
				renderItem={({ item }) => <View style={styles.commentCard}>
					<Image source={{ uri: "https://randomuser.me/api/portraits/men/32.jpg" }} style={styles.avatar} resizeMode="cover" />

					<View style={styles.content}>
						<View style={styles.row}>
							<Text style={styles.name}>{item?.createdBy?.firstName} {item?.createdBy?.lastName}</Text>
							<Text style={styles.date}>{moment(item?.createdAt).format("DD/MM/YYYY")}</Text>
						</View>
						<Text style={styles.comment}>{item?.comments}</Text>
					</View>
				</View>
				}
				showsVerticalScrollIndicator={false}
			/>

		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		paddingHorizontal: 20
	},
	inputContainer: {
		height: 70,
		backgroundColor: "rgba(240, 237, 255, 0.40)",
		borderRadius: 8,
		marginBottom: 10,
		flexDirection: "row",
		alignItems: "center",
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: "#000"
	},
	commentInput: {
		flex: 1,
		fontFamily: Fonts.regular,
		fontSize: 11,
		height: "100%",
		textAlignVertical: "top",
		paddingHorizontal: 8,
	},
	iconWrapper: {
		position: "absolute",
		right: 8,
		bottom: 8,
	},
	commentCard: {
		borderRadius: 8,
		backgroundColor: "#fff",
		padding: 10,
		flexDirection: "row",
		alignItems: "flex-start",
		gap: 8,
		marginVertical: 5
	},
	avatar: {
		width: 30,
		height: 30,
		borderRadius: 15,
		flexShrink: 0
	},
	content: {
		flex: 1,
	},
	row: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 4,
	},
	name: {
		fontFamily: Fonts.regular,
		fontSize: 12,
		color: "#1C1C1C",
	},
	date: {
		fontFamily: Fonts.medium,
		fontSize: 9,
		color: "#000",
	},
	comment: {
		fontFamily: Fonts.light,
		fontSize: 10,
		lineHeight: 14,
		color: "#333",
	},
})