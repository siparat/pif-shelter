import { useVolunteerInvite } from '../../../features/volunteer-invite';
import { ArrowUpRight, Star } from 'lucide-react';
import { CSSProperties, JSX, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { HelpOption } from '../model/options';

interface HelpOptionCardProps {
	option: HelpOption;
	delay: number;
}

export const HelpOptionCard = ({ option, delay }: HelpOptionCardProps): JSX.Element => {
	const ref = useRef<HTMLAnchorElement>(null);
	const [inView, setInView] = useState(false);
	const { open: openVolunteerModal } = useVolunteerInvite();

	useEffect(() => {
		const node = ref.current;
		if (!node) return;
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry?.isIntersecting) {
					setInView(true);
					observer.disconnect();
				}
			},
			{ threshold: 0.15 }
		);
		observer.observe(node);
		return () => observer.disconnect();
	}, []);

	const Icon = option.icon;

	const style: CSSProperties = {
		opacity: inView ? 1 : 0,
		transform: inView ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.95)',
		transition: `opacity 0.8s cubic-bezier(0.34, 1.3, 0.64, 1) ${delay}ms, transform 0.8s cubic-bezier(0.34, 1.3, 0.64, 1) ${delay}ms`
	};

	const onClick = (): void => {
		if (option.id == 'volunteer') {
			return openVolunteerModal();
		}

		window.scrollTo(0, 0);
	};

	return (
		<Link
			onClick={onClick}
			ref={ref}
			to={option.href}
			style={style}
			className="group relative aspect-square rounded-3xl overflow-hidden p-6 flex flex-col justify-between bg-white/4 backdrop-blur-md border border-white/10 hover:border-white/25 hover:bg-white/[0.07] transition-all duration-500 hover:-translate-y-1 shadow-[0_8px_32px_rgba(0,0,0,0.18)] hover:shadow-[0_20px_48px_rgba(0,0,0,0.32)]">
			<div className="pointer-events-none absolute -top-1/2 -right-1/2 w-full h-full rounded-full bg-(--color-brand-accent)/0 group-hover:bg-(--color-brand-accent)/10 blur-3xl transition-colors duration-700" />

			<div className="relative flex justify-between items-start z-10">
				<div className="flex items-center justify-center w-12 h-12 rounded-xl bg-(--color-brand-brown-strong) border border-white/5 shadow-inner transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6">
					<Icon className="text-(--color-text-on-dark)" strokeWidth={2} />
				</div>

				<div className="relative flex items-center justify-center w-9 h-9">
					{option.highlighted && (
						<Star
							size={14}
							className="absolute top-2 -left-6 text-(--color-brand-accent) fill-(--color-brand-accent) animate-pulse"
						/>
					)}
					<div className="flex items-center justify-center w-8 h-8 rounded-full bg-(--color-brand-accent)/0 group-hover:bg-(--color-brand-accent)/20 transition-colors duration-300">
						<ArrowUpRight
							size={18}
							className="text-(--color-brand-accent) transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
							strokeWidth={2.5}
						/>
					</div>
				</div>
			</div>

			<div className="relative z-10 flex flex-col gap-3">
				<h3 className="text-lg lg:text-xl font-bold text-(--color-text-on-dark) leading-tight">
					{option.title}
				</h3>
				<p className="text-sm text-(--color-text-inverse-soft) leading-relaxed line-clamp-5">
					{option.description}
				</p>
			</div>
		</Link>
	);
};
