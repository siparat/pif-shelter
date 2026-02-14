import { randomUUID } from 'node:crypto';
import { ClsModuleOptions } from 'nestjs-cls';

export const getClsConfig = (): ClsModuleOptions => ({
	global: true,
	middleware: {
		mount: true,
		generateId: true,
		idGenerator: (req) => req.id ?? req.headers['x-request-id'] ?? randomUUID()
	}
});
