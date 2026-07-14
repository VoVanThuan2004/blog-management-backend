export interface ApiResponseType<T> {
  success: boolean;
  code: number;
  message: string;
  data?: T;
}