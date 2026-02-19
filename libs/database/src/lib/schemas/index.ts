import { relations as animalsRelations, schema as animalsSchema } from './animals.schema';
import { relations as usersRelations, schema as usersSchema } from './users.schema';

export const relations = {
	...animalsRelations,
	...usersRelations
};

export const schema = {
	...animalsSchema,
	...usersSchema
};

export * from './animals.schema';
export * from './users.schema';
