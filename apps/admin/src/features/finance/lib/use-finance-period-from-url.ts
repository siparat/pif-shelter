import dayjs from 'dayjs';
import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

const MIN_YEAR = 2000;
const MAX_YEAR = 2100;

export interface FinancePeriod {
	year: number;
	month: number;
}

export const useFinancePeriodFromUrl = (): {
	period: FinancePeriod;
	setPeriod: (next: FinancePeriod) => void;
	goCurrentMonth: () => void;
	goPreviousMonth: () => void;
	goNextMonth: () => void;
	label: string;
} => {
	const [searchParams, setSearchParams] = useSearchParams();

	const period = useMemo((): FinancePeriod => {
		const now = dayjs();
		const rawYear = Number(searchParams.get('year'));
		const rawMonth = Number(searchParams.get('month'));
		const year = Number.isFinite(rawYear) && rawYear >= MIN_YEAR && rawYear <= MAX_YEAR ? rawYear : now.year();
		const month = Number.isFinite(rawMonth) && rawMonth >= 1 && rawMonth <= 12 ? rawMonth : now.month() + 1;
		return { year, month };
	}, [searchParams]);

	const setPeriod = useCallback(
		(next: FinancePeriod) => {
			const params = new URLSearchParams(searchParams);
			params.set('year', String(next.year));
			params.set('month', String(next.month));
			setSearchParams(params, { replace: true });
		},
		[searchParams, setSearchParams]
	);

	const goCurrentMonth = useCallback(() => {
		const now = dayjs();
		setPeriod({ year: now.year(), month: now.month() + 1 });
	}, [setPeriod]);

	const goPreviousMonth = useCallback(() => {
		const d = dayjs()
			.year(period.year)
			.month(period.month - 1)
			.subtract(1, 'month');
		setPeriod({ year: d.year(), month: d.month() + 1 });
	}, [period.month, period.year, setPeriod]);

	const goNextMonth = useCallback(() => {
		const d = dayjs()
			.year(period.year)
			.month(period.month - 1)
			.add(1, 'month');
		setPeriod({ year: d.year(), month: d.month() + 1 });
	}, [period.month, period.year, setPeriod]);

	const label = useMemo(
		() =>
			new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric' }).format(
				new Date(period.year, period.month - 1, 1)
			),
		[period.month, period.year]
	);

	return { period, setPeriod, goCurrentMonth, goPreviousMonth, goNextMonth, label };
};
