import { matchPath } from 'react-router-dom';
import { adminRoutes, ROUTES } from '../shared/config';
import { router } from './router';

const APP_NAME = 'ПИФ';
const DEFAULT_DESCRIPTION =
	'Админ-панель приюта ПИФ: управление животными, командой, встречами, опекунством и финансами.';

type MetaDefinition = {
	title: string;
	description: string;
};

const staticMetaByRoute: Array<{ path: string; meta: MetaDefinition }> = [
	{
		path: '/accept-invite',
		meta: {
			title: 'Принятие приглашения',
			description: 'Завершение регистрации сотрудника в админ-панели ПИФ.'
		}
	},
	{
		path: '/cancel-guardianship',
		meta: {
			title: 'Отмена опекунства',
			description: 'Подтверждение и оформление отмены опекунства.'
		}
	},
	{
		path: ROUTES.login,
		meta: {
			title: 'Вход',
			description: 'Авторизация сотрудников в админ-панели ПИФ.'
		}
	}
];

const setMetaTag = (selector: string, attr: 'name' | 'property', key: string, content: string): void => {
	let tag = document.querySelector<HTMLMetaElement>(selector);
	if (!tag) {
		tag = document.createElement('meta');
		tag.setAttribute(attr, key);
		document.head.append(tag);
	}
	tag.setAttribute('content', content);
};

const setLinkTag = (rel: string, href: string): void => {
	let tag = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
	if (!tag) {
		tag = document.createElement('link');
		tag.setAttribute('rel', rel);
		document.head.append(tag);
	}
	tag.setAttribute('href', href);
};

const resolveMetaByPath = (pathname: string): MetaDefinition => {
	for (const { path, meta } of staticMetaByRoute) {
		if (matchPath({ path, end: true }, pathname)) {
			return meta;
		}
	}

	for (const route of adminRoutes) {
		if (route.key === 'login') {
			continue;
		}
		if (matchPath({ path: route.path, end: true }, pathname)) {
			return {
				title: route.name,
				description: `${route.name} в админ-панели ПИФ.`
			};
		}
	}

	return {
		title: 'Админ-панель',
		description: DEFAULT_DESCRIPTION
	};
};

const updateSeo = (pathname: string): void => {
	const resolved = resolveMetaByPath(pathname);
	const fullTitle = `${resolved.title} | ${APP_NAME}`;
	const fullUrl = `${window.location.origin}${pathname}`;

	document.title = fullTitle;
	setMetaTag('meta[name="description"]', 'name', 'description', resolved.description);
	setMetaTag('meta[property="og:type"]', 'property', 'og:type', 'website');
	setMetaTag('meta[property="og:title"]', 'property', 'og:title', fullTitle);
	setMetaTag('meta[property="og:description"]', 'property', 'og:description', resolved.description);
	setMetaTag('meta[property="og:site_name"]', 'property', 'og:site_name', APP_NAME);
	setMetaTag('meta[property="og:locale"]', 'property', 'og:locale', 'ru_RU');
	setMetaTag('meta[property="og:url"]', 'property', 'og:url', fullUrl);
	setMetaTag('meta[property="og:image"]', 'property', 'og:image', `${window.location.origin}/favicon.svg`);
	setMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary');
	setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', fullTitle);
	setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', resolved.description);
	setMetaTag('meta[name="theme-color"]', 'name', 'theme-color', '#4F3D38');
	setLinkTag('canonical', fullUrl);
};

export const initializeSeo = (): void => {
	updateSeo(router.state.location.pathname);
	router.subscribe((state) => {
		updateSeo(state.location.pathname);
	});
};
