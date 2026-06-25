import { sendRequest } from "./api/api.service";
import { endpoints } from "./api/endpoints";
import { PostPayload } from "../types/post";

export const getPosts = async (params: { postType?: string[]; relatedTo?: string[] } = {}) => {
  const searchParams = new URLSearchParams();

  if (params.postType?.length) {
    searchParams.append("postType", params.postType.join(","));
  }

  if (params.relatedTo?.length) {
    searchParams.append("relatedTo", params.relatedTo.join(","));
  }

  const query = searchParams.toString();
  const url = query ? `${endpoints.posts.list}?${query}` : endpoints.posts.list;
  return await sendRequest("GET", url);
};

export const createPost = async (payload: PostPayload) => {
  return await sendRequest("POST", endpoints.posts.list, payload);
};

export const updatePost = async (id: string, payload: PostPayload) => {
  return await sendRequest("PUT", `${endpoints.posts.list}/${id}`, payload);
};

export const deletePost = async (id: string) => {
  return await sendRequest("DELETE", `${endpoints.posts.list}/${id}`);
};

export const togglePostLike = async (id: string) => {
  return await sendRequest("PUT", `${endpoints.posts.list}/${id}/like`, {});
};

export const getPostComments = async (postId: string) => {
  return await sendRequest("GET", `${endpoints.posts.list}/${postId}/comments`);
};

export const createPostComment = async (postId: string, comments: string, parentCommentId?: string | null) => {
  return await sendRequest("POST", `${endpoints.posts.list}/${postId}/comments`, {
    comments,
    parentCommentId: parentCommentId || null,
  });
};

export const deletePostComment = async (postId: string, commentId: string) => {
  return await sendRequest("DELETE", `${endpoints.posts.list}/${postId}/comments/${commentId}`);
};
