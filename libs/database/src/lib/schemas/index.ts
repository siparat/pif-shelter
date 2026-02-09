import { relations as animalsRelations, schema as animalsSchema } from './animals.schema';

export const relations = {
	...animalsRelations
};

export const schema = {
	...animalsSchema
};

export * from './animals.schema';
