import { buildTelegrafMessage } from '@pif/shared';
import { Context, Format } from 'telegraf';

export interface IHelpMessageProps {
	contacts?: string;
	address?: string;
	visitingRules?: string;
	siteUrl?: string;
}

export const sendHelpMessage = async (ctx: Context, props: IHelpMessageProps): Promise<void> => {
	const { contacts, address, visitingRules, siteUrl } = props;
	const parts: (string | ReturnType<typeof Format.bold> | ReturnType<typeof Format.italic>)[] = [];

	parts.push(Format.bold('📖 Справка приюта ПИФ'), '\n\n');

	if (contacts) {
		parts.push(Format.bold('📞 Контакты'), '\n', contacts, '\n\n');
	}
	if (address) {
		parts.push(Format.bold('📍 Адрес'), '\n', address, '\n\n');
	}
	if (visitingRules) {
		parts.push(Format.bold('📋 Правила посещения'), '\n', visitingRules, '\n\n');
	}
	if (siteUrl) {
		parts.push(Format.bold('🌐 Сайт'), '\n', siteUrl, '\n\n');
	}

	if (parts.length <= 2) {
		const emptyMessage = buildTelegrafMessage`
${Format.bold('📖 Справка')}

Справка пока не заполнена. Напишите в приют — мы добавим контакты и адрес.`;
		await ctx.reply(emptyMessage);
		return;
	}

	parts.push('\n\n', Format.italic('По вопросам опеки обращайтесь по контактам выше'));
	const message = Format.join(parts);
	await ctx.reply(message);
};
