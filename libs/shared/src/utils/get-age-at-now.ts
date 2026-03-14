import dayjs from 'dayjs';

export const getAgeAtNow = (birthDate: string): { years: number; months: number } => {
	const birth = dayjs(birthDate);
	const now = dayjs();
	const months = now.diff(birth, 'month', false);
	const years = Math.floor(months / 12);

	return { years, months };
};
