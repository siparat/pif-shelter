import {
	AnimalSpeciesEnum,
	buildTelegrafMessage,
	GuardianshipBotCallback,
	MY_ANIMALS_BOT_PAGE_SIZE
} from '@pif/shared';
import { Context, Format, Markup } from 'telegraf';
import { InlineKeyboardMarkup } from 'telegraf/typings/core/types/typegram';

export interface IMyAnimalsListGuardianship {
	id: string;
	animalId: string;
	animal: { id: string; name: string; species: string } | null;
}

export interface IMyAnimalsListProps {
	guardianships: IMyAnimalsListGuardianship[];
	page: number;
	perPage?: number;
	totalPages: number;
}

export const constructAnimalButton = (g: IMyAnimalsListGuardianship): ReturnType<typeof Markup.button.callback>[] => {
	const species = g.animal ? (g.animal.species == AnimalSpeciesEnum.DOG ? '🐶' : '🐱') : '';
	return [
		Markup.button.callback(
			species + ' ' + (g.animal?.name ?? '—'),
			`${GuardianshipBotCallback.MY_ANIMALS.CARD_PREFIX}${g.animalId}`
		)
	];
};

export const constructNavRow = (page: number, totalPages: number): ReturnType<typeof Markup.button.callback>[] => {
	const navRow = [];
	if (page > 1) {
		navRow.push(
			Markup.button.callback('◀ Назад', `${GuardianshipBotCallback.MY_ANIMALS.LIST_PAGE_PREFIX}${page - 1}`)
		);
	}
	if (page < totalPages) {
		navRow.push(
			Markup.button.callback('Вперёд ▶', `${GuardianshipBotCallback.MY_ANIMALS.LIST_PAGE_PREFIX}${page + 1}`)
		);
	}
	return navRow;
};

export function buildMyAnimalsListContent(props: IMyAnimalsListProps): {
	text: Format.FmtString;
	keyboard: Markup.Markup<InlineKeyboardMarkup>;
} {
	const { guardianships, page, totalPages } = props;
	const perPage = props.perPage ?? MY_ANIMALS_BOT_PAGE_SIZE;
	const start = (page - 1) * perPage;
	const slice = guardianships.slice(start, start + perPage);

	const text = buildTelegrafMessage`
${Format.bold('🐾 Ваши подопечные')}

Выберите подопечного, чтобы посмотреть карточку.
${Format.italic(totalPages > 1 ? `Страница ${page} из ${totalPages}` : '')}`;

	const animalButtons = slice.map(constructAnimalButton);
	const navRow = constructNavRow(page, totalPages);
	const keyboard = Markup.inlineKeyboard([...animalButtons, ...(navRow.length > 0 ? [navRow] : [])]);

	return { text, keyboard };
}

export const sendMyAnimalsListMessage = async (ctx: Context, props: IMyAnimalsListProps): Promise<void> => {
	const { text, keyboard } = buildMyAnimalsListContent(props);
	await ctx.reply(text, keyboard);
};
