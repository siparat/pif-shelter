export const shelterStats = {
	saved: import.meta.env.VITE_SHELTER_STAT_SAVED || '>8 500',
	adopted: import.meta.env.VITE_SHELTER_STAT_ADOPTED || '6 200',
	sterilized: import.meta.env.VITE_SHELTER_STAT_STERILIZED || '3 400',
	food: import.meta.env.VITE_SHELTER_STAT_FOOD || '12 тонн'
};

export const shelterFinanceYears: number[] = (() => {
	const startYear = parseInt(import.meta.env.VITE_SHELTER_FINANCE_START_YEAR || '2021', 10);
	const currentYear = new Date().getFullYear();
	const years: number[] = [];
	for (let y = currentYear; y >= startYear; y--) {
		years.push(y);
	}
	return years;
})();

export type TimelineEvent = {
	year: number;
	text: string;
};

export const timelineEvents: TimelineEvent[] = [
	{
		year: 2005,
		text: 'Основание приюта «ПИФ». Начало пути. Несколько неравнодушных людей начали подбирать бездомных животных на улицах Донецка и искать им новые дома'
	},
	{ year: 2008, text: 'Открыт первый небольшой приют на окраине города. Тогда в нём жили всего 12 собак и 4 кошки' },
	{ year: 2009, text: 'Организованы первые благотворительные акции по сбору корма и медикаментов' },
	{ year: 2012, text: 'Появилось название «ПИФ» — Приют для бездомных животных. Создана страница в соцсетях' },
	{ year: 2016, text: 'Проведена первая масштабная стерилизационная программа совместно с ветеринарами-волонтёрами' },
	{
		year: 2017,
		text: 'Количество подопечных перевалило за сотню. Началось строительство нового вольерного комплекса'
	},
	{ year: 2018, text: 'Запущен проект по школьному волонтёрству — дети приходят помогать ухаживать за животными' },
	{
		year: 2019,
		text: 'Организованы регулярные «Дни открытых дверей», где посетители могли познакомиться с питомцами'
	},
	{ year: 2021, text: 'Начало сотрудничества с крупными донецкими компаниями — партнёрами приюта' },
	{ year: 2022, text: 'Реализован проект по строительству тёплых зимних домиков и изолятора для лечения животных' },
	{ year: 2023, text: 'Более 2 000 животных нашли свой дом. Команда приюта выросла до 40 волонтёров и сотрудников' },
	{ year: 2025, text: 'Разработана онлайн-платформа для пожертвований и прозрачной отчётности' }
];
