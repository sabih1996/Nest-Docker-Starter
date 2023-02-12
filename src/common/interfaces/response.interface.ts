export interface IResponse {
  success: boolean;
  message: string;
  errorMessage: string;
  data: any[];
  error: any;
}

export interface IPaginatedResponse {
  success: boolean;
  statusCode: number;
  totalRecords?: number;
  totalPages?: number;
  currentPage?: number;
  data: any;
}
