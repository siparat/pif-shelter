import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PaymentModule } from '@pif/payment';
import { AnimalsModule } from '../animals/animals.module';
import { CancelGuardianshipHandler } from './commands/cancel-guardianship/cancel-guardianship.handler';
import { CancelGuardianshipPolicy } from './commands/cancel-guardianship/cancel-guardianship.policy';
import { StartGuardianshipHandler } from './commands/start-guardianship/start-guardianship.handler';
import { StartGuardianshipPolicy } from './commands/start-guardianship/start-guardianship.policy';
import { GuardianshipCreatedHandler } from './events/guardianship-created/guardianship-created.handler';
import { GuardianshipCancelledHandler } from './events/guardianship-cancelled/guardianship-cancelled.handler';
import { GuardianshipController } from './guardianship.controller';
import { GetGuardianshipByAnimalHandler } from './queries/get-guardianship-by-animal/get-guardianship-by-animal.handler';
import { DrizzleGuardianshipRepository } from './repositories/drizzle-guardianship.repository';
import { GuardianshipRepository } from './repositories/guardianship.repository';

@Module({
	imports: [CqrsModule, AnimalsModule, PaymentModule],
	controllers: [GuardianshipController],
	providers: [
		StartGuardianshipHandler,
		StartGuardianshipPolicy,
		CancelGuardianshipHandler,
		CancelGuardianshipPolicy,
		GetGuardianshipByAnimalHandler,
		GuardianshipCreatedHandler,
		GuardianshipCancelledHandler,
		{
			provide: GuardianshipRepository,
			useClass: DrizzleGuardianshipRepository
		}
	]
})
export class GuardianshipModule {}
