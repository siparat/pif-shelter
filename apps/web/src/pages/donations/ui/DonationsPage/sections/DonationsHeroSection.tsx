import { Heart, PawPrint } from 'lucide-react';
import { JSX } from 'react';
import { SegmentedControl } from '../../../../../shared/ui';

export type DonationsHelpMode = 'money' | 'items';

type DonationsHeroSectionProps = {
	mode: DonationsHelpMode;
	onModeChange: (mode: DonationsHelpMode) => void;
};

export const DonationsHeroSection = ({ mode, onModeChange }: DonationsHeroSectionProps): JSX.Element => {
	return (
		<header className="flex flex-col gap-6 text-center sm:gap-8 md:text-left">
			<div className="mx-auto flex w-full max-w-3xl flex-col gap-3 sm:gap-4 md:mx-0 md:max-w-4xl">
				<p className="eyebrow inline-block max-w-full text-(--color-brand-accent) max-md:mx-auto md:mx-0">
					Поддержка приюта
				</p>
				<h1 className="section-title text-balance text-(--color-text-primary)">
					Выберите удобный способ — и помогите нашим хвостикам
				</h1>
				<p className="mx-auto max-w-2xl text-base leading-relaxed text-(--color-text-secondary) sm:text-lg md:mx-0">
					Любая сумма важна: корм, лечение и тепло для тех, кто уже успел довериться людям.
				</p>
			</div>

			<div className="w-full max-w-full sm:mx-auto sm:max-w-md md:mx-0 md:max-w-lg">
				<SegmentedControl
					value={mode}
					onValueChange={onModeChange}
					aria-label="Тип помощи"
					size="comfortable"
					trackClassName="bg-(--color-surface-primary) p-1.5 shadow-[0_8px_28px_rgba(79,61,56,0.08)]"
					items={[
						{
							value: 'money',
							tabId: 'tab-money',
							label: (
								<>
									<Heart className="h-4 w-4 shrink-0 opacity-90" strokeWidth={2.2} aria-hidden />
									<span className="min-w-0 text-center">Деньгами</span>
								</>
							)
						},
						{
							value: 'items',
							tabId: 'tab-items',
							label: (
								<>
									<PawPrint className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
									<span className="min-w-0 text-center">Вещами</span>
								</>
							)
						}
					]}
				/>
			</div>
		</header>
	);
};
