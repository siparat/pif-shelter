export function normalizeTelegramUsername(username: string): string {
	return username.replace(/^@/, '').toLowerCase().trim();
}
