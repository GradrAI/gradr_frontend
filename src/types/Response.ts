export interface Response<T = unknown> {
  statusCode?: number;
  status: "success" | "error";
  message: string;
  data?: T;
  error?: string;
}
