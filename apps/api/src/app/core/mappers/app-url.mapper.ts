export class AppUrlMapper {
	static getInviteUrl(baseUrl: string, token: string): string {
		return `${baseUrl}/accept-invite?token=${token}`;
	}
}
