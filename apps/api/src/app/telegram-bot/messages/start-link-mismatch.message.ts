import { Context, Format } from 'telegraf';
import { TelegramUrlMapper } from '../../core/mappers/telegram-url.mapper';
import { buildTelegrafMessage } from '../utils/build-telegraf-message';

interface IProps {
	adminUsername: string;
}

export const sendStartLinkMismatchMessage = async (ctx: Context, { adminUsername }: IProps): Promise<void> => {
	const message = buildTelegrafMessage`
${Format.bold('🐾 Упс! Эта ссылка не для тебя')}

Похоже, эта ссылка была создана для другого опекуна.

${Format.quote('Чтобы привязать Telegram к своему профилю, перейди по своей персональной ссылке из письма. ')}
Если что-то пошло не так — напиши ${Format.link('нам', TelegramUrlMapper.getUserUrl(adminUsername))}, мы обязательно поможем ❤️`;

	ctx.reply(message, { link_preview_options: { is_disabled: true } });
};
