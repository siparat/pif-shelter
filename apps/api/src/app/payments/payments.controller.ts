import { Body, Controller, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaymentWebhookRequestDto, PaymentWebhookResponseDto, ReturnDto } from '@pif/contracts';
import { ProcessPaymentWebhookCommand } from '../guardianship/commands/process-payment-webhook/process-payment-webhook.command';

@ApiTags('Payments | Платежи')
@Controller('payments')
export class PaymentsController {
	constructor(private readonly commandBus: CommandBus) {}

	@ApiOperation({
		summary: 'Единый мок-вебхук платёжного провайдера',
		description:
			'Роутер мок-вебхука для всех платежных сценариев (опека/донаты). Legacy endpoint в guardianship сохранён для обратной совместимости.'
	})
	@ApiOkResponse({ description: 'Вебхук обработан', type: PaymentWebhookResponseDto })
	@Post('webhooks/payment')
	async paymentWebhook(@Body() dto: PaymentWebhookRequestDto): Promise<ReturnDto<typeof PaymentWebhookResponseDto>> {
		return this.commandBus.execute(new ProcessPaymentWebhookCommand(dto));
	}
}
