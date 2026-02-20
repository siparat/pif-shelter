import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Session } from '../../configs/auth.config';
import { Roles } from '../decorators/roles.decorator';
import { RoleForbiddenException } from '../exceptions/role-forbidden.exception';

@Injectable()
export class RoleGuard implements CanActivate {
	constructor(private reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const res = context.switchToHttp().getRequest();
		const session: Session | undefined = res.session;
		const userRole = session?.user?.role;

		if (!userRole) {
			throw new RoleForbiddenException();
		}

		const roles = this.reflector.get(Roles, context.getHandler());
		if (!roles || roles.length === 0) {
			return true;
		}

		if (!roles.includes(userRole)) {
			throw new RoleForbiddenException();
		}

		return true;
	}
}
