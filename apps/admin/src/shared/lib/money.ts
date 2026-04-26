export const KOPECKS_IN_RUBLE = 100;

export const formatKopecksAsRub = (kopecks: number | null | undefined): string => {
	const value = (kopecks ?? 0) / KOPECKS_IN_RUBLE;
	return new Intl.NumberFormat('ru-RU', {
		style: 'currency',
		currency: 'RUB',
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	}).format(value);
};

export const rublesInputToKopecks = (rubles: number): number => {
	if (!Number.isFinite(rubles) || rubles < 0) return 0;
	return Math.round(rubles * KOPECKS_IN_RUBLE);
};

export const kopecksToRublesInput = (kopecks: number): number => kopecks / KOPECKS_IN_RUBLE;
