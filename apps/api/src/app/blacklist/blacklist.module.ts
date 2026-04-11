import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BLACKLIST_QUEUE_NAME } from '@pif/shared';
import { BlacklistController } from './blacklist.controller';
import { BlacklistService } from './blacklist.service';
import { BanContactsHandler } from './commands/ban-contacts/ban-contacts.handler';
import { DeleteContactFromBlacklistHandler } from './commands/delete-contact-from-blacklist/delete-contact-from-blacklist.handler';
import { SuspectContactsHandler } from './commands/suspect-contacts/suspect-contacts.handler';
import { BlacklistRepository } from './repositories/blacklist.repository';
import { DrizzleBlacklistRepository } from './repositories/drizzle-blacklist.repository';
import { BlacklistScheduler } from './blacklist.scheduler';
import { BlacklistProcessor } from './blacklist.processor';
import { ApproveContactsHandler } from './commands/approve-contacts/approve-contacts.handler';

@Module({
	imports: [CqrsModule, BullModule.registerQueue({ name: BLACKLIST_QUEUE_NAME })],
	controllers: [BlacklistController],
	exports: [BlacklistService],
	providers: [
		BlacklistProcessor,
		BlacklistScheduler,
		BanContactsHandler,
		SuspectContactsHandler,
		DeleteContactFromBlacklistHandler,
		ApproveContactsHandler,
		BlacklistService,
		{
			provide: BlacklistRepository,
			useClass: DrizzleBlacklistRepository
		}
	]
})
export class BlacklistModule {}
