import { JSX } from 'react';
import { shelterStats } from '../../../../../shared/config/about';
import { StatCard } from '../../../../../shared/ui';

export const HistorySection = (): JSX.Element => (
	<section>
		<h1 className="section-title mb-8">Наша история</h1>

		<div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-10">
			<div className="grid flex-1 grid-cols-2 gap-3 sm:gap-4">
				<StatCard
					value={`>${shelterStats.saved}`}
					description="С 2005 года приют дал дом и заботу тысячам животных"
					label="Спасено животных"
					className="flex flex-col gap-2 rounded-2xl bg-[#d8366b] p-5 text-white sm:p-6"
				/>
				<StatCard
					value={shelterStats.adopted}
					description="Собак и кошек, нашедших добрых хозяев"
					label="Пристроено в семьи"
					className="flex flex-col gap-2 rounded-2xl bg-(--color-brand-accent) p-5 text-white sm:p-6"
				/>
				<StatCard
					value={shelterStats.sterilized}
					description="В нашей ветклинике и партнёрских клиниках"
					label="Проведено процедур стерилизации"
					className="flex flex-col gap-2 rounded-2xl bg-[#3aacb4] p-5 text-white sm:p-6"
				/>
				<StatCard
					value={shelterStats.food}
					description="Благодаря добрым людям и акциям"
					label="Корм собрано за год"
					className="flex flex-col gap-2 rounded-2xl bg-[#6aaa5e] p-5 text-white sm:p-6"
				/>
			</div>

			<div className="relative h-[-webkit-fill-available] overflow-hidden rounded-2xl lg:w-[420px] xl:w-[520px]">
				<img
					src="/about-shelter.png"
					alt="Приют ПИФ"
					className="h-full w-full object-cover"
					onError={(e) => {
						(e.target as HTMLImageElement).style.display = 'none';
					}}
				/>
			</div>
		</div>
	</section>
);
