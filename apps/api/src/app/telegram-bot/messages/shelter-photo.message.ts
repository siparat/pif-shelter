import { GuardianshipBotImages } from '@pif/shared';
import { Context, Format } from 'telegraf';
import { buildTelegrafMessage } from '../utils/build-telegraf-message';

export const sendShelterPhotoMessage = async (ctx: Context): Promise<void> => {
	const caption = buildTelegrafMessage`
${Format.bold('🏠 Наш приют ПИФ')}

Этот бот — связь между приютом и опекунами. После того как вы оформили опекунство, вы привязываете Telegram по ссылке из письма и получаете:

${Format.code('🐾 уникальные фото и видео своего подопечного')}
${Format.code('🦴 новости о его жизни в приюте')}
${Format.code('❤️ важные обновления: здоровье, переезды, события')}

Команды: ${Format.code('/my_animals')} — ваши подопечные, ${Format.code('/help')} — контакты, адрес и правила посещения.

${Format.italic('Спасибо, что вы с нами')} ❤️`;

	await ctx.replyWithPhoto({ url: GuardianshipBotImages.WELCOME }, { caption });
};
