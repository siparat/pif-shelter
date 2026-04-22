import { AnimalStatusEnum } from '@pif/shared';

export const TERMINAL_STATUSES: readonly AnimalStatusEnum[] = [
	AnimalStatusEnum.ADOPTED,
	AnimalStatusEnum.RAINBOW
] as const;

export const isTerminalStatus = (status: AnimalStatusEnum): boolean => TERMINAL_STATUSES.includes(status);

export const requiresAvatar = (nextStatus: AnimalStatusEnum): boolean => nextStatus !== AnimalStatusEnum.DRAFT;

export interface TransitionInput {
	currentStatus: AnimalStatusEnum;
	nextStatus: AnimalStatusEnum;
	hasAvatar: boolean;
}

export type TransitionValidation = { ok: true } | { ok: false; reason: string };

export const validateTransition = ({ currentStatus, nextStatus, hasAvatar }: TransitionInput): TransitionValidation => {
	if (currentStatus === nextStatus) {
		return { ok: false, reason: 'Статус не изменился' };
	}
	if (requiresAvatar(nextStatus) && !hasAvatar) {
		return { ok: false, reason: 'Сначала загрузите аватар животного' };
	}
	return { ok: true };
};
