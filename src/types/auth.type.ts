export interface ChangePasswordDTO {
  password: string;
  newPassword: string;
}

export interface RegisterRequest {
  email: string;
  fullName: string;
  password: string;
}

export interface VerifyOtpRequest {
  email: string;
  otpCode: string;
}

export interface ResendOtpRequest {
  email: string;
}
