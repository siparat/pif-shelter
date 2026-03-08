import { GUARDIANSHIP_BOT_LINK_PREFIX } from '@pif/shared';

export class AppUrlMapper {
	static getInviteUrl(baseUrl: string, token: string): string {
		return `${baseUrl}/accept-invite?token=${token}`;
	}

	static getCancelGuardianshipUrl(baseUrl: string, token: string): string {
		return `${baseUrl}/cancel-guardianship?token=${token}`;
	}

	static getTelegramBotLink(botUsername: string, linkToken: string): string {
		const base = botUsername.startsWith('@') ? botUsername.slice(1) : botUsername;
		return `https://t.me/${base}?start=${GUARDIANSHIP_BOT_LINK_PREFIX}${linkToken}`;
	}
}
