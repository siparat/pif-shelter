import { JSX } from 'react';
import { AccordionItem } from '../../../../../shared/ui';

const FAQ_ITEMS: { q: string; a: string }[] = [
	{
		q: 'Куда уходят деньги?',
		a: 'Средства направляются на корм, ветеринарию, стерилизации, ремонт вольеров и мелкие расходы по уходу. Публичная книга на сайте показывает проводки за каждый месяц.'
	},
	{
		q: 'Что такое ежемесячная помощь?',
		a: 'Это подписка: списание с выбранной периодичностью согласно правилам провайдера. На email придёт ссылка, если понадобится отменить подписку.'
	},
	{
		q: 'Можно остаться анонимным?',
		a: 'Да. Если включить переключатель «анонимно», имя не попадёт в публичный список пожертвований, но платёж всё равно будет учтён в отчёте.'
	},
	{
		q: 'Как помочь вещами?',
		a: 'На вкладке «Вещами» есть ссылка на раздел о добровольчестве и материальной помощи. Там подскажем, какие вещи сейчас нужны и как их передать.'
	},
	{
		q: 'Данные на сайте настоящие?',
		a: 'Это демонстрационный проект: животные и часть данных вымышлены, платежи имитация. Интерфейс и потоки совпадают с боевой архитектурой, чтобы было проще развивать проект дальше.'
	}
];

export const FaqSection = (): JSX.Element => {
	return (
		<section className="flex flex-col gap-4 sm:gap-6" aria-labelledby="faq-title">
			<div className="text-center md:text-left">
				<p className="eyebrow inline-block text-(--color-brand-accent) max-md:mx-auto">Вопросы</p>
				<h2 id="faq-title" className="section-title mt-2 text-(--color-text-primary)">
					Частые вопросы
				</h2>
			</div>
			<div className="flex flex-col gap-3">
				{FAQ_ITEMS.map((item) => (
					<AccordionItem key={item.q} title={item.q}>
						<p>{item.a}</p>
					</AccordionItem>
				))}
			</div>
		</section>
	);
};
