import { Context, Format } from 'telegraf';
import { buildTelegrafMessage } from '../utils/build-telegraf-message';

export const sendTelegramUsernameIsNotExistsMessage = async (ctx: Context): Promise<void> => {
	const message = buildTelegrafMessage`
${Format.bold('⚠️ У тебя не указан Telegram username')}

Чтобы мы могли корректно связать аккаунт, нужно указать ${Format.code('@username')} в настройках Telegram.
После этого вернись и попробуй снова 🐾`;

	ctx.reply(message);
};
