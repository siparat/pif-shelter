import { z } from 'zod';
import { createApiSuccessResponseSchema } from '../../common/base.responses';
import { animalLabelSchema } from '../../common/schemas';

export const listAnimalLabelsResponseSchema = createApiSuccessResponseSchema(z.array(animalLabelSchema));
