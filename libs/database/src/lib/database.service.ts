import { Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE_PROVIDE_KEY } from './constants/drizzle-providers.constants';
import { relations, schema } from './schemas';

export class DatabaseService {
	constructor(@Inject(DRIZZLE_PROVIDE_KEY) public client: NodePgDatabase<typeof schema, typeof relations>) {}
}
