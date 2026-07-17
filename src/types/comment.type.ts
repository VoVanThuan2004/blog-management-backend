export interface CommentRequest {
  blogId: string;
  parentCommentId?: string | null;
  content: string;
}

export interface CommentResponse {
  commentId: string;
  userId: string;
  fullName: string;
  avatar: string | null;
  blogId: string;
  parentCommentId?: string | null;
  content: string;
  createdAt: string;
}
