import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PaymentsController } from './payments.controller';

@Module({
	imports: [CqrsModule],
	controllers: [PaymentsController]
})
export class PaymentsModule {}
