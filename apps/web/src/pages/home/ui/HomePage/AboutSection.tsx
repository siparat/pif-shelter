import { JSX } from 'react';
import { useInView } from '../../../../shared/lib/use-in-view';
import { FeatureCard } from './FeatureCard';
import { StatCard } from './StatCard';

export const AboutSection = (): JSX.Element => {
	const { ref: cardsRef, inView: cardsInView } = useInView();
	const { ref: statsRef, inView: statsInView } = useInView();

	return (
		<section className="w-full px-4 md:px-12 xl:px-12 py-24 mx-auto max-w-[1920px]">
			<div
				ref={cardsRef as React.RefObject<HTMLDivElement>}
				className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
				<FeatureCard
					title="Спасаем и лечим"
					description="Каждый день мы принимаем, лечим и ухаживаем за сотнями хвостиков, даря им шанс на новую жизнь"
					className="bg-[#EAE8E3] text-[#4F3D38]"
					inView={cardsInView}
					delay={0}
					translateX={-60}
					translateY={20}
					imageContent={
						<img
							src="/dog-and-doctors.png"
							alt="Спасаем и лечим"
							className="absolute bottom-0 right-0 h-full object-contain object-bottom-right z-0 max-w-[60%]"
							aria-hidden="true"
						/>
					}
				/>
				<FeatureCard
					title="Забота о здоровье"
					description="Ветеринарная клиника приюта лечит и стерилизует животных, помогая остановить страдания бездомных хвостиков"
					className="bg-[#1C1A27] text-white"
					inView={cardsInView}
					delay={120}
					translateX={0}
					translateY={60}
					imageContent={
						<img
							src="/lines.png"
							alt="Забота о здоровье"
							className="absolute bottom-0 right-0 h-full w-[50%] object-contain object-bottom-right z-0"
							aria-hidden="true"
						/>
					}
				/>
				<FeatureCard
					title="Забота каждый день"
					description="Мы лечим, кормим, выгуливаем и просто дарим внимание тем, кто потерял веру в людей"
					className="bg-[#BDCEAC] text-[#4F3D38]"
					inView={cardsInView}
					delay={240}
					translateX={60}
					translateY={20}
					imageContent={
						<img
							src="/woman-and-dog.png"
							alt="Забота каждый день"
							className="absolute bottom-0 right-4 h-full object-contain object-bottom-right z-0 max-w-[50%]"
							aria-hidden="true"
						/>
					}
				/>
			</div>

			<div
				ref={statsRef as React.RefObject<HTMLDivElement>}
				className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:grid-cols-2 2xl:grid-cols-4">
				<StatCard
					value={'>' + import.meta.env.VITE_SHELTER_STAT_SAVED}
					description="С 2005 года приют дал дом и заботу тысячам хвостиков"
					label={
						<>
							Спасено <br /> животных
						</>
					}
					className="bg-[#F80068] text-white"
					inView={statsInView}
					delay={0}
				/>
				<StatCard
					value={import.meta.env.VITE_SHELTER_STAT_ADOPTED || ''}
					description="Собаки и кошки, нашедшие любящих хозяев"
					label={
						<>
							Пристроено <br /> в семьи
						</>
					}
					className="bg-[#FA8755] text-white"
					inView={statsInView}
					delay={100}
				/>
				<StatCard
					value={import.meta.env.VITE_SHELTER_STAT_STERILIZED || ''}
					description="В нашей ветклинике и партнёрских клиниках"
					label={
						<>
							Проведено <br /> процедур стерилизации
						</>
					}
					className="bg-[#65ADC0] text-white"
					inView={statsInView}
					delay={200}
				/>
				<StatCard
					value={import.meta.env.VITE_SHELTER_STAT_FOOD || ''}
					description="Благодаря добрым людям и акциям"
					label={
						<>
							Корм <br /> собрано за год
						</>
					}
					className="bg-[#F2F1F1] text-[#4F3D38]"
					inView={statsInView}
					delay={300}
				/>
			</div>
		</section>
	);
};
