import { animalSummarySchema, getAnimalByIdResponseSchema } from '@pif/contracts';
import { z } from 'zod';

export type AnimalSummary = z.infer<typeof animalSummarySchema>;

export type AnimalDetails = z.infer<typeof getAnimalByIdResponseSchema>['data'];

export type AnimalLabel = NonNullable<AnimalSummary['labels']>[number];
