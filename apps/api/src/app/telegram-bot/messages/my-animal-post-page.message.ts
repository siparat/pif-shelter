import { escapeHtml, GuardianshipBotCallback, LIMIT_MESSAGE_LENGTH } from '@pif/shared';
import dayjs from 'dayjs';
import { Markup } from 'telegraf';
import type { InlineKeyboardMarkup } from 'telegraf/typings/core/types/typegram';
import { truncateHtmlPreservingTagsByTextLength } from '../utils/truncate-html';

export interface IMyAnimalPostPagePayload {
	animalId: string;
	animalName: string;
	postId: string;
	postTitle: string;
	postBodyHtml: string;
	postCreatedAt: string;
	position: number;
	totalPosts: number;
	fullPostUrl: string;
}

export function buildMyAnimalPostPageMessage(payload: IMyAnimalPostPagePayload): {
	text: string;
	keyboard: Markup.Markup<InlineKeyboardMarkup>;
} {
	const { html: truncatedBodyHtml, isTruncated } = truncateHtmlPreservingTagsByTextLength(
		payload.postBodyHtml,
		LIMIT_MESSAGE_LENGTH - 512
	);

	const createdAt = dayjs(payload.postCreatedAt).format('DD.MM.YYYY');
	const text = [
		`<b>🦴 ${escapeHtml(payload.animalName)}</b>`,
		`<b>📣 ${escapeHtml(payload.postTitle)}</b>`,
		`<i>📅 ${escapeHtml(createdAt)}</i>`,
		`<i>Пост ${payload.position} из ${payload.totalPosts}</i>`,
		'',
		truncatedBodyHtml
	].join('\n');

	const maxNumberButtons = 6;
	const totalPosts = payload.totalPosts;
	const position = payload.position;
	const prefix = GuardianshipBotCallback.MY_ANIMALS.POSTS_PREFIX;
	const cardPrefix = GuardianshipBotCallback.MY_ANIMALS.CARD_PREFIX;

	const navigationButtons: ReturnType<typeof Markup.button.callback>[] = [];

	const backCallbackData =
		position > 1 ? `${prefix}${payload.animalId}:${position - 1}` : `${cardPrefix}${payload.animalId}`;
	navigationButtons.push(Markup.button.callback('◀', backCallbackData));

	const numberButtonsTotal = Math.min(maxNumberButtons, totalPosts);

	let windowStart = 1;
	if (totalPosts > maxNumberButtons) {
		const maxWindowStart = totalPosts - (maxNumberButtons - 1);
		windowStart = Math.max(1, Math.min(position - 2, maxWindowStart));
	}

	const windowEnd = Math.min(totalPosts, windowStart + numberButtonsTotal - 1);
	for (let i = windowStart; i <= windowEnd; i += 1) {
		const label = i === position ? `(${i})` : i.toString();
		navigationButtons.push(Markup.button.callback(label, `${prefix}${payload.animalId}:${i}`));
	}

	if (position < totalPosts) {
		navigationButtons.push(Markup.button.callback('▶', `${prefix}${payload.animalId}:${position + 1}`));
	}

	const rows = [navigationButtons, ...(isTruncated ? [[Markup.button.url('Читать весь', payload.fullPostUrl)]] : [])];

	return {
		text,
		keyboard: Markup.inlineKeyboard(rows)
	};
}
