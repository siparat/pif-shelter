import { relations as animalsRelations, schema as animalsSchema } from './animals.schema';
import { relations as authRelations, schema as authSchema } from './auth.schema';

export const relations = {
	...animalsRelations,
	...authRelations
};

export const schema = {
	...animalsSchema,
	...authSchema
};

export * from './animals.schema';
export * from './auth.schema';
