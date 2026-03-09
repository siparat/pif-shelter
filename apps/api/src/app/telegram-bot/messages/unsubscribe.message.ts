import { GuardianshipBotCallback } from '@pif/shared';
import { Context, Markup } from 'telegraf';

interface IProps {
	list: {
		guardianshipId: string;
		animalName: string;
	}[];
}

export const sendUnsubscribeListMessage = async (ctx: Context, params: IProps): Promise<void> => {
	const buttons = params.list.map((g) => [
		Markup.button.callback(g.animalName, `${GuardianshipBotCallback.UNSCRIBE.CHOICE_PREFIX}${g.guardianshipId}`)
	]);
	await ctx.reply('Выберите опекунство для отмены:', Markup.inlineKeyboard(buttons));
};

export const sendUnsubscribeConfirmMessage = async (
	ctx: Context,
	params: { animalName: string },
	guardianshipId: string
): Promise<void> => {
	const text = `Вы уверены, что хотите отменить опекунство над ${params.animalName}? Подписка будет отменена, оплаченный период доработает.`;
	const keyboard = Markup.inlineKeyboard([
		Markup.button.callback('Да, отменить', `${GuardianshipBotCallback.UNSCRIBE.CONFIRM_PREFIX}${guardianshipId}`),
		Markup.button.callback('Нет', GuardianshipBotCallback.UNSCRIBE.ABORT)
	]);
	await ctx.reply(text, keyboard);
};

export const sendUnsubscribeSuccessMessage = async (ctx: Context, params: { animalName: string }): Promise<void> => {
	await ctx.reply(`Подписка отменена. Жаль расставаться. ${params.animalName} будет скучать.`);
};

export const sendUnsubscribeAbortedMessage = async (ctx: Context): Promise<void> => {
	await ctx.reply('Отмена опекунства отменена. Ничего не изменилось.');
};
