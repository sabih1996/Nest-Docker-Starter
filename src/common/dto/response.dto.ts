import {
  IPaginatedResponse,
  IResponse,
} from '../interfaces/response.interface';

export class ResponseError implements IResponse {
  constructor(infoMessage: string, data?: any) {
    this.success = false;
    this.message = infoMessage;
    this.data = data;
    console.warn(
      new Date().toString() +
        ' - [Response]: ' +
        infoMessage +
        (data ? ' - ' + JSON.stringify(data) : ''),
    );
  }
  message: string;
  data: any[];
  errorMessage: any;
  error: any;
  success: boolean;
}

export class ResponseSuccess implements IResponse {
  constructor(infoMessage: string, data?: any, notLog?: boolean) {
    this.success = true;
    this.message = infoMessage;
    this.data = data;
    if (!notLog) {
      try {
        const offuscateRequest = JSON.parse(JSON.stringify(data));
        if (offuscateRequest && offuscateRequest.token)
          offuscateRequest.token = '*******';
        console.log(
          new Date().toString() +
            ' - [Response]: ' +
            JSON.stringify(offuscateRequest),
        );
      } catch (error) {}
    }
  }
  message: string;
  data: any[];
  errorMessage: any;
  error: any;
  success: boolean;
}

export class PaginatedResponse implements IPaginatedResponse {
  statusCode: number;
  totalRecords: number;
  totalPages: number;
  currentPage: number;
  constructor(
    success: boolean,
    statusCode: number,
    data?: any,
    totalRecords?: number,
    totalPages?: number,
    currentPage?: number,
  ) {
    this.success = success;
    this.statusCode = statusCode;
    this.totalRecords = totalRecords;
    this.totalPages = totalPages;
    this.currentPage = currentPage;
    this.data = data;
  }
  data: any;
  success: boolean;
}
