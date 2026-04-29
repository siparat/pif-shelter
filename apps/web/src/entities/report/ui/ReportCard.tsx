import { Download, FileText } from 'lucide-react';
import { JSX } from 'react';
import { GlassCard } from '../../../shared/ui';
import { PublicReport } from '../model/types';

interface ReportCardProps {
	report: PublicReport;
}

export const ReportCard = ({ report }: ReportCardProps): JSX.Element => (
	<GlassCard className="flex flex-col items-center gap-3 p-5 text-center">
		<div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-(--color-bg-primary)/90 text-(--color-brand-brown) shadow-inner">
			<FileText size={26} strokeWidth={2} />
		</div>

		<p className="relative z-10 text-[13px] font-semibold leading-snug text-(--color-text-on-dark)">
			{report.title}
		</p>

		<a
			href={report.url}
			target="_blank"
			rel="noreferrer"
			download
			className="relative z-10 inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-full bg-(--color-bg-primary) text-[12px] font-bold text-(--color-brand-brown) transition-[transform,background-color] duration-150 hover:scale-[1.02] hover:bg-white">
			<Download size={13} />
			{report.fileType}
		</a>
	</GlassCard>
);
