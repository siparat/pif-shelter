import { ArrowRight, PawPrint } from 'lucide-react';
import React, { JSX, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AnimalMarqueeCard, useAnimalsPreviewQuery } from '../../../entities/animal';
import { ROUTES } from '../../../shared/config/routes';
import { useInView } from '../../../shared/lib/use-in-view';

const ROW_LENGTH = 12;

const SkeletonRow = (): JSX.Element => (
	<div className="flex gap-4 w-max">
		{Array.from({ length: ROW_LENGTH }).map((_, i) => (
			<div
				key={i}
				className="w-[200px] shrink-0 rounded-2xl overflow-hidden aspect-square bg-white/10 animate-pulse"
			/>
		))}
	</div>
);

export const AnimalsPreviewSection = (): JSX.Element => {
	const { ref: headerRef, inView: headerInView } = useInView();
	const animalsQuery = useAnimalsPreviewQuery();
	const animals = animalsQuery.data ?? [];

	const [row1, row2] = useMemo(() => {
		const midpoint = Math.ceil(animals.length / 2);
		const row1 = animals.slice(0, midpoint);
		const row2 = animals.slice(midpoint);

		if (row1.length >= ROW_LENGTH && row2.length >= ROW_LENGTH) {
			return [row1, row2];
		}

		return [
			new Array(ROW_LENGTH).fill(row1).flat().slice(0, ROW_LENGTH),
			new Array(ROW_LENGTH)
				.fill(row2.length >= 1 ? row2 : row1)
				.flat()
				.slice(0, ROW_LENGTH)
		];
	}, [animals]);

	return (
		<section className="w-full bg-(--color-text-primary) py-24 overflow-hidden">
			<div
				ref={headerRef as React.RefObject<HTMLDivElement>}
				className="px-4 md:px-12 xl:px-12 max-w-[1920px] mx-auto mb-12">
				<div
					className="flex items-start justify-between gap-6"
					style={{
						opacity: headerInView ? 1 : 0,
						transform: headerInView ? 'translateY(0)' : 'translateY(24px)',
						transition: 'opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)'
					}}>
					<div className="flex flex-col gap-3">
						<div
							className="bg-[#fe865144] flex items-center gap-2 w-fit py-1.5 px-3 rounded-full"
							style={{
								opacity: headerInView ? 1 : 0,
								transform: headerInView ? 'translateY(0)' : 'translateY(16px)',
								transition:
									'opacity 0.6s cubic-bezier(0.16,1,0.3,1) 0ms, transform 0.6s cubic-bezier(0.16,1,0.3,1) 0ms'
							}}>
							<PawPrint size={14} className="text-(--color-brand-accent)" />
							<span className="text-(--color-brand-accent)">Наши подопечные</span>
						</div>
						<div
							style={{
								opacity: headerInView ? 1 : 0,
								transform: headerInView ? 'translateY(0)' : 'translateY(20px)',
								transition:
									'opacity 0.7s cubic-bezier(0.16,1,0.3,1) 150ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) 150ms'
							}}>
							<h2 className="section-title text-(--color-text-on-dark) mb-3">Ждут тебя уже давно</h2>
							<p className="text-lg text-(--color-text-inverse-soft) max-w-[520px] leading-relaxed">
								Более 800 хвостиков живут в приюте и мечтают найти заботливого хозяина
							</p>
						</div>
					</div>
					<Link
						to={ROUTES.animals}
						className="shrink-0 flex items-center gap-2 text-(--color-text-on-dark) text-sm font-semibold hover:text-(--color-brand-accent) transition-colors duration-200 mt-2">
						Все животные
						<ArrowRight size={16} />
					</Link>
				</div>
			</div>

			<div className="flex flex-col gap-5">
				{animalsQuery.isLoading ? (
					<>
						<div className="relative mask-[linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
							<SkeletonRow />
						</div>
						<div className="relative mask-[linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
							<SkeletonRow />
						</div>
					</>
				) : animals.length === 0 ? (
					<div className="text-center py-12 text-(--color-text-inverse-soft)">
						<PawPrint size={40} className="mx-auto mb-3 opacity-40" />
						<p className="text-lg">Пока нет питомцев для показа</p>
					</div>
				) : (
					<>
						<div className="relative mask-[linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
							<div className="flex gap-4 w-max animate-[marquee_45s_linear_infinite] hover:[animation-play-state:paused]">
								{row1.map((animal, i) => (
									<AnimalMarqueeCard key={`r1-${animal.id}-${i}`} animal={animal} />
								))}
							</div>
						</div>
						<div className="relative mask-[linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
							<div className="flex gap-4 w-max animate-[marquee-reverse_55s_linear_infinite] hover:[animation-play-state:paused]">
								{row2.map((animal, i) => (
									<AnimalMarqueeCard key={`r2-${animal.id}-${i}`} animal={animal} />
								))}
							</div>
						</div>
					</>
				)}
			</div>

			<div className="px-4 md:px-12 xl:px-12 max-w-[1920px] mx-auto mt-12 flex justify-center">
				<Link
					to={ROUTES.animals}
					className="inline-flex items-center gap-2 bg-(--color-brand-accent) hover:brightness-110 text-(--color-text-inverse) font-semibold text-base px-8 py-4 rounded-full transition-[transform,filter] duration-200 hover:scale-[1.03] shadow-[0_8px_24px_rgba(254,134,81,0.35)]">
					Познакомиться со всеми
					<ArrowRight size={18} />
				</Link>
			</div>
		</section>
	);
};
