// export interface PaginationParams {
//   page: number;
//   size: number;
//   search?: string | undefined;
// }

// export interface PaginatedResponse<T> {
//   items: T[];
//   total: number;
//   page: number;
//   size: number;
//   totalPages: number;
// }

export interface UserResponse {
  userId: string;
  email: string;
  fullName: string;
  avatar: string | null;
  gender: number | null;
  isActive: boolean;
  createdAt: Date;
  roles: string[];
}

export interface UpdateUserDTO {
  fullName?: string;
  gender?: number;
  dateOfBirth?: string;
}

export interface UserProfile {
  userId: string;
  fullName: string;
  avatar: string | null;
  dateOfBirth: Date | null;
  gender: number | null;
  roles: string[];
}
