import { LIMIT_MESSAGE_LENGTH, escapeHtml } from '@pif/shared';
import { Markup } from 'telegraf';
import { truncateHtmlPreservingTagsByTextLength } from '../utils/truncate-html';

export interface IAnimalPostCreatedMessagePayload {
	animalName: string;
	postTitle: string;
	postBodyHtml: string;
	fullPostUrl: string;
	isPrivate: boolean;
	isHaveVideo: boolean;
}

export function buildAnimalPostCreatedMessage(payload: IAnimalPostCreatedMessagePayload): {
	text: string;
	markup?: ReturnType<typeof Markup.inlineKeyboard>;
} {
	const { html: truncatedBodyHtml, isTruncated } = truncateHtmlPreservingTagsByTextLength(
		payload.postBodyHtml,
		LIMIT_MESSAGE_LENGTH - 512
	);

	const text = [
		`<b>🦴 ${escapeHtml(payload.animalName)}</b>`,
		`<b>📣 ${escapeHtml(payload.postTitle)}</b>`,
		'',
		`${payload.isPrivate ? '🔒 Приватный пост' : '🔓 Публичный пост'}`,
		`${payload.isHaveVideo ? '🎥 Пост содержит видео, если оно не отображается, нажмите на кнопку ниже\n' : ''}`,
		truncatedBodyHtml
	].join('\n');

	return {
		text,
		markup:
			isTruncated || payload.isHaveVideo
				? Markup.inlineKeyboard([Markup.button.url('💬 Читать весь пост', payload.fullPostUrl)])
				: undefined
	};
}
