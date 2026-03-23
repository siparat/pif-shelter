import { Body, Controller, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
	CancelGuardianshipByTokenRequestDto,
	CancelGuardianshipByTokenResponseDto,
	CancelGuardianshipRequestDto,
	CancelGuardianshipResponseDto,
	GetGuardianshipByAnimalResponseDto,
	GetMyGaurdianshipsResponseDto,
	PaymentWebhookRequestDto,
	ReturnDto,
	StartGuardianshipAuthenticatedRequestDto,
	StartGuardianshipRequestDto,
	StartGuardianshipResponseDto
} from '@pif/contracts';
import { GuardianshipStatusEnum, UserRole } from '@pif/shared';
import { AuthGuard, Session } from '@thallesp/nestjs-better-auth';
import { ISession } from '../configs/auth.config';
import { Roles } from '../core/decorators/roles.decorator';
import { RoleGuard } from '../core/guards/role.guard';
import { TelegramUrlMapper } from '../core/mappers/telegram-url.mapper';
import { CancelGuardianshipByTokenCommand } from './commands/cancel-guardianship-by-token/cancel-guardianship-by-token.command';
import { CancelGuardianshipCommand } from './commands/cancel-guardianship/cancel-guardianship.command';
import type { ProcessPaymentWebhookResult } from './commands/process-payment-webhook/process-payment-webhook.command';
import { ProcessPaymentWebhookCommand } from './commands/process-payment-webhook/process-payment-webhook.command';
import { StartGuardianshipAsGuestCommand } from './commands/start-guardianship-as-guest/start-guardianship-as-guest.command';
import { StartGuardianshipCommand } from './commands/start-guardianship/start-guardianship.command';
import { GuardianshipNotFoundException } from './exceptions/guardianship-not-found.exception';
import { GetGuardianshipByAnimalQuery } from './queries/get-guardianship-by-animal/get-guardianship-by-animal.query';
import { GetMyGaurdianshipsQuery } from './queries/get-my-guardianships/get-my-guardianships.query';

@ApiTags('Guardianship | Опекунство')
@Controller('guardianships')
export class GuardianshipController {
	constructor(
		private readonly commandBus: CommandBus,
		private readonly queryBus: QueryBus,
		private readonly config: ConfigService
	) {}

	@ApiOperation({
		summary: 'Получить свои опекунства',
		description: 'Получить список своих активных опекунств'
	})
	@ApiCreatedResponse({ description: 'Опекунство создано, требуется оплата', type: GetMyGaurdianshipsResponseDto })
	@UseGuards(AuthGuard)
	@Get('my')
	async getMyGuardianships(
		@Session() { user: { id } }: ISession
	): Promise<ReturnDto<typeof GetMyGaurdianshipsResponseDto>> {
		return this.queryBus.execute(new GetMyGaurdianshipsQuery(id));
	}

	@ApiOperation({
		summary: 'Оформить опекунство (без авторизации)',
		description:
			'Заполните форму: если email или telegram уже зарегистрированы, вернётся 409 — войдите в аккаунт и используйте POST /guardianships/authenticated. Если пользователь новый — создаётся аккаунт и опекунство, возвращается ссылка на оплату.'
	})
	@ApiCreatedResponse({ description: 'Опекунство создано, требуется оплата', type: StartGuardianshipResponseDto })
	@Post()
	async start(@Body() dto: StartGuardianshipRequestDto): Promise<ReturnDto<typeof StartGuardianshipResponseDto>> {
		return this.commandBus.execute(new StartGuardianshipAsGuestCommand(dto));
	}

	@ApiOperation({
		summary: 'Оформить опекунство (авторизованный пользователь)',
		description:
			'Для пользователя, уже вошедшего в аккаунт. Достаточно передать animalId; имя, email и Telegram берутся из профиля (редактируются в личном кабинете).'
	})
	@ApiCreatedResponse({ description: 'Опекунство создано, требуется оплата', type: StartGuardianshipResponseDto })
	@UseGuards(AuthGuard)
	@Post('authenticated')
	async startAuthenticated(
		@Session() session: ISession,
		@Body() dto: StartGuardianshipAuthenticatedRequestDto
	): Promise<ReturnDto<typeof StartGuardianshipResponseDto>> {
		const { guardianshipId, paymentUrl, cancellationToken } = await this.commandBus.execute(
			new StartGuardianshipCommand(session.user.id, dto.animalId)
		);
		return { guardianshipId, paymentUrl, cancellationToken };
	}

	@ApiOperation({
		summary: 'Отменить опекунство',
		description: 'Отменяет существующее опекунство.'
	})
	@ApiOkResponse({ description: 'Опекунство отменено', type: CancelGuardianshipResponseDto })
	@UseGuards(AuthGuard, RoleGuard)
	@Roles([UserRole.ADMIN])
	@Post('cancel')
	async cancel(
		@Body() { guardianshipId, reason }: CancelGuardianshipRequestDto
	): Promise<ReturnDto<typeof CancelGuardianshipResponseDto>> {
		return this.commandBus.execute(new CancelGuardianshipCommand(guardianshipId, false, reason));
	}

	@ApiOperation({
		summary: 'Отменить опекунство по токену из письма',
		description: 'Публичный endpoint. Отменяет опекунство по токену из ссылки в письме. Не требует авторизации.'
	})
	@ApiOkResponse({ description: 'Опекунство отменено', type: CancelGuardianshipByTokenResponseDto })
	@Post('cancel-by-token')
	async cancelByToken(
		@Body() dto: CancelGuardianshipByTokenRequestDto
	): Promise<ReturnDto<typeof CancelGuardianshipByTokenResponseDto>> {
		return this.commandBus.execute(new CancelGuardianshipByTokenCommand(dto.token));
	}

	@ApiOperation({
		summary: 'Мок вебхука платёжного провайдера',
		description:
			'Имитирует вызов от платёжного сервиса. Для subscription.* обязателен subscriptionId; для payment.* — transactionId. Для subscription.succeeded и payment.succeeded дополнительно: providerPaymentId, grossAmount, feeAmount, netAmount (gross = fee + net), paidAt. События subscription: succeeded / failed / canceled. События разового платежа: payment.succeeded / payment.failed (маршрутизация донатов — в следующих задачах). Идемпотентно при повторных вызовах там, где реализовано.'
	})
	@ApiOkResponse({ description: 'Вебхук обработан' })
	@Post('webhooks/payment')
	async paymentWebhook(@Body() dto: PaymentWebhookRequestDto): Promise<ProcessPaymentWebhookResult> {
		return this.commandBus.execute(new ProcessPaymentWebhookCommand(dto));
	}

	@ApiOperation({
		summary: 'Получить опекунство по животному',
		description: 'Возвращает текущую запись опекунства для указанного животного.'
	})
	@ApiOkResponse({ description: 'Опекунство', type: GetGuardianshipByAnimalResponseDto })
	@Get('by-animal/:animalId')
	async getByAnimal(
		@Param('animalId', ParseUUIDPipe) animalId: string
	): Promise<ReturnDto<typeof GetGuardianshipByAnimalResponseDto>> {
		const result = await this.queryBus.execute(new GetGuardianshipByAnimalQuery(animalId));
		const animal = result.animal;
		const guardian = result.guardian;
		if (animal == null || guardian == null) {
			throw new GuardianshipNotFoundException();
		}
		const telegramBotLink =
			result.status === GuardianshipStatusEnum.ACTIVE && guardian.telegramBotLinkToken != null
				? TelegramUrlMapper.getTelegramBotLink(
						this.config.getOrThrow<string>('TELEGRAM_BOT_USERNAME'),
						guardian.telegramBotLinkToken
					)
				: undefined;
		return {
			...result,
			animal,
			guardian: {
				...guardian,
				createdAt: guardian.createdAt.toISOString(),
				updatedAt: guardian.updatedAt?.toISOString() || null,
				deletedAt: guardian.deletedAt?.toISOString() || null,
				telegramChatIdUpdatedAt: guardian.telegramChatIdUpdatedAt?.toISOString() || null
			},
			telegramBotLink
		};
	}
}
