import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { IApiSuccessResponse, IPaginatedResult } from '@pif/types';
import { map, Observable } from 'rxjs';

@Injectable()
export class GlobalDeserializerInterceptor implements NestInterceptor {
	intercept(_: ExecutionContext, next: CallHandler): Observable<IApiSuccessResponse<unknown>> {
		return next.handle().pipe(
			map((res: unknown) => {
				if (this.isPaginatedResult(res)) {
					return {
						success: true,
						data: res.data,
						meta: res.meta
					};
				}

				return {
					success: true,
					data: res
				};
			})
		);
	}

	private isPaginatedResult(data: unknown): data is IPaginatedResult<unknown> {
		return typeof data === 'object' && data !== null && 'data' in data && 'meta' in data;
	}
}
