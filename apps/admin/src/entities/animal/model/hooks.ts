import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
	createAnimalLabel,
	CreateAnimalLabelRequest,
	deleteAnimalLabel,
	getAnimalLabels,
	updateAnimalLabel,
	UpdateAnimalLabelRequest
} from '../api/animal-labels.api';
import {
	assignAnimalLabel,
	AssignAnimalLabelRequest,
	changeAnimalStatus,
	ChangeAnimalStatusRequest,
	createAnimal,
	CreateAnimalRequest,
	getAnimalById,
	getAnimals,
	setAnimalCurator,
	SetAnimalCuratorRequest,
	setCostOfGuardianship,
	SetCostOfGuardianshipRequest,
	unassignAnimalLabel,
	updateAnimal,
	UpdateAnimalRequest
} from '../api/animals.api';
import { animalsKeys } from './query-keys';
import { AnimalsListParams, CreateAnimalPayload, SetAnimalCuratorPayload, SetCostOfGuardianshipPayload } from './types';

export const useAnimalsList = (params: AnimalsListParams) =>
	useQuery({
		queryKey: animalsKeys.list(params),
		queryFn: () => getAnimals(params),
		placeholderData: (prev) => prev
	});

export const useAnimalDetails = (id: string | null) =>
	useQuery({
		queryKey: animalsKeys.detail(id ?? 'empty'),
		queryFn: () => getAnimalById(id as string),
		enabled: Boolean(id)
	});

export const useAnimalLabels = () =>
	useQuery({
		queryKey: animalsKeys.labels(),
		queryFn: getAnimalLabels,
		staleTime: 1000 * 60 * 5,
		gcTime: 1000 * 60 * 10,
		refetchOnWindowFocus: false
	});

const invalidateAnimals = async (queryClient: ReturnType<typeof useQueryClient>): Promise<void> => {
	await Promise.all([
		queryClient.invalidateQueries({ queryKey: animalsKeys.all }),
		queryClient.invalidateQueries({ queryKey: ['volunteers'] })
	]);
};

export const useCreateAnimalMutation = () => {
	const queryClient = useQueryClient();
	return useMutation<CreateAnimalPayload, Error, CreateAnimalRequest>({
		mutationFn: createAnimal,
		onSuccess: () => invalidateAnimals(queryClient)
	});
};

export const useUpdateAnimalMutation = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, payload }: { id: string; payload: UpdateAnimalRequest }) => updateAnimal(id, payload),
		onSuccess: () => invalidateAnimals(queryClient)
	});
};

export const useChangeAnimalStatusMutation = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, payload }: { id: string; payload: ChangeAnimalStatusRequest }) =>
			changeAnimalStatus(id, payload),
		onSuccess: () => invalidateAnimals(queryClient)
	});
};

export const useSetAnimalCuratorMutation = () => {
	const queryClient = useQueryClient();
	return useMutation<SetAnimalCuratorPayload, Error, { id: string; payload: SetAnimalCuratorRequest }>({
		mutationFn: ({ id, payload }) => setAnimalCurator(id, payload),
		onSuccess: () => invalidateAnimals(queryClient)
	});
};

export const useSetCostOfGuardianshipMutation = () => {
	const queryClient = useQueryClient();
	return useMutation<SetCostOfGuardianshipPayload, Error, { id: string; payload: SetCostOfGuardianshipRequest }>({
		mutationFn: ({ id, payload }) => setCostOfGuardianship(id, payload),
		onSuccess: () => invalidateAnimals(queryClient)
	});
};

export const useAssignAnimalLabelMutation = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, payload }: { id: string; payload: AssignAnimalLabelRequest }) =>
			assignAnimalLabel(id, payload),
		onSuccess: () => invalidateAnimals(queryClient)
	});
};

export const useUnassignAnimalLabelMutation = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ animalId, labelId }: { animalId: string; labelId: string }) =>
			unassignAnimalLabel(animalId, labelId),
		onSuccess: () => invalidateAnimals(queryClient)
	});
};

export const useCreateAnimalLabelMutation = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (payload: CreateAnimalLabelRequest) => createAnimalLabel(payload),
		onSuccess: () => invalidateAnimals(queryClient)
	});
};

export const useUpdateAnimalLabelMutation = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, payload }: { id: string; payload: UpdateAnimalLabelRequest }) =>
			updateAnimalLabel(id, payload),
		onSuccess: () => invalidateAnimals(queryClient)
	});
};

export const useDeleteAnimalLabelMutation = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => deleteAnimalLabel(id),
		onSuccess: () => invalidateAnimals(queryClient)
	});
};
