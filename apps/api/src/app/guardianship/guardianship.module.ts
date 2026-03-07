import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PaymentModule } from '@pif/payment';
import { GUARDIANSHIP_QUEUE_NAME } from '@pif/shared';
import { AnimalsModule } from '../animals/animals.module';
import { UsersModule } from '../users/users.module';
import { CancelGuardianshipByTokenHandler } from './commands/cancel-guardianship-by-token/cancel-guardianship-by-token.handler';
import { CancelGuardianshipHandler } from './commands/cancel-guardianship/cancel-guardianship.handler';
import { CancelGuardianshipPolicy } from './commands/cancel-guardianship/cancel-guardianship.policy';
import { ProcessPaymentWebhookHandler } from './commands/process-payment-webhook/process-payment-webhook.handler';
import { StartGuardianshipAsGuestHandler } from './commands/start-guardianship-as-guest/start-guardianship-as-guest.handler';
import { StartGuardianshipHandler } from './commands/start-guardianship/start-guardianship.handler';
import { StartGuardianshipPolicy } from './commands/start-guardianship/start-guardianship.policy';
import { GuardianRegisteredHandler } from './events/guardian-registered/guardian-registered.handler';
import { SendGuardianshipCancelLinkEmailHandler } from './events/guardianship-activated/send-guardianship-cancel-link-email.handler';
import { RemoveReservationJobOnActivationHandler } from './events/guardianship-activated/remove-reservation-job-on-activation.handler';
import { GuardianshipCancelledHandler } from './events/guardianship-cancelled/guardianship-cancelled.handler';
import { SendGuardianshipCancelledEmailHandler } from './events/guardianship-cancelled/send-guardianship-cancelled-email.handler';
import { GuardianshipCreatedHandler } from './events/guardianship-created/guardianship-created.handler';
import { GuardianshipController } from './guardianship.controller';
import { GetGuardianshipByAnimalHandler } from './queries/get-guardianship-by-animal/get-guardianship-by-animal.handler';
import { DrizzleGuardianshipRepository } from './repositories/drizzle-guardianship.repository';
import { GuardianshipRepository } from './repositories/guardianship.repository';
import { GuardianshipReservationHandler } from './events/guardianship-created/guardianship-reservation.handler';
import { GuardianshipProcessor } from './guardianship.processor';

@Module({
	imports: [
		BullModule.registerQueue({ name: GUARDIANSHIP_QUEUE_NAME }),
		CqrsModule,
		AnimalsModule,
		PaymentModule,
		UsersModule
	],
	controllers: [GuardianshipController],
	providers: [
		StartGuardianshipHandler,
		StartGuardianshipAsGuestHandler,
		StartGuardianshipPolicy,
		CancelGuardianshipHandler,
		CancelGuardianshipByTokenHandler,
		ProcessPaymentWebhookHandler,
		SendGuardianshipCancelledEmailHandler,
		CancelGuardianshipPolicy,
		GetGuardianshipByAnimalHandler,
		GuardianshipCreatedHandler,
		GuardianshipCancelledHandler,
		GuardianRegisteredHandler,
		SendGuardianshipCancelLinkEmailHandler,
		RemoveReservationJobOnActivationHandler,
		GuardianshipReservationHandler,
		GuardianshipProcessor,
		{
			provide: GuardianshipRepository,
			useClass: DrizzleGuardianshipRepository
		}
	]
})
export class GuardianshipModule {}
