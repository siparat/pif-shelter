import { JSX } from 'react';
import { shelter } from '../../../../shared/config/shelter';
import { PageMeta } from '../../../../shared/ui/page-meta/PageMeta';

export const TermsPage = (): JSX.Element => {
	return (
		<main className="mx-auto max-w-[860px] px-6 py-16 text-(--color-text-primary)">
			<PageMeta
				title="Пользовательское соглашение"
				description="Пользовательское соглашение сайта приюта ПИФ — условия использования сервиса и обработки данных."
				noindex
			/>
			<h1 className="mb-2 text-3xl font-black tracking-tight">Пользовательское соглашение</h1>
			<p className="mb-12 text-sm text-(--color-text-secondary)">Последнее обновление: 1 мая 2025 г.</p>

			<section className="mb-10">
				<h2 className="mb-4 text-xl font-bold">1. Общие положения</h2>
				<p className="mb-3 leading-relaxed text-(--color-text-secondary)">
					Настоящее соглашение регулирует порядок использования сайта Приюта ПИФ (далее — «Сайт»). Получая
					доступ к Сайту, вы подтверждаете, что ознакомились с условиями соглашения и принимаете их в полном
					объёме.
				</p>
				<p className="leading-relaxed text-(--color-text-secondary)">
					Сайт является демонстрационным проектом, созданным в учебных целях. Платежи обрабатываются в
					тестовом режиме и автоматически помечаются как успешные. Реальные транзакции не проводятся.
				</p>
			</section>

			<section className="mb-10">
				<h2 className="mb-4 text-xl font-bold">2. Использование сайта</h2>
				<p className="mb-3 leading-relaxed text-(--color-text-secondary)">
					Вы вправе использовать Сайт в личных некоммерческих целях. При использовании Сайта запрещается:
				</p>
				<ul className="list-disc space-y-2 pl-6 text-(--color-text-secondary)">
					<li className="leading-relaxed">Нарушать работу Сайта, его инфраструктуры или серверов.</li>
					<li className="leading-relaxed">
						Размещать недостоверную, оскорбительную или незаконную информацию.
					</li>
					<li className="leading-relaxed">
						Использовать автоматизированные средства для сбора данных (парсинг, скрейпинг) без письменного
						разрешения.
					</li>
					<li className="leading-relaxed">
						Воспроизводить, копировать или распространять материалы Сайта без указания источника.
					</li>
					<li className="leading-relaxed">
						Предпринимать попытки несанкционированного доступа к закрытым разделам или базам данных.
					</li>
				</ul>
			</section>

			<section className="mb-10">
				<h2 className="mb-4 text-xl font-bold">3. Пожертвования и платежи</h2>
				<p className="mb-3 leading-relaxed text-(--color-text-secondary)">
					Все пожертвования, совершаемые через Сайт, являются добровольными и безвозвратными, если иное явно
					не предусмотрено условиями конкретной транзакции.
				</p>
				<p className="mb-3 leading-relaxed text-(--color-text-secondary)">
					Регулярные (ежемесячные) пожертвования оформляются как подписка. Вы можете отменить подписку в любой
					момент, перейдя по ссылке из письма или обратившись к нам напрямую. Уже списанные средства возврату
					не подлежат.
				</p>
				<p className="leading-relaxed text-(--color-text-secondary)">
					Платёжные операции обрабатываются сторонним провайдером. Мы не хранят данные банковских карт.
				</p>
			</section>

			<section className="mb-10">
				<h2 className="mb-4 text-xl font-bold">4. Программа опекунства</h2>
				<p className="mb-3 leading-relaxed text-(--color-text-secondary)">
					Оформляя опекунство, вы берёте на себя ежемесячное финансовое обязательство перед конкретным
					животным. Опекунство не предполагает передачи животного в собственность или владение.
				</p>
				<p className="mb-3 leading-relaxed text-(--color-text-secondary)">
					Одно животное может иметь только одного активного опекуна одновременно. Приют оставляет за собой
					право прекратить программу опекунства в отношении конкретного животного в случае его пристройства,
					гибели или изменения обстоятельств, уведомив опекуна по электронной почте.
				</p>
				<p className="leading-relaxed text-(--color-text-secondary)">
					Фото- и видеоотчёты предоставляются ежемесячно и носят информационный характер. Приют прилагает
					разумные усилия для соблюдения сроков, однако не несёт ответственности за задержки, вызванные
					форс-мажорными обстоятельствами.
				</p>
			</section>

			<section className="mb-10">
				<h2 className="mb-4 text-xl font-bold">5. Интеллектуальная собственность</h2>
				<p className="leading-relaxed text-(--color-text-secondary)">
					Все материалы Сайта — тексты, фотографии, логотипы, дизайн — являются собственностью Приюта ПИФ или
					используются на основании лицензий. Копирование материалов допускается только с указанием ссылки на
					источник и в некоммерческих целях.
				</p>
			</section>

			<section className="mb-10">
				<h2 className="mb-4 text-xl font-bold">6. Ограничение ответственности</h2>
				<p className="mb-3 leading-relaxed text-(--color-text-secondary)">
					Сайт предоставляется «как есть». Мы не гарантируем непрерывную или безошибочную работу Сайта и не
					несём ответственности за убытки, возникшие в результате его использования или невозможности
					использования.
				</p>
				<p className="leading-relaxed text-(--color-text-secondary)">
					Ссылки на сторонние ресурсы предоставляются для удобства. Мы не контролируем содержание сторонних
					сайтов и не несём ответственности за их работу.
				</p>
			</section>

			<section className="mb-10">
				<h2 className="mb-4 text-xl font-bold">7. Изменения соглашения</h2>
				<p className="leading-relaxed text-(--color-text-secondary)">
					Мы вправе изменять условия соглашения. Актуальная версия публикуется на этой странице. Продолжение
					использования Сайта после вступления изменений в силу означает ваше согласие с новой редакцией.
				</p>
			</section>

			<section>
				<h2 className="mb-4 text-xl font-bold">8. Контакты</h2>
				<p className="leading-relaxed text-(--color-text-secondary)">
					По вопросам, связанным с настоящим соглашением, пишите на{' '}
					<a href={`mailto:${shelter.email}`} className="underline transition-opacity hover:opacity-70">
						{shelter.email}
					</a>
					.
				</p>
			</section>
		</main>
	);
};

export default TermsPage;
