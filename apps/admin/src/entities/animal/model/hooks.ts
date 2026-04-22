import { AnimalStatusEnum } from '@pif/shared';
import { QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
	deleteAnimal,
	getAnimalById,
	getAnimals,
	setAnimalCurator,
	SetAnimalCuratorRequest,
	setAnimalGallery,
	SetAnimalGalleryRequest,
	setCostOfGuardianship,
	SetCostOfGuardianshipRequest,
	unassignAnimalLabel,
	updateAnimal,
	UpdateAnimalRequest
} from '../api/animals.api';
import { animalsKeys } from './query-keys';
import {
	AnimalDetails,
	AnimalsListData,
	AnimalsListParams,
	CreateAnimalPayload,
	DeleteAnimalPayload,
	SetAnimalCuratorPayload,
	SetAnimalGalleryPayload,
	SetCostOfGuardianshipPayload
} from './types';

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

export const useDeleteAnimalMutation = () => {
	const queryClient = useQueryClient();
	return useMutation<DeleteAnimalPayload, Error, string>({
		mutationFn: (id: string) => deleteAnimal(id),
		onSuccess: () => invalidateAnimals(queryClient)
	});
};

interface ChangeStatusMutationContext {
	prevDetail: AnimalDetails | undefined;
	prevLists: Array<[readonly unknown[], AnimalsListData | undefined]>;
}

const patchAnimalStatusInLists = (
	queryClient: QueryClient,
	animalId: string,
	nextStatus: AnimalStatusEnum
): Array<[readonly unknown[], AnimalsListData | undefined]> => {
	const lists = queryClient.getQueriesData<AnimalsListData>({ queryKey: [...animalsKeys.all, 'list'] });
	for (const [queryKey, data] of lists) {
		if (!data) {
			continue;
		}
		const nextData: AnimalsListData = {
			...data,
			data: data.data.map((item) => (item.id === animalId ? { ...item, status: nextStatus } : item))
		};
		queryClient.setQueryData(queryKey, nextData);
	}
	return lists;
};

export const useChangeAnimalStatusMutation = () => {
	const queryClient = useQueryClient();
	return useMutation<
		Awaited<ReturnType<typeof changeAnimalStatus>>,
		Error,
		{ id: string; payload: ChangeAnimalStatusRequest },
		ChangeStatusMutationContext
	>({
		mutationFn: ({ id, payload }) => changeAnimalStatus(id, payload),
		onMutate: async ({ id, payload }) => {
			await queryClient.cancelQueries({ queryKey: animalsKeys.all });

			const prevDetail = queryClient.getQueryData<AnimalDetails>(animalsKeys.detail(id));
			if (prevDetail) {
				queryClient.setQueryData<AnimalDetails>(animalsKeys.detail(id), {
					...prevDetail,
					status: payload.status
				});
			}

			const prevLists = patchAnimalStatusInLists(queryClient, id, payload.status);

			return { prevDetail, prevLists };
		},
		onError: (_error, { id }, context) => {
			if (!context) {
				return;
			}
			if (context.prevDetail) {
				queryClient.setQueryData(animalsKeys.detail(id), context.prevDetail);
			}
			for (const [queryKey, data] of context.prevLists) {
				queryClient.setQueryData(queryKey, data);
			}
		},
		onSettled: (_data, _error, { id }) => {
			void queryClient.invalidateQueries({ queryKey: animalsKeys.detail(id) });
			void queryClient.invalidateQueries({ queryKey: [...animalsKeys.all, 'list'] });
		}
	});
};

export const useSetAnimalCuratorMutation = () => {
	const queryClient = useQueryClient();
	return useMutation<SetAnimalCuratorPayload, Error, { id: string; payload: SetAnimalCuratorRequest }>({
		mutationFn: ({ id, payload }) => setAnimalCurator(id, payload),
		onSuccess: () => invalidateAnimals(queryClient)
	});
};

interface SetGalleryMutationContext {
	prevDetail: AnimalDetails | undefined;
}

export const useSetAnimalGalleryMutation = () => {
	const queryClient = useQueryClient();
	return useMutation<
		SetAnimalGalleryPayload,
		Error,
		{ id: string; payload: SetAnimalGalleryRequest },
		SetGalleryMutationContext
	>({
		mutationFn: ({ id, payload }) => setAnimalGallery(id, payload),
		onMutate: async ({ id, payload }) => {
			await queryClient.cancelQueries({ queryKey: animalsKeys.detail(id) });
			const prevDetail = queryClient.getQueryData<AnimalDetails>(animalsKeys.detail(id));
			if (prevDetail) {
				queryClient.setQueryData<AnimalDetails>(animalsKeys.detail(id), {
					...prevDetail,
					galleryUrls: payload.galleryKeys
				});
			}
			return { prevDetail };
		},
		onError: (_error, { id }, context) => {
			if (context?.prevDetail) {
				queryClient.setQueryData(animalsKeys.detail(id), context.prevDetail);
			}
		},
		onSettled: (_data, _error, { id }) => {
			void queryClient.invalidateQueries({ queryKey: animalsKeys.detail(id) });
		}
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
