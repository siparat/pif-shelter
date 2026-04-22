import {
	assignAnimalLabelResponseSchema,
	changeAnimalStatusResponseSchema,
	createAnimalLabelResponseSchema,
	createAnimalResponseSchema,
	deleteAnimalResponseSchema,
	getAnimalByIdResponseSchema,
	listAnimalLabelsResponseSchema,
	listAnimalsRequestSchema,
	ListAnimalsResult,
	setAnimalCuratorResponseSchema,
	setAnimalGalleryResponseSchema,
	setCostOfGuardianshipResponseSchema,
	updateAnimalLabelResponseSchema,
	updateAnimalResponseSchema
} from '@pif/contracts';
import { z } from 'zod';

export type AnimalsListParams = z.input<typeof listAnimalsRequestSchema>;
export type AnimalsListData = ListAnimalsResult;
export type AnimalItem = AnimalsListData['data'][number];
export type AnimalDetails = z.infer<typeof getAnimalByIdResponseSchema>['data'];

export type AnimalLabel = z.infer<typeof listAnimalLabelsResponseSchema>['data'][number];

export type CreateAnimalPayload = z.infer<typeof createAnimalResponseSchema>['data'];
export type DeleteAnimalPayload = z.infer<typeof deleteAnimalResponseSchema>['data'];
export type UpdateAnimalPayload = z.infer<typeof updateAnimalResponseSchema>['data'];
export type ChangeAnimalStatusPayload = z.infer<typeof changeAnimalStatusResponseSchema>['data'];
export type SetAnimalCuratorPayload = z.infer<typeof setAnimalCuratorResponseSchema>['data'];
export type SetAnimalGalleryPayload = z.infer<typeof setAnimalGalleryResponseSchema>['data'];
export type SetCostOfGuardianshipPayload = z.infer<typeof setCostOfGuardianshipResponseSchema>['data'];
export type AssignAnimalLabelPayload = z.infer<typeof assignAnimalLabelResponseSchema>['data'];
export type CreateAnimalLabelPayload = z.infer<typeof createAnimalLabelResponseSchema>['data'];
export type UpdateAnimalLabelPayload = z.infer<typeof updateAnimalLabelResponseSchema>['data'];
