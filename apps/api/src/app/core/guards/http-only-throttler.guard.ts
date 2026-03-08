import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class HttpOnlyThrottlerGuard extends ThrottlerGuard implements CanActivate {
	override async canActivate(context: ExecutionContext): Promise<boolean> {
		if (context.getType() !== 'http') {
			return true;
		}
		return super.canActivate(context);
	}
}
