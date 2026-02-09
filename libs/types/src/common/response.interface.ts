export interface IApiSuccessResponse<T> {
	success: true;
	data: T;
	meta?: {
		total?: number;
		page?: number;
		perPage?: number;
		totalPages?: number;
		[key: string]: unknown;
	};
}

export interface IApiErrorResponse {
	success: false;
	error: {
		code: string;
		message: string;
		details?: unknown[];
	};
}

export type ApiResponse<T> = IApiSuccessResponse<T> | IApiErrorResponse;

export interface IPaginatedResult<T> {
	data: T;
	meta: IApiSuccessResponse<unknown>['meta'];
}
