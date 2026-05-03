import { JSX } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../../../shared/config/routes';
import { shelter } from '../../../../shared/config/shelter';

export const CookiesPage = (): JSX.Element => {
	return (
		<main className="mx-auto max-w-[860px] px-6 py-16 text-(--color-text-primary)">
			<h1 className="mb-2 text-3xl font-black tracking-tight">Политика cookies</h1>
			<p className="mb-12 text-sm text-(--color-text-secondary)">Последнее обновление: 1 мая 2025 г.</p>

			<section className="mb-10">
				<h2 className="mb-4 text-xl font-bold">1. Что такое cookies</h2>
				<p className="leading-relaxed text-(--color-text-secondary)">
					Cookie — это небольшой текстовый файл, который сайт сохраняет на вашем устройстве при посещении.
					Cookies помогают сайту запоминать ваши действия и настройки, чтобы не вводить их повторно при
					следующем визите.
				</p>
			</section>

			<section className="mb-10">
				<h2 className="mb-4 text-xl font-bold">2. Какие cookies мы используем</h2>

				<h3 className="mb-2 mt-6 text-base font-bold">Необходимые cookies</h3>
				<p className="mb-4 leading-relaxed text-(--color-text-secondary)">
					Обеспечивают базовую работу Сайта: авторизацию, навигацию, безопасность форм. Без них Сайт не
					функционирует корректно. Не требуют вашего согласия.
				</p>

				<h3 className="mb-2 text-base font-bold">Функциональные cookies</h3>
				<p className="mb-4 leading-relaxed text-(--color-text-secondary)">
					Запоминают ваши предпочтения — например, тему оформления или язык. Позволяют персонализировать
					использование Сайта.
				</p>

				<h3 className="mb-2 text-base font-bold">Аналитические cookies</h3>
				<p className="mb-4 leading-relaxed text-(--color-text-secondary)">
					Помогают нам понять, как посетители взаимодействуют с Сайтом: какие страницы посещают чаще, откуда
					приходят, как долго остаются. Данные собираются в агрегированном и анонимизированном виде.
				</p>

				<h3 className="mb-2 text-base font-bold">Маркетинговые cookies</h3>
				<p className="leading-relaxed text-(--color-text-secondary)">
					В настоящее время на Сайте не используются.
				</p>
			</section>

			<section className="mb-10">
				<h2 className="mb-4 text-xl font-bold">3. Сторонние cookies</h2>
				<p className="leading-relaxed text-(--color-text-secondary)">
					Некоторые функции Сайта — встроенные карты, кнопки социальных сетей, платёжные формы — могут
					устанавливать cookies от третьих лиц. Мы не контролируем эти файлы. Условия их использования описаны
					в политиках конфиденциальности соответствующих сервисов.
				</p>
			</section>

			<section className="mb-10">
				<h2 className="mb-4 text-xl font-bold">4. Как управлять cookies</h2>
				<p className="mb-3 leading-relaxed text-(--color-text-secondary)">
					Вы можете настроить или отключить cookies в настройках браузера. Обратите внимание: отключение
					необходимых cookies может нарушить работу отдельных функций Сайта.
				</p>
				<ul className="list-disc space-y-2 pl-6 text-(--color-text-secondary)">
					<li className="leading-relaxed">
						<strong className="text-(--color-text-primary)">Chrome:</strong> Настройки → Конфиденциальность
						и безопасность → Файлы cookie и другие данные сайтов.
					</li>
					<li className="leading-relaxed">
						<strong className="text-(--color-text-primary)">Firefox:</strong> Настройки → Приватность и
						защита → Куки и данные сайтов.
					</li>
					<li className="leading-relaxed">
						<strong className="text-(--color-text-primary)">Safari:</strong> Настройки → Конфиденциальность
						→ Управление данными веб-сайта.
					</li>
					<li className="leading-relaxed">
						<strong className="text-(--color-text-primary)">Edge:</strong> Настройки → Файлы cookie и
						разрешения сайта.
					</li>
				</ul>
			</section>

			<section className="mb-10">
				<h2 className="mb-4 text-xl font-bold">5. Согласие</h2>
				<p className="leading-relaxed text-(--color-text-secondary)">
					Продолжая использовать Сайт, вы соглашаетесь с использованием cookies в соответствии с настоящей
					политикой. Подробнее об обработке персональных данных — в нашей{' '}
					<Link to={ROUTES.privacy} className="underline transition-opacity hover:opacity-70">
						Политике конфиденциальности
					</Link>
					.
				</p>
			</section>

			<section>
				<h2 className="mb-4 text-xl font-bold">6. Контакты</h2>
				<p className="leading-relaxed text-(--color-text-secondary)">
					По вопросам использования cookies пишите на{' '}
					<a href={`mailto:${shelter.email}`} className="underline transition-opacity hover:opacity-70">
						{shelter.email}
					</a>
					.
				</p>
			</section>
		</main>
	);
};

export default CookiesPage;
