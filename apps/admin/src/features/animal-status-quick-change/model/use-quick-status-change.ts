import { AnimalStatusEnum } from '@pif/shared';
import { useCallback, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useChangeAnimalStatusMutation } from '../../../entities/animal';
import { getErrorMessage } from '../../../shared/api';
import { isTerminalStatus, validateTransition } from './transition-guards';

export interface QuickStatusAnimal {
	id: string;
	status: AnimalStatusEnum;
	avatarUrl: string | null;
}

interface ConfirmRequest {
	animal: QuickStatusAnimal;
	nextStatus: AnimalStatusEnum;
}

interface UseQuickStatusChangeResult {
	requestChange: (animal: QuickStatusAnimal, nextStatus: AnimalStatusEnum) => void;
	pendingConfirm: ConfirmRequest | null;
	confirm: () => Promise<void>;
	cancel: () => void;
	isPending: boolean;
}

export const useQuickStatusChange = (): UseQuickStatusChangeResult => {
	const mutation = useChangeAnimalStatusMutation();
	const [pendingConfirm, setPendingConfirm] = useState<ConfirmRequest | null>(null);

	const runChange = useCallback(
		async (animal: QuickStatusAnimal, nextStatus: AnimalStatusEnum): Promise<void> => {
			try {
				await mutation.mutateAsync({ id: animal.id, payload: { status: nextStatus } });
				toast.success('Статус обновлён');
			} catch (error) {
				const message = await getErrorMessage(error);
				toast.error(message);
			}
		},
		[mutation]
	);

	const requestChange = useCallback(
		(animal: QuickStatusAnimal, nextStatus: AnimalStatusEnum): void => {
			const validation = validateTransition({
				currentStatus: animal.status,
				nextStatus,
				hasAvatar: Boolean(animal.avatarUrl)
			});
			if (!validation.ok) {
				if (animal.status !== nextStatus) {
					toast.error(validation.reason);
				}
				return;
			}

			if (isTerminalStatus(nextStatus)) {
				setPendingConfirm({ animal, nextStatus });
				return;
			}

			void runChange(animal, nextStatus);
		},
		[runChange]
	);

	const confirm = useCallback(async (): Promise<void> => {
		if (!pendingConfirm) {
			return;
		}
		const { animal, nextStatus } = pendingConfirm;
		setPendingConfirm(null);
		await runChange(animal, nextStatus);
	}, [pendingConfirm, runChange]);

	const cancel = useCallback((): void => {
		setPendingConfirm(null);
	}, []);

	return {
		requestChange,
		pendingConfirm,
		confirm,
		cancel,
		isPending: mutation.isPending
	};
};
