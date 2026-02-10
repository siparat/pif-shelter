import { createSelectSchema } from 'drizzle-orm/zod';
import z from 'zod';
import { animalLabels, animals } from '../schemas';

export const animalSchema = createSelectSchema(animals);
export type Animal = z.infer<typeof animalSchema>;

export const animalLabelSchema = createSelectSchema(animalLabels);
export type AnimalLabel = z.infer<typeof animalLabelSchema>;

export const animalWithLabelsSchema = animalSchema.extend({
	labels: z.array(animalLabelSchema)
});
export type AnimalWithLabels = z.infer<typeof animalWithLabelsSchema>;
