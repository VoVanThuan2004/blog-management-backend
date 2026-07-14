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
