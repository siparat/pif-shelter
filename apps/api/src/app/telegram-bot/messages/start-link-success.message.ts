import { buildTelegrafMessage } from '@pif/shared';
import { Context, Format } from 'telegraf';

export const sendStartLinkSuccessMessage = async (ctx: Context): Promise<void> => {
	const message = buildTelegrafMessage`
${Format.bold('🎉 Готово! Telegram успешно подключён')}

Теперь ты будешь получать:

${Format.code('🐾 уникальные фото и видео своего подопечного')}
${Format.code('🦴 новости о его жизни')}
${Format.code('❤️ важные обновления из приюта')}

${Format.bold('Спасибо, что стал частью его истории')}`;

	ctx.reply(message);
};
