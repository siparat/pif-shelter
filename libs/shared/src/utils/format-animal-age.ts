import { getAgeAtNow } from './get-age-at-now';
import { pluralize } from './pluralize';

const YEAR_FORMS: [string, string, string] = ['год', 'года', 'лет'];
const MONTH_FORMS: [string, string, string] = ['мес.', 'мес.', 'мес.'];

export const formatAnimalAge = (birthDate: string): string => {
	const { years, months } = getAgeAtNow(birthDate);
	const remainderMonths = months - years * 12;

	if (years <= 0 && remainderMonths <= 0) {
		return 'меньше месяца';
	}
	if (years <= 0) {
		return `${remainderMonths} ${pluralize(remainderMonths, MONTH_FORMS)}`;
	}
	if (remainderMonths <= 0) {
		return `${years} ${pluralize(years, YEAR_FORMS)}`;
	}
	return `${years} ${pluralize(years, YEAR_FORMS)} ${remainderMonths} ${pluralize(remainderMonths, MONTH_FORMS)}`;
};
