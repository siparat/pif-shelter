import { ROUTES } from './routes';
import { SITE_URL } from './api';

export type FooterSocialLink = {
	key: 'telegram' | 'vk' | 'instagram';
	label: string;
	href: string;
};

export type FooterContactItem = {
	key: 'address' | 'phone' | 'telegram' | 'handle' | 'email';
	label: string;
	href: string;
};

export const footerBrand = {
	title: 'Приют для бездомных животных',
	subtitle: 'город донецк'
};

export const SOCIAL_SHARE_HELP_TEXT =
	'Приют ПИФ в Донецке кормит, лечит и ищет дом для бездомных животных. Поделитесь страницей пожертвований — это бесплатно, зато помогает найти новых друзей приюту и доноров. Каждый репост даёт шанс, что кто-то рядом решит помочь.';

const donationsShareUrl = (): string => {
	const base = SITE_URL.replace(/\/$/, '');
	return `${base}${ROUTES.donations}`;
};

const vkGroupHref = (): string => import.meta.env.VITE_SOCIAL_VK_URL?.trim() || '';

const instagramHref = (): string => import.meta.env.VITE_SOCIAL_INSTAGRAM_URL?.trim() || '';

export const footerSocialLinks: FooterSocialLink[] = [
	{
		key: 'telegram',
		label: 'Telegram приюта',
		href: 'https://t.me/ulia_pif'
	},
	{
		key: 'vk',
		label: 'ВКонтакте',
		href:
			vkGroupHref() ||
			`https://vk.com/share.php?url=${encodeURIComponent(donationsShareUrl())}&title=${encodeURIComponent('Приют ПИФ — как помочь')}&comment=${encodeURIComponent(SOCIAL_SHARE_HELP_TEXT)}`
	},
	{
		key: 'instagram',
		label: 'Instagram',
		href:
			instagramHref() ||
			'https://www.instagram.com/explore/tags/%D0%BF%D1%80%D0%B8%D1%8E%D1%82%D0%B4%D0%BB%D1%8F%D0%B6%D0%B8%D0%B2%D0%BE%D1%82%D0%BD%D1%8B%D1%85/'
	}
];

export const getDonationShareSocialLinks = (): FooterSocialLink[] => {
	const url = donationsShareUrl();
	const text = SOCIAL_SHARE_HELP_TEXT;
	return [
		{
			key: 'telegram',
			label: 'Поделиться в Telegram',
			href: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`
		},
		{
			key: 'vk',
			label: 'Поделиться ВКонтакте',
			href: `https://vk.com/share.php?url=${encodeURIComponent(url)}&title=${encodeURIComponent('Приют ПИФ — можно помочь и без денег')}&comment=${encodeURIComponent(text)}`
		},
		{
			key: 'instagram',
			label: 'Открыть Instagram',
			href:
				instagramHref() ||
				'https://www.instagram.com/explore/tags/%D0%BF%D1%80%D0%B8%D1%8E%D1%82%D0%B4%D0%BB%D1%8F%D0%B6%D0%B8%D0%B2%D0%BE%D1%82%D0%BD%D1%8B%D1%85/'
		}
	];
};

export const footerContactsTitle = 'Контакты';

export const footerContacts: FooterContactItem[] = [
	{ key: 'address', label: 'улица Бехтерева, 16Д, Донецк', href: '#' },
	{ key: 'phone', label: '+7 (949) 494-94-94', href: '#' },
	{ key: 'telegram', label: '@ulia_pif', href: 'https://t.me/ulia_pif' },
	{ key: 'handle', label: '@pif', href: '#' },
	{ key: 'email', label: 'pif.donetsk@yandex.ru', href: 'mailto:pif.donetsk@yandex.ru' }
];

export const footerAuthor = {
	label: '@siparat',
	href: 'https://t.me/siparat'
};
