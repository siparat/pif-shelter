export const getUserTelegramLink = (telegram: string | null): string => {
	const telegramLink = 'https://t.me/';
	if (!telegram) {
		return '—';
	}
	return telegram.startsWith('@') ? telegramLink + telegram.slice(1) : telegramLink + telegram;
};
