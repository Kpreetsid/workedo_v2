import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  View,
} from "react-native";

import Fonts from "@/constants/Typography";
import Header from "@/src/components/global/Header";
import CreateFAB from "@/src/components/global/CreateFAB";
import { endpoints } from "@/src/services/api/endpoints";
import {
  createPost,
  createPostComment,
  deletePost,
  deletePostComment,
  getPostComments,
  getPosts,
  togglePostLike,
  updatePost,
} from "@/src/services/post.service";
import { useAuthStore } from "@/src/state/auth/useAuthStore";
import { Post, PostComment, PostPayload } from "@/src/types/post";

const postTypes = ["General", "Maintenance", "Quality", "Breakdown", "Kaizen"];
const tags = ["Location", "Product", "Material", "Method", "Scan", "Other"];
const priorities = ["", "Low", "Medium", "High"];

const resolveId = (value: any): string => {
  if (!value) return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  return String(value.id || value._id || "");
};

const stripHtml = (value: string = "") => value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

const getInitials = (user?: any) => {
  const first = user?.firstName?.trim()?.charAt(0) || "";
  const last = user?.lastName?.trim()?.charAt(0) || "";
  return `${first}${last}`.toUpperCase() || "U";
};

const getUserName = (user?: any) => {
  const name = `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
  return name || user?.username || user?.email || "Unknown User";
};

const formatDate = (value?: string | number) => {
  if (!value) return "No date";
  const normalized = typeof value === "number" && value < 1e12 ? value * 1000 : value;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return "No date";
  return date.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
};

const normalizeFiles = (files: Post["files"]): any[] => {
  if (!files) return [];
  if (Array.isArray(files)) return files;
  const firstArray = Object.values(files).find((entry) => Array.isArray(entry));
  return firstArray || [];
};

const normalizeImages = (post: Post): string[] => {
  if (Array.isArray(post.images)) return post.images;

  return normalizeFiles(post.files)
    .map((file) => {
      if (!file) return "";
      if (file.fileURL) {
        const url = String(file.fileURL);
        if (url.includes("app.presageinsights.ai/") && !url.includes("/cmms_express/")) {
          return url.replace("app.presageinsights.ai/", "app.presageinsights.ai/cmms_express/");
        }
        return url;
      }
      const fileName = file.fileName || file.name;
      const folderName = file.folderName || file.container;
      if (fileName && folderName) {
        return `${endpoints.baseURL}${folderName}/${fileName}`;
      }
      return "";
    })
    .filter((url) => /\.(jpe?g|png|gif|webp|bmp)$/i.test(url));
};

const normalizePosts = (items: Post[]): Post[] =>
  (items || []).map((post) => ({
    ...post,
    id: resolveId(post),
    images: normalizeImages(post),
    description: stripHtml(post.description || ""),
    likes: Array.isArray(post.likes) ? post.likes.map(String) : [],
  }));

export default function PostsScreen() {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPostTypes, setSelectedPostTypes] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [commentsPost, setCommentsPost] = useState<Post | null>(null);

  const fetchPosts = useCallback(async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    try {
      const res = await getPosts({ postType: selectedPostTypes, relatedTo: selectedTags });
      setPosts(normalizePosts(Array.isArray(res?.data) ? res.data : []));
    } catch (error: any) {
      if (error?.status !== 404) {
        ToastAndroid.show(error?.message || "Unable to load posts", ToastAndroid.LONG);
      }
      setPosts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedPostTypes, selectedTags]);

  useFocusEffect(
    useCallback(() => {
      fetchPosts();
    }, [fetchPosts])
  );

  const toggleFilter = (value: string, selected: string[], setter: (value: string[]) => void) => {
    setter(selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value]);
  };

  const clearFilters = () => {
    setSelectedPostTypes([]);
    setSelectedTags([]);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchPosts(false);
  };

  const handleLike = async (post: Post) => {
    const postId = resolveId(post);
    if (!postId) return;

    const userId = resolveId(user);
    const liked = userId && (post.likes || []).map(String).includes(userId);
    setPosts((current) => current.map((item) => {
      if (resolveId(item) !== postId) return item;
      const likes = liked
        ? (item.likes || []).filter((id) => String(id) !== userId)
        : [...(item.likes || []), userId || "me"];
      return { ...item, likes };
    }));

    try {
      await togglePostLike(postId);
      fetchPosts(false);
    } catch (error: any) {
      ToastAndroid.show(error?.message || "Unable to update like", ToastAndroid.LONG);
      fetchPosts(false);
    }
  };

  const confirmDelete = (post: Post) => {
    const postId = resolveId(post);
    if (!postId) return;

    Alert.alert("Delete Post", `Delete "${post.title}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const res = await deletePost(postId);
            if (res?.status) {
              ToastAndroid.show("Post deleted", ToastAndroid.SHORT);
              fetchPosts(false);
            }
          } catch (error: any) {
            ToastAndroid.show(error?.message || "Unable to delete post", ToastAndroid.LONG);
          }
        },
      },
    ]);
  };

  const visibleCount = posts.length;
  const activeFilterCount = selectedPostTypes.length + selectedTags.length;

  return (
    <View style={styles.container}>
      <Header title="Posts" />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Community Updates</Text>
          <Text style={styles.summaryValue}>{visibleCount}</Text>
          <Text style={styles.summaryText}>Posts from the same backend feed used by web.</Text>
        </View>

        <FilterSection
          title="Post Type"
          items={postTypes}
          selected={selectedPostTypes}
          onToggle={(value) => toggleFilter(value, selectedPostTypes, setSelectedPostTypes)}
        />
        <FilterSection
          title="Tag"
          items={tags}
          selected={selectedTags}
          onToggle={(value) => toggleFilter(value, selectedTags, setSelectedTags)}
        />

        {activeFilterCount > 0 ? (
          <Pressable style={styles.clearButton} onPress={clearFilters}>
            <Ionicons name="filter-circle-outline" size={16} color="#742BDE" />
            <Text style={styles.clearButtonText}>Clear filters</Text>
          </Pressable>
        ) : null}

        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator color="#742BDE" />
            <Text style={styles.loadingText}>Loading posts...</Text>
          </View>
        ) : posts.length ? (
          <View style={styles.list}>
            {posts.map((post) => (
              <PostCard
                key={resolveId(post)}
                post={post}
                onLike={() => handleLike(post)}
                onEdit={() => setEditingPost(post)}
                onDelete={() => confirmDelete(post)}
                onComments={() => setCommentsPost(post)}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="newspaper-outline" size={36} color="#B8B2C8" />
            <Text style={styles.emptyTitle}>No posts found</Text>
            <Text style={styles.emptyMessage}>Create the first post or adjust your filters.</Text>
          </View>
        )}
      </ScrollView>

      <CreateFAB label="Create Post" onPress={() => setEditingPost({} as Post)} />
      <PostEditorModal
        post={editingPost}
        onClose={() => setEditingPost(null)}
        onSaved={() => {
          setEditingPost(null);
          fetchPosts(false);
        }}
      />
      <CommentsModal post={commentsPost} onClose={() => setCommentsPost(null)} />
    </View>
  );
}

function FilterSection({ title, items, selected, onToggle }: { title: string; items: string[]; selected: string[]; onToggle: (value: string) => void }) {
  return (
    <View style={styles.filterSection}>
      <Text style={styles.filterTitle}>{title}</Text>
      <View style={styles.filterRow}>
        {items.map((item) => {
          const active = selected.includes(item);
          return (
            <Pressable key={item} style={[styles.filterChip, active && styles.filterChipActive]} onPress={() => onToggle(item)}>
              <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{item}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function PostCard({ post, onLike, onEdit, onDelete, onComments }: { post: Post; onLike: () => void; onEdit: () => void; onDelete: () => void; onComments: () => void }) {
  const image = post.images?.[0];
  return (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{getInitials(post.user)}</Text></View>
        <View style={styles.postHeaderText}>
          <Text style={styles.author}>{getUserName(post.user)}</Text>
          <Text style={styles.date}>Created on {formatDate(post.createdOn || post.createdAt)}</Text>
        </View>
        <View style={styles.typePill}><Text style={styles.typeText}>{post.postType || "General"}</Text></View>
      </View>

      <Text style={styles.postTitle}>{post.title || "Title"}</Text>
      {image ? <Image source={{ uri: image }} style={styles.postImage} contentFit="cover" /> : null}
      {post.priority ? <Text style={styles.priority}>#{post.priority}</Text> : null}
      <Text style={styles.description}>{post.description || "No description added."}</Text>
      <Text style={styles.tag}>Tagged - {post.relatedTo || "Other"}</Text>

      <View style={styles.postActions}>
        <Pressable style={styles.actionButton} onPress={onLike}>
          <Ionicons name="thumbs-up-outline" size={17} color="#742BDE" />
          <Text style={styles.actionText}>{post.likes?.length || 0} Likes</Text>
        </Pressable>
        <Pressable style={styles.actionButton} onPress={onComments}>
          <Ionicons name="chatbubble-outline" size={17} color="#742BDE" />
          <Text style={styles.actionText}>Comments</Text>
        </Pressable>
        <Pressable style={styles.iconAction} onPress={onEdit}>
          <Ionicons name="pencil-outline" size={17} color="#555" />
        </Pressable>
        <Pressable style={styles.iconAction} onPress={onDelete}>
          <Ionicons name="trash-outline" size={17} color="#D63928" />
        </Pressable>
      </View>
    </View>
  );
}

function PostEditorModal({ post, onClose, onSaved }: { post: Post | null; onClose: () => void; onSaved: () => void }) {
  const [title, setTitle] = useState("");
  const [postType, setPostType] = useState("General");
  const [relatedTo, setRelatedTo] = useState("Other");
  const [priority, setPriority] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (post) {
      setTitle(post.title || "");
      setPostType(post.postType || "General");
      setRelatedTo(post.relatedTo || "Other");
      setPriority(post.priority || "");
      setDescription(post.description || "");
    }
  }, [post]);

  const save = async () => {
    if (!title.trim() || !description.trim()) {
      ToastAndroid.show("Title and description are required", ToastAndroid.SHORT);
      return;
    }

    const payload: PostPayload = {
      title: title.trim(),
      postType,
      relatedTo,
      description: description.trim(),
      priority: priority || undefined,
    };

    setSaving(true);
    try {
      const postId = resolveId(post);
      const res = postId ? await updatePost(postId, payload) : await createPost(payload);
      if (res?.status) {
        ToastAndroid.show(postId ? "Post updated" : "Post created", ToastAndroid.SHORT);
        onSaved();
      }
    } catch (error: any) {
      ToastAndroid.show(error?.message || "Unable to save post", ToastAndroid.LONG);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={!!post} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{resolveId(post) ? "Edit Post" : "Create Post"}</Text>
            <Pressable onPress={onClose}><Ionicons name="close" size={22} color="#222" /></Pressable>
          </View>
          <ScrollView>
            <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Title" placeholderTextColor="#8B8B94" />
            <ChoiceRow title="Post Type" items={postTypes} value={postType} onChange={setPostType} />
            <ChoiceRow title="Tag" items={tags} value={relatedTo} onChange={setRelatedTo} />
            <ChoiceRow title="Priority" items={priorities} value={priority} onChange={setPriority} formatLabel={(item) => item || "None"} />
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Description"
              placeholderTextColor="#8B8B94"
              multiline
              textAlignVertical="top"
            />
            <Pressable style={[styles.saveButton, saving && styles.saveButtonDisabled]} onPress={save} disabled={saving}>
              <Text style={styles.saveButtonText}>{saving ? "Saving..." : "Save Post"}</Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function ChoiceRow({ title, items, value, onChange, formatLabel }: { title: string; items: string[]; value: string; onChange: (value: string) => void; formatLabel?: (value: string) => string }) {
  return (
    <View style={styles.choiceSection}>
      <Text style={styles.choiceTitle}>{title}</Text>
      <View style={styles.filterRow}>
        {items.map((item) => {
          const active = value === item;
          return (
            <Pressable key={`${title}-${item || "none"}`} style={[styles.filterChip, active && styles.filterChipActive]} onPress={() => onChange(item)}>
              <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{formatLabel ? formatLabel(item) : item}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function CommentsModal({ post, onClose }: { post: Post | null; onClose: () => void }) {
  const [comments, setComments] = useState<PostComment[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const postId = resolveId(post);

  const fetchComments = useCallback(async () => {
    if (!postId) return;
    setLoading(true);
    try {
      const res = await getPostComments(postId);
      setComments(Array.isArray(res?.data) ? res.data : []);
    } catch {
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    if (postId) fetchComments();
  }, [postId, fetchComments]);

  const addComment = async () => {
    if (!text.trim() || !postId) return;
    try {
      const res = await createPostComment(postId, text.trim());
      if (res?.status) {
        setText("");
        fetchComments();
      }
    } catch (error: any) {
      ToastAndroid.show(error?.message || "Unable to add comment", ToastAndroid.LONG);
    }
  };

  const removeComment = async (commentId: string) => {
    if (!postId) return;
    try {
      const res = await deletePostComment(postId, commentId);
      if (res?.status) fetchComments();
    } catch (error: any) {
      ToastAndroid.show(error?.message || "Unable to delete comment", ToastAndroid.LONG);
    }
  };

  return (
    <Modal visible={!!post} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Comments</Text>
            <Pressable onPress={onClose}><Ionicons name="close" size={22} color="#222" /></Pressable>
          </View>
          <View style={styles.commentInputRow}>
            <TextInput style={styles.commentInput} value={text} onChangeText={setText} placeholder="Write a comment" placeholderTextColor="#8B8B94" />
            <Pressable style={styles.sendButton} onPress={addComment}>
              <Ionicons name="send" size={18} color="#fff" />
            </Pressable>
          </View>
          <ScrollView style={{ maxHeight: 420 }}>
            {loading ? <ActivityIndicator color="#742BDE" /> : comments.length ? comments.map((comment) => (
              <CommentItem key={resolveId(comment)} comment={comment} onDelete={removeComment} />
            )) : <Text style={styles.emptyComment}>No comments yet.</Text>}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function CommentItem({ comment, onDelete, depth = 0 }: { comment: PostComment; onDelete: (id: string) => void; depth?: number }) {
  const commentId = resolveId(comment);
  return (
    <View style={[styles.commentItem, depth > 0 && styles.commentReply]}>
      <View style={{ flex: 1 }}>
        <Text style={styles.commentAuthor}>{getUserName(comment.createdBy)}</Text>
        <Text style={styles.commentText}>{comment.comments}</Text>
      </View>
      {commentId ? (
        <Pressable onPress={() => onDelete(commentId)}>
          <Ionicons name="trash-outline" size={15} color="#D63928" />
        </Pressable>
      ) : null}
      {(comment.replies || []).map((reply) => (
        <CommentItem key={resolveId(reply)} comment={reply} onDelete={onDelete} depth={depth + 1} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FA" },
  content: { padding: 16, paddingBottom: 96 },
  summaryCard: { backgroundColor: "#fff", borderRadius: 8, padding: 14, borderWidth: StyleSheet.hairlineWidth, borderColor: "#E7E4EF" },
  summaryLabel: { fontFamily: Fonts.semiBold, fontSize: 11, color: "#742BDE", textTransform: "uppercase" },
  summaryValue: { fontFamily: Fonts.semiBold, fontSize: 26, color: "#222", marginTop: 4 },
  summaryText: { fontFamily: Fonts.regular, fontSize: 12, color: "#6B6875" },
  filterSection: { marginTop: 14 },
  filterTitle: { fontFamily: Fonts.semiBold, fontSize: 12, color: "#222", marginBottom: 8 },
  filterRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: "#fff", borderWidth: StyleSheet.hairlineWidth, borderColor: "#E7E4EF" },
  filterChipActive: { backgroundColor: "#742BDE", borderColor: "#742BDE" },
  filterChipText: { fontFamily: Fonts.medium, fontSize: 11, color: "#6B6875" },
  filterChipTextActive: { color: "#fff" },
  clearButton: { marginTop: 12, flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", padding: 8 },
  clearButtonText: { fontFamily: Fonts.semiBold, fontSize: 12, color: "#742BDE" },
  loading: { padding: 30, alignItems: "center" },
  loadingText: { marginTop: 8, fontFamily: Fonts.regular, fontSize: 12, color: "#6B6875" },
  list: { marginTop: 14, gap: 12 },
  postCard: { backgroundColor: "#fff", borderRadius: 8, padding: 14, borderWidth: StyleSheet.hairlineWidth, borderColor: "#E7E4EF" },
  postHeader: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#742BDE", alignItems: "center", justifyContent: "center", marginRight: 10 },
  avatarText: { fontFamily: Fonts.semiBold, fontSize: 12, color: "#fff" },
  postHeaderText: { flex: 1 },
  author: { fontFamily: Fonts.semiBold, fontSize: 13, color: "#222" },
  date: { fontFamily: Fonts.regular, fontSize: 10, color: "#8B8B94", marginTop: 2 },
  typePill: { borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5, backgroundColor: "#F2EBFF" },
  typeText: { fontFamily: Fonts.semiBold, fontSize: 10, color: "#742BDE" },
  postTitle: { marginTop: 12, fontFamily: Fonts.semiBold, fontSize: 16, color: "#222" },
  postImage: { width: "100%", height: 190, borderRadius: 8, marginTop: 10, backgroundColor: "#EEE" },
  priority: { marginTop: 10, fontFamily: Fonts.semiBold, fontSize: 12, color: "#D63928" },
  description: { marginTop: 8, fontFamily: Fonts.regular, fontSize: 13, lineHeight: 19, color: "#575463" },
  tag: { marginTop: 8, fontFamily: Fonts.medium, fontSize: 12, color: "#6B6875" },
  postActions: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#EEE", paddingTop: 10 },
  actionButton: { flexDirection: "row", alignItems: "center", gap: 5, paddingVertical: 7, paddingHorizontal: 8 },
  actionText: { fontFamily: Fonts.medium, fontSize: 11, color: "#742BDE" },
  iconAction: { padding: 8 },
  emptyState: { marginTop: 14, alignItems: "center", backgroundColor: "#fff", borderRadius: 8, padding: 28, borderWidth: StyleSheet.hairlineWidth, borderColor: "#E7E4EF" },
  emptyTitle: { marginTop: 10, fontFamily: Fonts.semiBold, fontSize: 14, color: "#222" },
  emptyMessage: { marginTop: 4, fontFamily: Fonts.regular, fontSize: 12, color: "#6B6875", textAlign: "center" },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "center", padding: 18 },
  modalCard: { maxHeight: "88%", backgroundColor: "#fff", borderRadius: 8, padding: 16 },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  modalTitle: { fontFamily: Fonts.semiBold, fontSize: 16, color: "#222" },
  input: { minHeight: 42, borderRadius: 8, borderWidth: 1, borderColor: "#E1E8EE", paddingHorizontal: 12, fontFamily: Fonts.regular, fontSize: 13, color: "#222", marginBottom: 12 },
  textArea: { minHeight: 110, paddingTop: 10 },
  choiceSection: { marginBottom: 12 },
  choiceTitle: { fontFamily: Fonts.semiBold, fontSize: 12, color: "#222", marginBottom: 8 },
  saveButton: { backgroundColor: "#742BDE", borderRadius: 8, alignItems: "center", paddingVertical: 12, marginTop: 4 },
  saveButtonDisabled: { opacity: 0.7 },
  saveButtonText: { fontFamily: Fonts.semiBold, fontSize: 13, color: "#fff" },
  commentInputRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  commentInput: { flex: 1, minHeight: 42, borderRadius: 8, borderWidth: 1, borderColor: "#E1E8EE", paddingHorizontal: 12, fontFamily: Fonts.regular, fontSize: 13 },
  sendButton: { width: 42, height: 42, borderRadius: 8, backgroundColor: "#742BDE", alignItems: "center", justifyContent: "center" },
  emptyComment: { fontFamily: Fonts.regular, fontSize: 12, color: "#8B8B94", textAlign: "center", padding: 18 },
  commentItem: { flexDirection: "row", alignItems: "flex-start", gap: 8, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#EEE" },
  commentReply: { marginLeft: 16 },
  commentAuthor: { fontFamily: Fonts.semiBold, fontSize: 12, color: "#222" },
  commentText: { marginTop: 3, fontFamily: Fonts.regular, fontSize: 12, color: "#575463", lineHeight: 17 },
});
