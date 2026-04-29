import { JSX, useState } from 'react';
import { ReportCard, useReportsByYearQuery } from '../../../../../entities/report';
import { YearSwitch } from '../../../../../shared/ui';

interface FinanceReportsSectionProps {
	years: number[];
}

export const FinanceReportsSection = ({ years }: FinanceReportsSectionProps): JSX.Element => {
	const [activeYear, setActiveYear] = useState(years[0]);
	const { data: reports, isLoading } = useReportsByYearQuery(activeYear);

	return (
		<section className="overflow-hidden rounded-3xl bg-[#3a2c27] px-6 py-10 sm:px-10 sm:py-12">
			<h2 className="mb-6 lg:text-4xl md:text-2lg text-2xl text-[#C9A196] font-black uppercase tracking-[2px]">
				Финансовые отчеты
			</h2>

			<YearSwitch years={years} activeYear={activeYear} onChange={setActiveYear} variant="glass" />

			<div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
				{isLoading ? (
					Array.from({ length: 6 }).map((_, i) => (
						<div
							key={i}
							className="h-44 animate-pulse rounded-2xl border border-white/10 bg-white/4 backdrop-blur-md"
						/>
					))
				) : reports && reports.length > 0 ? (
					reports.map((report) => <ReportCard key={report.id} report={report} />)
				) : (
					<p className="col-span-full text-[14px] font-medium text-(--color-text-on-dark)/60">
						За {activeYear} год отчётов пока нет
					</p>
				)}
			</div>
		</section>
	);
};
