import { Comment } from "@/constants/IconProvider";
import Fonts from "@/constants/Typography";
import { endpoints } from "@/src/api/endpoints";
import { deleteWorkOrderComment, getWorkOrderComments, postComments } from "@/src/services/work-order.service";
import { useAuthStore } from "@/src/store/useAuthStore";
import { WorkOrder, WorkOrderComment, WorkOrderCommentReply } from "@/src/types/workOrder";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, TextInput, View, Image, Text, FlatList, TouchableOpacity, ToastAndroid } from "react-native";

interface Props {
	params: WorkOrder;
}

export default function Comments({ params }: Props) {
	const [comments, setComments] = useState<WorkOrderComment[]>([]);
	const [userComment, setUserComment] = useState<string>("");
	const commentRef = useRef<any>(null);
	const [parentCommentId, setParentCommentId] = useState<string | null>(null);

	const { user } = useAuthStore();

	useEffect(() => {
		fetchComments();
	}, [params?.id]);

	const fetchComments = async () => {
		try {
			const res = await getWorkOrderComments(params?.id);
			console.log('res comments = ', res);
			if (res?.status) {
				setComments(res?.data);
			}
		} catch (e: any) {
			console.log('error fetching comments = ', e);
			if(!e.status) {
				if(e.message === 'No data found') {
					setComments([]);
				}
			}
		}
	}

	const handleComment = async () => {
		try {
			console.log('handleComment = ', userComment);
			const text = userComment?.trim();
			if (!text) return;

			let payload: any = {
				comments: userComment,
			}

			if (parentCommentId) {
				payload.parentCommentId = parentCommentId;
			}

			console.log('payload = ', payload)

			const res = await postComments(
				params?.id,
				payload
			)
			
			if (res?.status) {
				ToastAndroid.show("Comment added successfully!", ToastAndroid.SHORT);
				fetchComments();
				setUserComment("");
				setParentCommentId(null);
			}
		} catch (e) {
			console.log('error adding comment = ', e);
		}
	}

	const onReplyPress = (id: string) => {
		setParentCommentId(id);
		commentRef.current?.focus();
	};

	const onDeletePress = async (id: string) => {
		console.log('onDeletePress = ', id);
		try {
			const res = await deleteWorkOrderComment(
				params?.id,
				id
			)
			
			if (res?.status) {
				ToastAndroid.show("Comment deleted successfully!", ToastAndroid.SHORT);
				fetchComments();
			}
		} catch (e) {
			console.log('error deleting comment = ', e);
		}
	};

	const CommentItem = ({ item, level = 0, onReplyPress, onDeletePress }: { item: WorkOrderComment | WorkOrderCommentReply; level: number; onReplyPress?: (id: string) => void; onDeletePress?: (id: string) => void }) => {
		return (
			<View style={[styles.commentCard, { marginLeft: level * 40 }]}>
				<Image
					source={{ uri: `${endpoints.baseURL}user_profile_img/${item?.createdBy?.user_profile_img}` }}
					style={styles.avatar}
					resizeMode="cover"
				/>

				<View style={styles.content}>
					<View style={styles.row}>
						<Text style={styles.name}>
							{item?.createdBy?.firstName} {item?.createdBy?.lastName}
						</Text>
						<Text style={styles.date}>{moment(item?.createdAt).format("DD/MM/YYYY")}</Text>
					</View>

					<Text style={styles.comment}>{item?.comments}</Text>

					{/* reply button */}
					{
						level === 0 && (
							<TouchableOpacity
								onPress={() => onReplyPress?.(item.id)}
								style={styles.replyButton}
							>
								<Text style={styles.replyText}>Reply</Text>
							</TouchableOpacity>
						)
					}

					{
						item.account_id === user?.account_id && (
							<TouchableOpacity
								onPress={() => onDeletePress?.(item.id)}
								style={styles.deleteButton}
							>
								<Text style={styles.deleteText}>Delete</Text>
							</TouchableOpacity>
						)
					}

				</View>
			</View>
		);
	};


	return (
		<FlatList
			contentContainerStyle={styles.container}
			data={comments}
			keyExtractor={(item) => item.id}
			showsVerticalScrollIndicator={false}
			ListHeaderComponent={
				<View style={styles.inputContainer}>
					<TextInput
						ref={commentRef}
						value={userComment}
						placeholder="Comments"
						onChangeText={setUserComment}
						placeholderTextColor="#00000050"
						style={styles.commentInput}
						multiline
					/>
					<TouchableOpacity style={styles.iconWrapper} onPress={handleComment}>
						<Comment />
					</TouchableOpacity>
				</View>
			}
			renderItem={({ item }) => (
				<View>
					<CommentItem
						item={item}
						level={0}
						onReplyPress={onReplyPress}
						onDeletePress={onDeletePress}
					/>

					{item.replies?.map(reply => (
						<CommentItem key={reply.id} item={reply} level={1} onDeletePress={onDeletePress} />
					))}
				</View>
			)}
		/>
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
		color: "#000",
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
	replyButton: {
		alignSelf: "flex-end",
		marginTop: 6,
	},
	replyText: {
		color: "#3399ff",
		fontSize: 12,
		fontWeight: "500",
	},
	deleteButton: {
		alignSelf: "flex-end",
		marginTop: 6,
	},
	deleteText: {
		color: "#ff0000",
		fontSize: 12,
		fontWeight: "500",
	},
})
