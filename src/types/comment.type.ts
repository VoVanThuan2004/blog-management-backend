export interface CommentRequest {
  blogId: string;
  parentCommentId?: string | null;
  content: string;
}

export interface CommentUpdateRequest {
  content: string;
}

export interface CommentReaction {
  reactionId: string;
  reactionType: string;
  userId: string;
  commentId: string;
  createdAt: string;
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
  reactions: CommentReaction[];
  replyCount: number;
}
