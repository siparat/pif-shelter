import { ReturnData } from '@pif/contracts';
import { users } from '@pif/database';
import { ITopic } from '@pif/shared';
import dayjs from 'dayjs';
import { Context, Format } from 'telegraf';
import { User } from 'telegraf/typings/core/types/typegram';
import { GetMyGaurdianshipsResponseDto } from '../../core/dto/index';
import { buildTelegrafMessage } from '../utils/build-telegraf-message';

export interface IReportMessagePayload {
	chat: User | undefined;
	user: typeof users.$inferSelect | undefined;
	guardianships: ReturnData<typeof GetMyGaurdianshipsResponseDto>['guardianships'] | undefined;
	text: string;
}

export async function sendReportMessageToChat(
	ctx: Context,
	{ chat, user, guardianships, text }: IReportMessagePayload,
	{ chatId, threadId }: ITopic
): Promise<void> {
	const message = buildTelegrafMessage`🔴 ${Format.bold(`Запрос от опекуна`)}
Время: ${Format.code(dayjs().format('D MMMM YYYY[г] HH:mm') + ' по МСК')}

👤 ${Format.bold('Telegram')}
• ID: ${Format.code(chat?.id.toString() ?? 'не указан')}
• Username: ${chat?.username ? '@' + chat.username : 'не указан'}
• Имя: ${Format.code(user?.name ?? 'не указан')}

🔗 ${Format.bold('Связь с продуктом')}
• ID пользователя: ${Format.code(user?.id ?? 'не указан')}
• ID опекунства: ${Format.code(guardianships?.[0]?.id ?? 'не указан')}
• ID животного: ${Format.code(guardianships?.[0]?.animal?.id ?? 'не указан')}
• Кличка животного: ${Format.code(guardianships?.[0]?.animal?.name ?? 'не указан')}

💬 ${Format.bold('Текст обращения')}:
${Format.quote(text)}`;

	await ctx.telegram.sendMessage(chatId, message, { message_thread_id: threadId });
}
