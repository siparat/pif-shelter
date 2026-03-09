import { Context } from 'telegraf';

export const sendAccountNotLinkedMessage = async (ctx: Context): Promise<void> => {
	await ctx.reply('❗Сначала привяжите аккаунт по ссылке из письма после оформления опекунства');
};

export const sendNoGuardianshipsMessage = async (ctx: Context): Promise<void> => {
	await ctx.reply('⚠️ У вас пока нет активных опекунств');
};
