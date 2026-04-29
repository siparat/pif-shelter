import { JSX } from 'react';
import { TimelineEvent, timelineEvents } from '../../../../../shared/config/about';
import { cn } from '../../../../../shared/lib/cn';
import { ROW_SIZE } from '../constants';

const buildTimelineRows = (events: TimelineEvent[]): TimelineEvent[][] => {
	const timelineRows: TimelineEvent[][] = [];
	for (let i = 0; i < events.length; i += ROW_SIZE) {
		timelineRows.push(events.slice(i, i + ROW_SIZE));
	}
	return timelineRows;
};

export const TimelineSection = (): JSX.Element => {
	const timelineRows = buildTimelineRows(timelineEvents);

	return (
		<section className="overflow-hidden rounded-2xl bg-[#201915] px-6 py-8 sm:px-10 sm:py-10">
			<div className="relative hidden md:block">
				{timelineRows.map((row, rowIdx) => {
					const isRtl = rowIdx % 2 !== 0;
					const displayRow = isRtl ? [...row].reverse() : row;
					const n = displayRow.length;
					const isLast = rowIdx === timelineRows.length - 1;
					const halfCol = 50 / n;

					return (
						<div className="h-43" key={rowIdx}>
							<div className="relative flex">
								<div
									className="absolute top-[9px] z-0 h-[2px] bg-[#fe8651]"
									style={{ left: `${halfCol}%`, right: `${halfCol}%` }}
								/>

								{displayRow.map((event) => (
									<div
										key={event.year}
										className="relative z-10 flex flex-1 flex-col items-center px-2">
										<div className="mb-4 h-5 w-5 shrink-0 rounded-full border-2 border-[#fe8651] bg-[#201915]" />
										<span className="block text-center text-[20px] font-black text-white">
											{event.year}
										</span>
										<p className="mt-2 text-center text-[13px] font-medium leading-relaxed text-white/70">
											{event.text}
										</p>
									</div>
								))}
							</div>
							{!isLast && (
								<div
									className={cn('absolute r-[12.5%] h-[33%] top-0 w-[2px] bg-[#fe8651]')}
									style={
										isRtl
											? {
													transform: `translateY(calc(${100 * rowIdx}% + 10px))`,
													marginLeft: `calc(${halfCol}% - 1px)`
												}
											: {
													transform: `translateY(calc(${100 * rowIdx}% + 10px))`,
													marginLeft: `calc(${100 - halfCol}% - 1px)`
												}
									}
								/>
							)}
						</div>
					);
				})}
			</div>

			<div className="flex flex-col md:hidden">
				{timelineEvents.map((event, i) => (
					<div key={event.year} className="flex gap-4">
						<div className="flex flex-col items-center">
							<div className="h-5 w-5 shrink-0 rounded-full border-2 border-[#fe8651] bg-[#201915]" />
							{i < timelineEvents.length - 1 && <div className="mt-1 w-[2px] flex-1 bg-[#fe8651]/40" />}
						</div>
						<div className="pb-6">
							<span className="block text-[18px] font-black text-white">{event.year}</span>
							<p className="mt-1 text-[13px] font-medium leading-relaxed text-white/70">{event.text}</p>
						</div>
					</div>
				))}
			</div>
		</section>
	);
};
