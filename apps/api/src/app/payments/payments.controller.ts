import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaymentWebhookRequestDto, PaymentWebhookResponseDto, ReturnDto } from '@pif/contracts';
import { ProcessPaymentWebhookCommand } from '../guardianship/commands/process-payment-webhook/process-payment-webhook.command';
import { ProcessDonationWebhookOneTimeCommand } from '../donations/commands/process-donation-webhook-one-time/process-donation-webhook-one-time.command';
import { ProcessDonationWebhookSubscriptionCommand } from '../donations/commands/process-donation-webhook-subscription/process-donation-webhook-subscription.command';
import { PaymentWebhookEvent } from '@pif/payment';

@ApiTags('Payments | Платежи')
@Controller('payments')
export class PaymentsController {
	constructor(private readonly commandBus: CommandBus) {}

	@ApiOperation({
		summary: 'Мок вебхук платёжного провайдера (опекунство)',
		description:
			'Вебхук только для сценариев опекунства (subscription.succeeded/failed/canceled). Для донатов используются отдельные endpoint-ы.'
	})
	@ApiOkResponse({ description: 'Вебхук обработан', type: PaymentWebhookResponseDto })
	@Post('webhooks/guardianship')
	async guardianshipPaymentWebhook(
		@Body() dto: PaymentWebhookRequestDto
	): Promise<ReturnDto<typeof PaymentWebhookResponseDto>> {
		return this.commandBus.execute(new ProcessPaymentWebhookCommand(dto));
	}

	@ApiOperation({
		summary: 'Мок вебхук платёжного провайдера (разовые донаты)',
		description: 'Вебхук только для payment.succeeded/payment.failed по transactionId.'
	})
	@ApiOkResponse({ description: 'Вебхук обработан', type: PaymentWebhookResponseDto })
	@Post('webhooks/donations/one-time')
	async donationOneTimePaymentWebhook(
		@Body() dto: PaymentWebhookRequestDto
	): Promise<ReturnDto<typeof PaymentWebhookResponseDto>> {
		if (dto.event !== PaymentWebhookEvent.PAYMENT_SUCCEEDED && dto.event !== PaymentWebhookEvent.PAYMENT_FAILED) {
			throw new BadRequestException('Invalid event for donations one-time webhook');
		}
		return this.commandBus.execute(new ProcessDonationWebhookOneTimeCommand(dto));
	}

	@ApiOperation({
		summary: 'Мок вебхук платёжного провайдера (донат-подписка)',
		description: 'Вебхук только для subscription.succeeded/failed/canceled по subscriptionId.'
	})
	@ApiOkResponse({ description: 'Вебхук обработан', type: PaymentWebhookResponseDto })
	@Post('webhooks/donations/subscription')
	async donationSubscriptionPaymentWebhook(
		@Body() dto: PaymentWebhookRequestDto
	): Promise<ReturnDto<typeof PaymentWebhookResponseDto>> {
		if (
			dto.event !== PaymentWebhookEvent.SUBSCRIPTION_SUCCEEDED &&
			dto.event !== PaymentWebhookEvent.SUBSCRIPTION_FAILED &&
			dto.event !== PaymentWebhookEvent.SUBSCRIPTION_CANCELED
		) {
			throw new BadRequestException('Invalid event for donations subscription webhook');
		}
		return this.commandBus.execute(new ProcessDonationWebhookSubscriptionCommand(dto));
	}
}
