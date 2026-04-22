import {
	ApiSuccessResponse,
	assignAnimalLabelRequestSchema,
	changeAnimalStatusRequestSchema,
	createAnimalRequestSchema,
	deleteAnimalResponseSchema,
	setAnimalCuratorRequestSchema,
	setAnimalGalleryRequestSchema,
	setCostOfGuardianshipRequestSchema,
	updateAnimalRequestSchema
} from '@pif/contracts';
import { z } from 'zod';
import { api } from '../../../shared/api';
import {
	AnimalDetails,
	AnimalItem,
	AnimalsListData,
	AnimalsListParams,
	AssignAnimalLabelPayload,
	ChangeAnimalStatusPayload,
	CreateAnimalPayload,
	DeleteAnimalPayload,
	SetAnimalCuratorPayload,
	SetAnimalGalleryPayload,
	SetCostOfGuardianshipPayload,
	UpdateAnimalPayload
} from '../model/types';

const buildSearchParams = (params: AnimalsListParams): Record<string, string> => {
	const rawEntries = Object.entries(params).filter(
		([, value]) => value !== undefined && value !== null && value !== ''
	);
	return Object.fromEntries(rawEntries.map(([key, value]) => [key, String(value)]));
};

export const getAnimals = async (params: AnimalsListParams): Promise<AnimalsListData> => {
	return api.get('animals', { searchParams: buildSearchParams(params) }).json<AnimalsListData>();
};

export const getAnimalById = async (id: string): Promise<AnimalDetails> => {
	return (await api.get(`animals/${id}`).json<ApiSuccessResponse<AnimalDetails>>()).data;
};

export type CreateAnimalRequest = z.input<typeof createAnimalRequestSchema>;
export const createAnimal = async (payload: CreateAnimalRequest): Promise<CreateAnimalPayload> => {
	return (await api.post('animals', { json: payload }).json<ApiSuccessResponse<CreateAnimalPayload>>()).data;
};

export const deleteAnimal = async (id: string): Promise<DeleteAnimalPayload> => {
	return (await api.delete(`animals/${id}`).json<z.infer<typeof deleteAnimalResponseSchema>>()).data;
};

export type UpdateAnimalRequest = z.input<typeof updateAnimalRequestSchema>;
export const updateAnimal = async (id: string, payload: UpdateAnimalRequest): Promise<UpdateAnimalPayload> => {
	return (await api.patch(`animals/${id}`, { json: payload }).json<ApiSuccessResponse<UpdateAnimalPayload>>()).data;
};

export type ChangeAnimalStatusRequest = z.input<typeof changeAnimalStatusRequestSchema>;
export const changeAnimalStatus = async (
	id: string,
	payload: ChangeAnimalStatusRequest
): Promise<ChangeAnimalStatusPayload> => {
	return (
		await api.patch(`animals/${id}/status`, { json: payload }).json<ApiSuccessResponse<ChangeAnimalStatusPayload>>()
	).data;
};

export type SetAnimalCuratorRequest = z.input<typeof setAnimalCuratorRequestSchema>;
export const setAnimalCurator = async (
	id: string,
	payload: SetAnimalCuratorRequest
): Promise<SetAnimalCuratorPayload> => {
	return (
		await api.patch(`animals/${id}/curator`, { json: payload }).json<ApiSuccessResponse<SetAnimalCuratorPayload>>()
	).data;
};

export type SetAnimalGalleryRequest = z.input<typeof setAnimalGalleryRequestSchema>;
export const setAnimalGallery = async (
	id: string,
	payload: SetAnimalGalleryRequest
): Promise<SetAnimalGalleryPayload> => {
	return (
		await api.patch(`animals/${id}/gallery`, { json: payload }).json<ApiSuccessResponse<SetAnimalGalleryPayload>>()
	).data;
};

export type SetCostOfGuardianshipRequest = z.input<typeof setCostOfGuardianshipRequestSchema>;
export const setCostOfGuardianship = async (
	id: string,
	payload: SetCostOfGuardianshipRequest
): Promise<SetCostOfGuardianshipPayload> => {
	return (
		await api
			.patch(`animals/${id}/cost-of-guardianship`, { json: payload })
			.json<ApiSuccessResponse<SetCostOfGuardianshipPayload>>()
	).data;
};

export type AssignAnimalLabelRequest = z.input<typeof assignAnimalLabelRequestSchema>;
export const assignAnimalLabel = async (
	id: string,
	payload: AssignAnimalLabelRequest
): Promise<AssignAnimalLabelPayload> => {
	return (
		await api.post(`animals/${id}/label`, { json: payload }).json<ApiSuccessResponse<AssignAnimalLabelPayload>>()
	).data;
};

export const unassignAnimalLabel = async (animalId: string, labelId: string): Promise<void> => {
	await api.delete(`animals/${animalId}/label/${labelId}`);
};

export const mapAnimalById = (animals: AnimalItem[], id: string): AnimalItem | undefined => {
	return animals.find((animal) => animal.id === id);
};
