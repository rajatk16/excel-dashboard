export interface ApiResponseMeta {
  requestId: string;
  timestamp: string;
}

export interface PaginationMeta {
  nextCursor: string | null;
  hasNextPage: boolean;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta: ApiResponseMeta;
}

export interface ApiErrorDetail {
  field: string;
  code: string;
  message: string;
}

export interface ApiErrorBody {
  code: string;
  message: string;
  details?: ApiErrorDetail[];
}

export interface ApiErrorResponse {
  success: false;
  error: ApiErrorBody;
  meta: ApiResponseMeta;
}

export type ApiResponse<T> =
  | ApiSuccessResponse<T>
  | ApiErrorResponse;

export interface CursorPage<T> {
  items: T[];
  pagination: PaginationMeta;
}
