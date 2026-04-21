import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PostMediaTypeEnum, PostVisibilityEnum } from '@pif/shared';
import { StorageService } from '@pif/storage';
import { Logger } from 'nestjs-pino';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf, TelegramError } from 'telegraf';
import { InputMediaPhoto, InputMediaVideo } from 'telegraf/typings/core/types/typegram';
import { AppUrlMapper } from '../core/mappers/app-url.mapper';
import { ISendAnimalNewPostPayload } from './interfaces/send-animal-new-post-payload.interface';
import { ISendGuardianshipCancelledPayload } from './interfaces/send-guardianship-cancelled-payload.interface';
import { buildAnimalPostCreatedMessage } from './messages/animal-post-created.message';
import { buildGuardianshipCancelledMessage } from './messages/guardianship-cancelled.message';

@Injectable()
export class TelegramBotService {
	constructor(
		@InjectBot() private readonly bot: Telegraf,
		private readonly config: ConfigService,
		private readonly storage: StorageService,
		private readonly logger: Logger
	) {}

	async sendMessage(chatId: string, message: string): Promise<boolean> {
		try {
			await this.bot.telegram.sendMessage(chatId, message);
			return true;
		} catch (error) {
			if (error instanceof TelegramError) {
				this.logger.error('Ошибка при отправке сообщения в телеграмм', error);
				return false;
			}
			throw error;
		}
	}

	async sendGuardianshipCancelledMessage(chatId: number, payload: ISendGuardianshipCancelledPayload): Promise<void> {
		const adminUsername = this.config.getOrThrow<string>('TELEGRAM_ADMIN_USERNAME');
		const { text, markup } = buildGuardianshipCancelledMessage({
			...payload,
			adminTelegramUsername: adminUsername
		});

		await this.bot.telegram.sendMessage(chatId, text, {
			link_preview_options: { is_disabled: true },
			...(markup ?? {})
		});
	}

	async sendAnimalNewPostMessage(chatId: number, payload: ISendAnimalNewPostPayload): Promise<void> {
		const baseUrl = this.config.getOrThrow<string>('APP_BASE_URL');
		const fullPostUrl = AppUrlMapper.getPostUrl(baseUrl, payload.postId);

		const { text, markup } = buildAnimalPostCreatedMessage({
			animalName: payload.animalName,
			postTitle: payload.postTitle,
			postBodyHtml: payload.postBodyHtml,
			fullPostUrl,
			isPrivate: payload.visibility === PostVisibilityEnum.PRIVATE,
			isHaveVideo: payload.media.some((m) => m.type === PostMediaTypeEnum.VIDEO)
		});

		const isCutText = markup != null;
		const media = await this.constructMediaGroup(isCutText, text, payload.media);

		if (media.length > 0) {
			await this.bot.telegram.sendMediaGroup(chatId, media);
		}

		if (isCutText || media.length == 0) {
			await this.bot.telegram.sendMessage(chatId, text, {
				parse_mode: 'HTML',
				link_preview_options: { is_disabled: true },
				...(markup ?? {})
			});
		}
	}

	async constructMediaGroup(
		isCutText: boolean,
		text: string,
		media: Array<{ type: PostMediaTypeEnum; storageKey: string }>
	): Promise<(InputMediaPhoto | InputMediaVideo)[]> {
		const s3Endpoint = this.config.getOrThrow<string>('S3_PUBLIC_ENDPOINT');
		const mediaGroup: (InputMediaPhoto | InputMediaVideo)[] = [];
		const handledMedia = await Promise.all(
			media.map(async (m) => ({
				...m,
				metadata: await this.storage.getMetadata(m.storageKey)
			}))
		);

		let isSettedCaption = false;
		for (const m of handledMedia) {
			const isVideo = m.type == PostMediaTypeEnum.VIDEO;
			if (isVideo && (!m.metadata.size || m.metadata.size >= 10 * 1024 * 1024)) {
				continue;
			}
			mediaGroup.push({
				type: isVideo ? 'video' : 'photo',
				media: !isVideo
					? { source: await this.storage.getObjectBuffer(m.storageKey) }
					: { url: s3Endpoint + '/' + m.storageKey },
				caption: !isCutText && !isSettedCaption ? text : undefined,
				parse_mode: !isCutText && !isSettedCaption ? 'HTML' : undefined
			});
			isSettedCaption = true;
		}
		return mediaGroup;
	}
}
