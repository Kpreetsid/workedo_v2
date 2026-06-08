import { Comment } from "@/constants/IconProvider";
import Fonts from "@/constants/Typography";
import { endpoints } from "@/src/api/endpoints";
import { deleteWorkOrderComment, getWorkOrderComments, postComments } from "@/src/services/work-order.service";
import { useAuthStore } from "@/src/store/useAuthStore";
import { WorkOrder, WorkOrderComment, WorkOrderCommentReply } from "@/src/types/workOrder";
import moment from "moment";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";

interface Props {
  params: WorkOrder;
}

const getProfileUri = (imageName?: string) =>
  imageName ? `${endpoints.baseURL}user_profile_img/${imageName}` : "";

const getInitials = (firstName?: string, lastName?: string) =>
  `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "U";

export default function Comments({ params }: Props) {
  const { user } = useAuthStore();
  const [comments, setComments] = useState<WorkOrderComment[]>([]);
  const [userComment, setUserComment] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [parentCommentId, setParentCommentId] = useState<string | null>(null);
  const commentRef = useRef<TextInput>(null);

  useEffect(() => {
    fetchComments();
  }, [params?.id]);

  const parentComment = useMemo(
    () => comments.find((comment) => comment.id === parentCommentId) || null,
    [comments, parentCommentId]
  );

  const fetchComments = async () => {
    if (!params?.id) {
      setComments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await getWorkOrderComments(params.id);
      if (res?.status) {
        setComments(Array.isArray(res?.data) ? res.data : []);
      } else {
        setComments([]);
      }
    } catch (e: any) {
      if (!e?.status && e?.message === "No data found") {
        setComments([]);
      } else {
        console.log("error fetching comments =", e);
      }
    } finally {
      setLoading(false);
    }
  };

  const clearReplyState = () => {
    setParentCommentId(null);
  };

  const handleComment = async () => {
    const text = userComment.trim();
    if (!text || !params?.id) return;

    setSubmitting(true);
    try {
      const payload: any = {
        comments: text,
      };

      if (parentCommentId) {
        payload.parentCommentId = parentCommentId;
      }

      const res = await postComments(params.id, payload);
      if (res?.status) {
        ToastAndroid.show(parentCommentId ? "Reply added successfully!" : "Comment added successfully!", ToastAndroid.SHORT);
        setUserComment("");
        clearReplyState();
        fetchComments();
      }
    } catch (e) {
      console.log("error adding comment =", e);
    } finally {
      setSubmitting(false);
    }
  };

  const onReplyPress = (id: string) => {
    setParentCommentId(id);
    commentRef.current?.focus();
  };

  const onDeletePress = async (id: string) => {
    if (!params?.id) return;
    try {
      const res = await deleteWorkOrderComment(params.id, id);
      if (res?.status) {
        ToastAndroid.show("Comment deleted successfully!", ToastAndroid.SHORT);
        if (parentCommentId === id) {
          clearReplyState();
        }
        fetchComments();
      }
    } catch (e) {
      console.log("error deleting comment =", e);
    }
  };

  const isOwnComment = (item: WorkOrderComment | WorkOrderCommentReply) => {
    const commentCreatorId = item?.createdBy?._id ? String(item.createdBy._id) : "";
    const currentUserId = user?.id || user?._id ? String(user?.id || user?._id) : "";
    return Boolean(commentCreatorId && currentUserId && commentCreatorId === currentUserId);
  };

  const CommentItem = ({
    item,
    level = 0,
  }: {
    item: WorkOrderComment | WorkOrderCommentReply;
    level: number;
  }) => {
    const profileUri = getProfileUri(item?.createdBy?.user_profile_img);

    return (
      <View style={[styles.commentCard, level > 0 ? styles.replyCard : null]}>
        {profileUri ? (
          <Image source={{ uri: profileUri }} style={styles.avatar} resizeMode="cover" />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarInitials}>
              {getInitials(item?.createdBy?.firstName, item?.createdBy?.lastName)}
            </Text>
          </View>
        )}

        <View style={styles.content}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>
                {item?.createdBy?.firstName} {item?.createdBy?.lastName}
              </Text>
              <Text style={styles.date}>{moment(item?.createdAt).format("DD MMM YYYY, hh:mm A")}</Text>
            </View>
            <View style={styles.actionRow}>
              {level === 0 ? (
                <TouchableOpacity onPress={() => onReplyPress(item.id)} style={styles.actionButton}>
                  <Text style={styles.replyText}>Reply</Text>
                </TouchableOpacity>
              ) : null}
              {isOwnComment(item) ? (
                <TouchableOpacity onPress={() => onDeletePress(item.id)} style={styles.actionButton}>
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          <Text style={styles.comment}>{item?.comments}</Text>
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
        <View>
          {parentComment ? (
            <View style={styles.replyBanner}>
              <View style={{ flex: 1 }}>
                <Text style={styles.replyBannerTitle}>Replying to {parentComment?.createdBy?.firstName || "comment"}</Text>
                <Text style={styles.replyBannerText} numberOfLines={2}>
                  {parentComment?.comments}
                </Text>
              </View>
              <TouchableOpacity onPress={clearReplyState} style={styles.replyCancelButton}>
                <Text style={styles.replyCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          <View style={styles.inputContainer}>
            <TextInput
              ref={commentRef}
              value={userComment}
              placeholder={parentCommentId ? "Write a reply..." : "Add a field note or handover update"}
              onChangeText={setUserComment}
              placeholderTextColor="#64748B"
              style={styles.commentInput}
              multiline
            />
            <TouchableOpacity style={styles.iconWrapper} onPress={handleComment} disabled={submitting}>
              {submitting ? <ActivityIndicator size="small" color="#742BDE" /> : <Comment />}
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionLabel}>{comments.length} comment{comments.length === 1 ? "" : "s"}</Text>
        </View>
      }
      ListEmptyComponent={
        loading ? (
          <View style={styles.emptyState}>
            <ActivityIndicator size="small" color="#742BDE" />
            <Text style={styles.emptyText}>Loading comments...</Text>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No comments yet</Text>
            <Text style={styles.emptyText}>Use comments for floor notes, blockers, handovers, and completion context.</Text>
          </View>
        )
      }
      renderItem={({ item }) => (
        <View style={styles.commentThread}>
          <CommentItem item={item} level={0} />
          {item.replies?.map((reply) => (
            <CommentItem key={reply.id} item={reply} level={1} />
          ))}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  replyBanner: {
    marginBottom: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    backgroundColor: "#EFF6FF",
    padding: 12,
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  replyBannerTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    color: "#1D4ED8",
  },
  replyBannerText: {
    marginTop: 4,
    fontFamily: Fonts.regular,
    fontSize: 10,
    lineHeight: 15,
    color: "#475569",
  },
  replyCancelButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  replyCancelText: {
    fontFamily: Fonts.medium,
    fontSize: 10,
    color: "#1D4ED8",
  },
  inputContainer: {
    minHeight: 84,
    backgroundColor: "rgba(240, 237, 255, 0.40)",
    borderRadius: 10,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#CBD5E1",
    paddingRight: 8,
  },
  commentInput: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: 12,
    minHeight: 84,
    color: "#0F172A",
    textAlignVertical: "top",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  iconWrapper: {
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 10,
  },
  sectionLabel: {
    marginBottom: 10,
    fontFamily: Fonts.medium,
    fontSize: 10,
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  emptyState: {
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 16,
    alignItems: "center",
    gap: 8,
  },
  emptyTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    color: "#0F172A",
  },
  emptyText: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    lineHeight: 16,
    color: "#64748B",
    textAlign: "center",
  },
  commentThread: {
    marginBottom: 10,
    gap: 8,
  },
  commentCard: {
    borderRadius: 12,
    backgroundColor: "#fff",
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  replyCard: {
    marginLeft: 40,
    backgroundColor: "#F8FAFC",
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    flexShrink: 0,
  },
  avatarFallback: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    color: "#1D4ED8",
  },
  content: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
    gap: 8,
  },
  name: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: "#1C1C1C",
  },
  date: {
    marginTop: 2,
    fontFamily: Fonts.regular,
    fontSize: 9,
    color: "#64748B",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  actionButton: {
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  comment: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    lineHeight: 16,
    color: "#334155",
  },
  replyText: {
    color: "#2563EB",
    fontSize: 11,
    fontFamily: Fonts.medium,
  },
  deleteText: {
    color: "#DC2626",
    fontSize: 11,
    fontFamily: Fonts.medium,
  },
});
