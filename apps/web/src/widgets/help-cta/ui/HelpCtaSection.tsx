import React, { JSX } from 'react';
import { useInView } from '../../../shared/lib/use-in-view';
import { helpCircles, helpOptions } from '../model/options';
import { BackgroundMarquee } from './BackgroundMarquee';
import { HelpAnimalCircle } from './HelpAnimalCircle';
import { HelpOptionCard } from './HelpOptionCard';

export const HelpCtaSection = (): JSX.Element => {
	const { ref: titleRef, inView: titleInView } = useInView();

	const [adopt, guardian, goods, donate, volunteer] = helpOptions;
	const [c1, c2, c3, c4] = helpCircles;

	return (
		<section className="relative w-full bg-(--color-text-primary) py-24 lg:py-32 overflow-hidden">
			<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(254,134,81,0.08),transparent_60%)]" />

			<BackgroundMarquee />

			<div className="relative max-w-[1280px] mx-auto px-4 md:px-12">
				<div
					ref={titleRef as React.RefObject<HTMLDivElement>}
					style={{
						opacity: titleInView ? 1 : 0,
						transform: titleInView ? 'translateY(0)' : 'translateY(32px)',
						transition: 'opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1)'
					}}
					className="text-center mb-16 lg:mb-20">
					<h2 className="text-[clamp(32px,4.5vw,56px)] font-bold uppercase text-(--color-text-on-dark) leading-[1.1] tracking-tight">
						Каждый может помочь
						<br />
						<span className="text-(--color-brand-accent)">выбери свой способ</span>
					</h2>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
					<HelpOptionCard option={adopt} delay={0} />

					<div className="hidden lg:block">
						<HelpAnimalCircle src={c1.src} alt={c1.alt} delay={100} floatDelay={0} />
					</div>

					<HelpOptionCard option={guardian} delay={200} />

					<div className="hidden lg:block">
						<HelpAnimalCircle src={c3.src} alt={c3.alt} delay={150} floatDelay={1500} />
					</div>

					<HelpOptionCard option={goods} delay={300} />

					<div className="hidden lg:block">
						<HelpAnimalCircle src={c2.src} alt={c2.alt} delay={250} floatDelay={3000} />
					</div>

					<HelpOptionCard option={donate} delay={400} />

					<div className="hidden lg:block">
						<HelpAnimalCircle src={c4.src} alt={c4.alt} delay={350} floatDelay={4500} />
					</div>

					<HelpOptionCard option={volunteer} delay={500} />
				</div>
			</div>
		</section>
	);
};
