import { buildTelegrafMessage } from '@pif/shared';
import { Format, Markup } from 'telegraf';
import type { FmtString } from 'telegraf/format';
import { TelegramUrlMapper } from '../../core/mappers/telegram-url.mapper';
import type { IGuardianshipCancelledMessagePayload } from '../interfaces/send-guardianship-cancelled-payload.interface';

export function buildGuardianshipCancelledMessage(payload: IGuardianshipCancelledMessagePayload): {
	text: FmtString;
	markup?: ReturnType<typeof Markup.inlineKeyboard>;
} {
	const { animalName, reason, isRefundExpected, adminTelegramUsername } = payload;

	const text = buildTelegrafMessage`
${Format.bold('Опекунство отменено')}

Опекунство над ${Format.bold(animalName)} прекращено.

${Format.bold('Причина:')} ${reason}
${isRefundExpected ? `\nСредства вернутся на карту, с которой списывалась оплата, в течение нескольких рабочих дней.\n\nЕсли деньги не пришли в течение нескольких дней — напишите администратору в Telegram.` : ''}`;

	if (!isRefundExpected) {
		return { text };
	}
	const adminUrl = TelegramUrlMapper.getUserUrl(adminTelegramUsername);
	return {
		text,
		markup: Markup.inlineKeyboard([Markup.button.url('💬 Написать администратору', adminUrl)])
	};
}
