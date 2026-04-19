import { AnimalStatusEnum } from '@pif/shared';

export const statusBadgeColor = (status: AnimalStatusEnum): string => {
	switch (status) {
		case AnimalStatusEnum.PUBLISHED:
			return 'bg-emerald-500/20 text-emerald-400';
		case AnimalStatusEnum.DRAFT:
			return 'bg-slate-500/20 text-slate-300';
		case AnimalStatusEnum.ADOPTED:
			return 'bg-blue-500/20 text-blue-300';
		case AnimalStatusEnum.RAINBOW:
			return 'bg-violet-500/20 text-violet-300';
		default:
			return 'bg-amber-500/20 text-amber-300';
	}
};
