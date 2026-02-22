import { animalWithLabelsSchema } from '@pif/database';
import { createZodDto } from 'nestjs-zod';

export class AnimalDto extends createZodDto(animalWithLabelsSchema) {}

export const animalSummarySchema = animalWithLabelsSchema.omit({
	description: true,
	galleryUrls: true
});
export class AnimalSummaryDto extends createZodDto(animalSummarySchema) {}
