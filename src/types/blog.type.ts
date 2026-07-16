export enum BlogStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export interface BlogRequest {
  categoryId: string;
  title: string;
  content: string;
}

export interface BlogResponse {
  blogId: string;
  authorId: string;
  authorName: string;
  avatar: string | null;
  categoryId: string;
  title: string;
  content: string;
  status: BlogStatus;
  createdAt: string;
  updatedAt: string;
}
