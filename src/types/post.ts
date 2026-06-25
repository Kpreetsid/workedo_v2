export interface PostUser {
  id?: string;
  _id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  username?: string;
}

export interface PostFile {
  fileURL?: string;
  fileName?: string;
  folderName?: string;
  container?: string;
  type?: string;
  name?: string;
}

export interface PostComment {
  _id?: string;
  id?: string;
  comments: string;
  createdBy?: PostUser;
  createdAt?: string;
  replies?: PostComment[];
}

export interface Post {
  _id?: string;
  id?: string;
  title: string;
  postType: string;
  relatedTo: string;
  description: string;
  priority?: string;
  publishTo?: string[];
  files?: PostFile[] | Record<string, PostFile[]>;
  images?: string[];
  likes?: string[];
  dislikes?: string[];
  comments?: PostComment[];
  user?: PostUser;
  createdOn?: string | number;
  createdAt?: string;
}

export interface PostPayload {
  title: string;
  postType: string;
  relatedTo: string;
  description: string;
  priority?: string;
  publishTo?: string[];
}
