import { Context, Format } from 'telegraf';
import { buildTelegrafMessage } from '../utils/build-telegraf-message';

export const sendStartLinkAlreadyUsedMessage = async (ctx: Context): Promise<void> => {
	const message = buildTelegrafMessage`
${Format.bold('🔗 Эта ссылка уже была активирована')}

Каждая ссылка для подключения работает ${Format.bold('только один раз')}, чтобы защитить твой аккаунт.`;

	ctx.reply(message);
};
