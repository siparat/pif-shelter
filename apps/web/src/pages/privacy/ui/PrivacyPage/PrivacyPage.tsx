import { JSX } from 'react';
import { shelter } from '../../../../shared/config/shelter';
import { PageMeta } from '../../../../shared/ui/page-meta/PageMeta';

export const PrivacyPage = (): JSX.Element => {
	return (
		<main className="mx-auto max-w-[860px] px-6 py-16 text-(--color-text-primary)">
			<PageMeta
				title="Политика конфиденциальности"
				description="Политика конфиденциальности приюта ПИФ — как мы собираем, храним и используем ваши данные."
				noindex
			/>
			<h1 className="mb-2 text-3xl font-black tracking-tight">Политика конфиденциальности</h1>
			<p className="mb-12 text-sm text-(--color-text-secondary)">Последнее обновление: 1 мая 2025 г.</p>

			<section className="mb-10">
				<h2 className="mb-4 text-xl font-bold">1. Общие положения</h2>
				<p className="mb-3 leading-relaxed text-(--color-text-secondary)">
					Настоящая политика конфиденциальности описывает, какие персональные данные собирает сайт Приюта ПИФ
					(далее — «Сайт»), как они используются и как защищаются. Используя Сайт, вы соглашаетесь с условиями
					настоящей политики.
				</p>
				<p className="leading-relaxed text-(--color-text-secondary)">
					Сайт является демонстрационным проектом. Все данные, введённые пользователями, обрабатываются
					исключительно в рамках демонстрации функциональности и не передаются третьим лицам в коммерческих
					целях.
				</p>
			</section>

			<section className="mb-10">
				<h2 className="mb-4 text-xl font-bold">2. Какие данные мы собираем</h2>
				<p className="mb-3 leading-relaxed text-(--color-text-secondary)">
					При использовании Сайта мы можем собирать следующие данные:
				</p>
				<ul className="list-disc space-y-2 pl-6 text-(--color-text-secondary)">
					<li className="leading-relaxed">
						<strong className="text-(--color-text-primary)">Контактные данные</strong> — имя, адрес
						электронной почты, номер телефона, которые вы указываете при заполнении форм обратной связи или
						оформлении пожертвований.
					</li>
					<li className="leading-relaxed">
						<strong className="text-(--color-text-primary)">Платёжные данные</strong> — информация о
						транзакциях (сумма, дата). Полные реквизиты карт не хранятся на наших серверах и передаются
						напрямую платёжному провайдеру.
					</li>
					<li className="leading-relaxed">
						<strong className="text-(--color-text-primary)">Технические данные</strong> — IP-адрес, тип
						браузера, операционная система, страницы, которые вы посещаете, время визита. Эти данные
						собираются автоматически и используются для аналитики.
					</li>
					<li className="leading-relaxed">
						<strong className="text-(--color-text-primary)">Файлы cookie</strong> — подробнее описаны в
						Политике cookies.
					</li>
				</ul>
			</section>

			<section className="mb-10">
				<h2 className="mb-4 text-xl font-bold">3. Как мы используем данные</h2>
				<ul className="list-disc space-y-2 pl-6 text-(--color-text-secondary)">
					<li className="leading-relaxed">Обработка пожертвований и уведомление о статусе платежа.</li>
					<li className="leading-relaxed">
						Отправка отчётов об опекаемых животных и информационных сообщений, на которые вы подписались.
					</li>
					<li className="leading-relaxed">Ответы на ваши обращения через форму обратной связи.</li>
					<li className="leading-relaxed">Анализ посещаемости и улучшение работы Сайта.</li>
					<li className="leading-relaxed">Выполнение требований законодательства.</li>
				</ul>
			</section>

			<section className="mb-10">
				<h2 className="mb-4 text-xl font-bold">4. Передача данных третьим лицам</h2>
				<p className="mb-3 leading-relaxed text-(--color-text-secondary)">
					Мы не продаём и не передаём ваши персональные данные третьим лицам, за исключением следующих
					случаев:
				</p>
				<ul className="list-disc space-y-2 pl-6 text-(--color-text-secondary)">
					<li className="leading-relaxed">
						<strong className="text-(--color-text-primary)">Платёжные провайдеры</strong> — для обработки
						транзакций. Они действуют в соответствии со своими политиками конфиденциальности.
					</li>
					<li className="leading-relaxed">
						<strong className="text-(--color-text-primary)">Сервисы аналитики</strong> — для оценки трафика
						и поведения пользователей на Сайте.
					</li>
					<li className="leading-relaxed">
						<strong className="text-(--color-text-primary)">Требования закона</strong> — если это необходимо
						по решению суда или требованию уполномоченных органов.
					</li>
				</ul>
			</section>

			<section className="mb-10">
				<h2 className="mb-4 text-xl font-bold">5. Хранение и защита данных</h2>
				<p className="mb-3 leading-relaxed text-(--color-text-secondary)">
					Данные хранятся на защищённых серверах. Мы применяем технические и организационные меры для защиты
					ваших данных от несанкционированного доступа, изменения, раскрытия или уничтожения.
				</p>
				<p className="leading-relaxed text-(--color-text-secondary)">
					Персональные данные хранятся не дольше, чем это необходимо для целей, указанных в настоящей
					политике, или чем требует законодательство.
				</p>
			</section>

			<section className="mb-10">
				<h2 className="mb-4 text-xl font-bold">6. Ваши права</h2>
				<p className="mb-3 leading-relaxed text-(--color-text-secondary)">Вы вправе:</p>
				<ul className="list-disc space-y-2 pl-6 text-(--color-text-secondary)">
					<li className="leading-relaxed">Запросить доступ к своим персональным данным.</li>
					<li className="leading-relaxed">Потребовать исправления неточных данных.</li>
					<li className="leading-relaxed">Потребовать удаления данных («право на забвение»).</li>
					<li className="leading-relaxed">Отозвать согласие на обработку данных в любой момент.</li>
					<li className="leading-relaxed">Отписаться от рассылок по ссылке в любом письме.</li>
				</ul>
				<p className="mt-3 leading-relaxed text-(--color-text-secondary)">
					Для реализации своих прав напишите нам на{' '}
					<a href={`mailto:${shelter.email}`} className="underline transition-opacity hover:opacity-70">
						{shelter.email}
					</a>
					.
				</p>
			</section>

			<section className="mb-10">
				<h2 className="mb-4 text-xl font-bold">7. Изменения политики</h2>
				<p className="leading-relaxed text-(--color-text-secondary)">
					Мы можем обновлять настоящую политику. Актуальная версия всегда доступна на этой странице. Дата
					последнего обновления указана в начале документа. Продолжение использования Сайта после внесения
					изменений означает ваше согласие с обновлённой политикой.
				</p>
			</section>

			<section>
				<h2 className="mb-4 text-xl font-bold">8. Контакты</h2>
				<p className="leading-relaxed text-(--color-text-secondary)">
					По вопросам, связанным с обработкой персональных данных, обращайтесь:{' '}
					<a href={`mailto:${shelter.email}`} className="underline transition-opacity hover:opacity-70">
						{shelter.email}
					</a>
					.
				</p>
			</section>
		</main>
	);
};

export default PrivacyPage;
