const MONTH_PARTS = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

export const formatTimelineDate = (iso: string): { day: string; month: string; year: string; full: string } => {
	const date = new Date(iso);
	const day = String(date.getDate()).padStart(2, '0');
	const month = MONTH_PARTS[date.getMonth()];
	const year = String(date.getFullYear());
	const full = `${day} ${month} ${year}`;
	return { day, month, year, full };
};

const pluralize = (n: number, forms: [string, string, string]): string => {
	const mod10 = n % 10;
	const mod100 = n % 100;
	if (mod10 === 1 && mod100 !== 11) return forms[0];
	if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return forms[1];
	return forms[2];
};

export const formatAgeAtPost = (years: number, totalMonths: number): string | null => {
	const months = totalMonths % 12;
	if (years === 0 && months === 0) {
		return null;
	}
	const parts: string[] = [];
	if (years > 0) {
		parts.push(`${years} ${pluralize(years, ['год', 'года', 'лет'])}`);
	}
	if (months > 0) {
		parts.push(`${months} ${pluralize(months, ['месяц', 'месяца', 'месяцев'])}`);
	}
	return parts.join(' ');
};
