import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@pif/shared';
import { UserSession } from '@thallesp/nestjs-better-auth';
import { Roles } from '../decorators/roles.decorator';
import { RoleForbiddenException } from '../exceptions/role-forbidden.exception';

@Injectable()
export class RoleGuard implements CanActivate {
	constructor(private reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const res = context.switchToHttp().getRequest();
		const session: UserSession | undefined = res.session;
		const userRole = session?.user?.role;
		if (!userRole || typeof userRole !== 'string') {
			throw new RoleForbiddenException();
		}
		const roles = this.reflector.get(Roles, context.getHandler());
		if (!roles || roles.length === 0) {
			return true;
		}
		//TODO: UserRole to session
		if (!roles.includes(userRole as UserRole)) {
			throw new RoleForbiddenException();
		}

		return true;
	}
}
