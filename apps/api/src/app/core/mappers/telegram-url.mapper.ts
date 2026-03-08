import { GUARDIANSHIP_BOT_LINK_PREFIX } from '@pif/shared';

export class TelegramUrlMapper {
	static getUserUrl(username: string): string {
		const base = username.startsWith('@') ? username.slice(1) : username;
		return `https://t.me/${base}`;
	}

	static getTelegramBotLink(botUsername: string, linkToken: string): string {
		const base = botUsername.startsWith('@') ? botUsername.slice(1) : botUsername;
		return `https://t.me/${base}?start=${GUARDIANSHIP_BOT_LINK_PREFIX}${linkToken}`;
	}
}
