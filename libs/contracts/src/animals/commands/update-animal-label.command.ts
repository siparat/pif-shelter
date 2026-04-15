import { createApiSuccessResponseSchema } from '../../common/base.responses';
import { animalLabelSchema } from '../../common/schemas';
import { createAnimalLabelRequestSchema } from './create-animal-label.command';

export const updateAnimalLabelRequestSchema = createAnimalLabelRequestSchema.partial();

export const updateAnimalLabelResponseSchema = createApiSuccessResponseSchema(animalLabelSchema);
