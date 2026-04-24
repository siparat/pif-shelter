import { AnimalStatusEnum, CampaignStatus } from '@pif/shared';
import { getMediaUrl } from '../../../../shared/lib';

export const KOPECKS_IN_RUBLE = 100;
export const TITLE_MAX_LENGTH = 36;
export const DESCRIPTION_MIN_LENGTH = 250;
export const ANIMALS_PER_PAGE = 100;
export const ANIMAL_SEARCH_DEBOUNCE_MS = 300;

export const STATUS_LABEL: Record<CampaignStatus, string> = {
	[CampaignStatus.DRAFT]: 'Черновик',
	[CampaignStatus.PUBLISHED]: 'Опубликован',
	[CampaignStatus.CANCELLED]: 'Отменён',
	[CampaignStatus.SUCCESS]: 'Успешный',
	[CampaignStatus.FAILED]: 'Неуспешный'
};

export const STATUS_COLOR: Record<CampaignStatus, string> = {
	[CampaignStatus.DRAFT]: '#9ca3af',
	[CampaignStatus.PUBLISHED]: '#3b82f6',
	[CampaignStatus.CANCELLED]: '#ef4444',
	[CampaignStatus.SUCCESS]: '#22c55e',
	[CampaignStatus.FAILED]: '#f97316'
};

export const ANIMAL_STATUS_LABEL: Record<AnimalStatusEnum, string> = {
	[AnimalStatusEnum.DRAFT]: 'Черновик',
	[AnimalStatusEnum.PUBLISHED]: 'Опубликовано',
	[AnimalStatusEnum.ON_TREATMENT]: 'На лечении',
	[AnimalStatusEnum.ON_PROBATION]: 'На испытательном сроке',
	[AnimalStatusEnum.ADOPTED]: 'Пристроено',
	[AnimalStatusEnum.RAINBOW]: 'Радуга'
};

export const splitGoal = (goal: number): { rubles: number; kopecks: number } => {
	const safeGoal = Number.isFinite(goal) && goal > 0 ? Math.floor(goal) : 0;
	return {
		rubles: Math.floor(safeGoal / KOPECKS_IN_RUBLE),
		kopecks: safeGoal % KOPECKS_IN_RUBLE
	};
};

export const buildGoal = (rubles: number, kopecks: number): number => {
	const safeRubles = Math.max(0, Math.floor(Number.isFinite(rubles) ? rubles : 0));
	const safeKopecks = Math.max(0, Math.min(99, Math.floor(Number.isFinite(kopecks) ? kopecks : 0)));
	return safeRubles * KOPECKS_IN_RUBLE + safeKopecks;
};

export const formatMoney = (kopecks: number | null | undefined): string => {
	const value = (kopecks ?? 0) / KOPECKS_IN_RUBLE;
	return new Intl.NumberFormat('ru-RU', {
		style: 'currency',
		currency: 'RUB',
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	}).format(value);
};

export const formatDate = (iso: string): string => {
	const date = new Date(iso);
	return new Intl.DateTimeFormat('ru-RU', {
		day: '2-digit',
		month: 'long',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	}).format(date);
};

export const toDateTimeLocal = (iso: string): string => {
	const date = new Date(iso);
	const tzOffsetMs = date.getTimezoneOffset() * 60_000;
	return new Date(date.getTime() - tzOffsetMs).toISOString().slice(0, 16);
};

export const toIso = (value: string): string => new Date(value).toISOString();

export const resolvePublicMediaUrl = (keyOrUrl: string | null | undefined): string | undefined => {
	if (!keyOrUrl) {
		return undefined;
	}
	if (keyOrUrl.startsWith('http://') || keyOrUrl.startsWith('https://')) {
		return keyOrUrl;
	}
	return getMediaUrl(keyOrUrl);
};
