import { ApiSuccessResponse, createAnimalLabelRequestSchema, updateAnimalLabelRequestSchema } from '@pif/contracts';
import { z } from 'zod';
import { api } from '../../../shared/api';
import { AnimalLabel, CreateAnimalLabelPayload, UpdateAnimalLabelPayload } from '../model/types';

export const getAnimalLabels = async (): Promise<AnimalLabel[]> => {
	return (await api.get('animals/labels').json<ApiSuccessResponse<AnimalLabel[]>>()).data;
};

export type CreateAnimalLabelRequest = z.input<typeof createAnimalLabelRequestSchema>;
export const createAnimalLabel = async (payload: CreateAnimalLabelRequest): Promise<CreateAnimalLabelPayload> => {
	return (await api.post('animals/labels', { json: payload }).json<ApiSuccessResponse<CreateAnimalLabelPayload>>())
		.data;
};

export type UpdateAnimalLabelRequest = z.input<typeof updateAnimalLabelRequestSchema>;
export const updateAnimalLabel = async (
	id: string,
	payload: UpdateAnimalLabelRequest
): Promise<UpdateAnimalLabelPayload> => {
	return (
		await api.patch(`animals/labels/${id}`, { json: payload }).json<ApiSuccessResponse<UpdateAnimalLabelPayload>>()
	).data;
};

export const deleteAnimalLabel = async (id: string): Promise<void> => {
	await api.delete(`animals/labels/${id}`);
};
