import { animalLabels, animals } from '@pif/database';
import { AnimalGenderEnum, AnimalSpeciesEnum, AnimalStatusNames, buildTelegrafMessage, pluralize } from '@pif/shared';
import dayjs from 'dayjs';
import { Context, Format, Markup } from 'telegraf';
import { TelegramUrlMapper } from '../../core/mappers/telegram-url.mapper';

const MAX_DESCRIPTION_LENGTH = 500;

export interface IMyAnimalCardAnimal {
	name: string;
	species: string;
	gender: string;
	birthDate: Date;
	description: string | null;
	status: string;
}

export interface IMyAnimalCardCurator {
	telegram: string;
	name: string;
}

export interface IMyAnimalCardProps {
	animal: typeof animals.$inferSelect & { labels: (typeof animalLabels.$inferSelect)[] };
	curator: IMyAnimalCardCurator | null;
	avatarPhotoUrl?: string;
}

function buildCardCaption({ animal, curator }: IMyAnimalCardProps): Format.FmtString {
	const year = dayjs().diff(dayjs(animal.birthDate), 'year');
	const desc = animal.description
		? animal.description.length > MAX_DESCRIPTION_LENGTH
			? `${animal.description.slice(0, MAX_DESCRIPTION_LENGTH)}…`
			: animal.description
		: '';

	const text = buildTelegrafMessage`
${animal.species == AnimalSpeciesEnum.DOG ? '🐶' : '🐱'} ${animal.gender === AnimalGenderEnum.MALE ? '♂' : '♀'} ${Format.bold(animal.name)}

${Format.bold('Возраст:')} ${year.toString()} ${pluralize(year, ['год', 'года', 'лет'])}
${Format.bold('Статус:')} ${AnimalStatusNames[animal.status as keyof typeof AnimalStatusNames] ?? animal.status}
${Format.bold('Стоимость опекунства:')} ${animal.costOfGuardianship ? Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(animal.costOfGuardianship) : '—'}
${Format.bold('Куратор:')} ${curator?.name ?? '—'}
${Format.italic(animal.labels.map((label) => `🏷️ ${label.name}`).join(', '))}

${Format.italic(desc)}

${curator?.telegram ? Format.italic('Связаться с куратором — кнопка ниже') : ''}
	`;

	return text;
}

export const sendMyAnimalCardMessage = async (ctx: Context, props: IMyAnimalCardProps): Promise<void> => {
	const caption = buildCardCaption(props);
	const buttons: ReturnType<typeof Markup.button.url>[] = [];
	if (props.curator?.telegram) {
		buttons.push(
			Markup.button.url('💬 Связаться с волонтером', TelegramUrlMapper.getUserUrl(props.curator.telegram))
		);
	}
	const replyMarkup = buttons.length > 0 ? Markup.inlineKeyboard(buttons) : undefined;

	if (props.avatarPhotoUrl) {
		await ctx.replyWithPhoto(props.avatarPhotoUrl, {
			caption,

			...replyMarkup
		});
	} else {
		await ctx.reply(caption, { ...replyMarkup });
	}
};
