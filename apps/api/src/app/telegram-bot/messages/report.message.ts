import { Context } from 'telegraf';

export const sendReportMessage = async (ctx: Context): Promise<void> => {
	await ctx.reply('Волонтеры сейчас заняты уходом за животными. Ваш запрос передан, ответим при первой возможности');
};
