import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
	CancelDonationSubscriptionRequestDto,
	CreateDonationSubscriptionRequestDto,
	CreateOneTimeDonationRequestDto
} from '@pif/contracts';
import { AuthGuard } from '@thallesp/nestjs-better-auth';
import { CancelDonationSubscriptionCommand } from './commands/cancel-donation-subscription/cancel-donation-subscription.command';
import { CreateDonationOneTimeCommand } from './commands/create-donation-one-time/create-donation-one-time.command';
import { CreateDonationSubscriptionCommand } from './commands/create-donation-subscription/create-donation-subscription.command';

@ApiTags('Donations | Пожертвования')
@Controller('donations')
export class DonationsController {
	constructor(private readonly commandBus: CommandBus) {}

	@ApiOperation({ summary: 'Создать разовый донат' })
	@Post('one-time')
	async createOneTime(
		@Body() dto: CreateOneTimeDonationRequestDto
	): Promise<{ paymentUrl: string; transactionId: string }> {
		return this.commandBus.execute(new CreateDonationOneTimeCommand(dto));
	}

	@ApiOperation({ summary: 'Создать донат-подписку' })
	@Post('subscription')
	async createSubscription(
		@Body() dto: CreateDonationSubscriptionRequestDto
	): Promise<{ paymentUrl: string; subscriptionId: string }> {
		return this.commandBus.execute(new CreateDonationSubscriptionCommand(dto));
	}

	@ApiOperation({ summary: 'Отменить донат-подписку' })
	@UseGuards(AuthGuard)
	@Post('subscription/cancel')
	async cancelSubscription(@Body() dto: CancelDonationSubscriptionRequestDto): Promise<{ cancelled: boolean }> {
		return this.commandBus.execute(new CancelDonationSubscriptionCommand(dto));
	}
}
