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

export const footerSocialLinks: FooterSocialLink[] = [
	{ key: 'telegram', label: 'Telegram', href: '#' },
	{ key: 'vk', label: 'VK', href: '#' },
	{ key: 'instagram', label: 'Instagram', href: '#' }
];

export const footerContactsTitle = 'Контакты';

export const footerContacts: FooterContactItem[] = [
	{ key: 'address', label: 'улица Бехтерева, 16Д, Донецк', href: '#' },
	{ key: 'phone', label: '+7 (949) 494-94-94', href: '#' },
	{ key: 'telegram', label: '@ulia_pif', href: '#' },
	{ key: 'handle', label: '@pif', href: '#' },
	{ key: 'email', label: 'pif.donetsk@yandex.ru', href: '#' }
];

export const footerAuthor = {
	label: '@siparat',
	href: 'https://t.me/siparat'
};
