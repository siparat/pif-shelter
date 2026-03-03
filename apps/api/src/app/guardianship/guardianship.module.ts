import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PaymentModule } from '@pif/payment';
import { AnimalsModule } from '../animals/animals.module';
import { UsersModule } from '../users/users.module';
import { CancelGuardianshipHandler } from './commands/cancel-guardianship/cancel-guardianship.handler';
import { CancelGuardianshipPolicy } from './commands/cancel-guardianship/cancel-guardianship.policy';
import { CancelGuardianshipByTokenHandler } from './commands/cancel-guardianship-by-token/cancel-guardianship-by-token.handler';
import { StartGuardianshipAsGuestHandler } from './commands/start-guardianship-as-guest/start-guardianship-as-guest.handler';
import { StartGuardianshipHandler } from './commands/start-guardianship/start-guardianship.handler';
import { StartGuardianshipPolicy } from './commands/start-guardianship/start-guardianship.policy';
import { GuardianshipCreatedHandler } from './events/guardianship-created/guardianship-created.handler';
import { GuardianshipCancelledHandler } from './events/guardianship-cancelled/guardianship-cancelled.handler';
import { SendGuardianshipCancelLinkEmailHandler } from './events/guardianship-activated/send-guardianship-cancel-link-email.handler';
import { GuardianshipController } from './guardianship.controller';
import { GetGuardianshipByAnimalHandler } from './queries/get-guardianship-by-animal/get-guardianship-by-animal.handler';
import { DrizzleGuardianshipRepository } from './repositories/drizzle-guardianship.repository';
import { GuardianshipRepository } from './repositories/guardianship.repository';
import { GuardianRegisteredHandler } from './events/guardian-registered/guardian-registered.handler';

@Module({
	imports: [CqrsModule, AnimalsModule, PaymentModule, UsersModule],
	controllers: [GuardianshipController],
	providers: [
		StartGuardianshipHandler,
		StartGuardianshipAsGuestHandler,
		StartGuardianshipPolicy,
		CancelGuardianshipHandler,
		CancelGuardianshipByTokenHandler,
		CancelGuardianshipPolicy,
		GetGuardianshipByAnimalHandler,
		GuardianshipCreatedHandler,
		GuardianshipCancelledHandler,
		GuardianRegisteredHandler,
		SendGuardianshipCancelLinkEmailHandler,
		{
			provide: GuardianshipRepository,
			useClass: DrizzleGuardianshipRepository
		}
	]
})
export class GuardianshipModule {}
