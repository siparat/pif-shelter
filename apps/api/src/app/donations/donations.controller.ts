import { Body, Controller, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
	CancelDonationSubscriptionByTokenRequestDto,
	CancelDonationSubscriptionByTokenResponseDto,
	CreateDonationSubscriptionRequestDto,
	CreateDonationSubscriptionResponseDto,
	CreateOneTimeDonationRequestDto,
	CreateOneTimeDonationResponseDto,
	ReturnDto
} from '@pif/contracts';
import { CancelDonationSubscriptionByTokenCommand } from './commands/cancel-donation-subscription-by-token/cancel-donation-subscription-by-token.command';
import { CreateDonationOneTimeCommand } from './commands/create-donation-one-time/create-donation-one-time.command';
import { CreateDonationSubscriptionCommand } from './commands/create-donation-subscription/create-donation-subscription.command';

@ApiTags('Donations | Пожертвования')
@Controller('donations')
export class DonationsController {
	constructor(private readonly commandBus: CommandBus) {}

	@ApiOperation({ summary: 'Создать разовый донат' })
	@ApiCreatedResponse({ description: 'Разовый донат создан', type: CreateOneTimeDonationResponseDto })
	@Post('one-time')
	async createOneTime(
		@Body() dto: CreateOneTimeDonationRequestDto
	): Promise<ReturnDto<typeof CreateOneTimeDonationResponseDto>> {
		return this.commandBus.execute(new CreateDonationOneTimeCommand(dto));
	}

	@ApiOperation({ summary: 'Создать донат-подписку' })
	@ApiCreatedResponse({
		description: 'Донат-подписка создана',
		type: CreateDonationSubscriptionResponseDto
	})
	@Post('subscription')
	async createSubscription(
		@Body() dto: CreateDonationSubscriptionRequestDto
	): Promise<ReturnDto<typeof CreateDonationSubscriptionResponseDto>> {
		return this.commandBus.execute(new CreateDonationSubscriptionCommand(dto));
	}

	@ApiOperation({ summary: 'Отменить донат-подписку по токену' })
	@ApiOkResponse({
		description: 'Донат-подписка отменена',
		type: CancelDonationSubscriptionByTokenResponseDto
	})
	@Post('subscription/cancel-by-token')
	async cancelSubscriptionByToken(
		@Body() dto: CancelDonationSubscriptionByTokenRequestDto
	): Promise<ReturnDto<typeof CancelDonationSubscriptionByTokenResponseDto>> {
		return this.commandBus.execute(new CancelDonationSubscriptionByTokenCommand(dto.token));
	}
}
