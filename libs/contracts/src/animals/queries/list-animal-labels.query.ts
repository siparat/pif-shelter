import { animalLabelSchema } from '@pif/database';
import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { createApiSuccessResponseSchema } from '../../common/base.responses';

export const listAnimalLabelsResponseSchema = createApiSuccessResponseSchema(z.array(animalLabelSchema));

export class ListAnimalLabelsResponseDto extends createZodDto(listAnimalLabelsResponseSchema) {}
