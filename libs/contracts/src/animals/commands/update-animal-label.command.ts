import { animalLabelSchema } from '@pif/database';
import { createZodDto } from 'nestjs-zod';
import { createApiSuccessResponseSchema } from '../../common/base.responses';
import { createAnimalLabelRequestSchema } from './create-animal-label.command';

export const updateAnimalLabelRequestSchema = createAnimalLabelRequestSchema.partial();

export class UpdateAnimalLabelRequestDto extends createZodDto(updateAnimalLabelRequestSchema) {}

export const updateAnimalLabelResponseSchema = createApiSuccessResponseSchema(animalLabelSchema);

export class UpdateAnimalLabelResponseDto extends createZodDto(updateAnimalLabelResponseSchema) {}
