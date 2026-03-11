export class AppUrlMapper {
	static getInviteUrl(baseUrl: string, token: string): string {
		return `${baseUrl}/accept-invite?token=${token}`;
	}

	static getCancelGuardianshipUrl(baseUrl: string, token: string): string {
		return `${baseUrl}/cancel-guardianship?token=${token}`;
	}

	static getHomeUrl(baseUrl: string): string {
		return `${baseUrl}/`;
	}
}
