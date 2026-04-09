import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BlacklistController } from './blacklist.controller';
import { BlacklistService } from './blacklist.service';
import { BlacklistRepository } from './repositories/blacklist.repository';
import { DrizzleBlacklistRepository } from './repositories/drizzle-blacklist.repository';
import { BanContactsHandler } from './commands/ban-contacts/ban-contacts.handler';
import { DeleteContactFromBlacklistHandler } from './commands/delete-contact-from-blacklist/delete-contact-from-blacklist.handler';

@Module({
	imports: [CqrsModule],
	controllers: [BlacklistController],
	exports: [BlacklistService],
	providers: [
		BanContactsHandler,
		DeleteContactFromBlacklistHandler,
		BlacklistService,
		{
			provide: BlacklistRepository,
			useClass: DrizzleBlacklistRepository
		}
	]
})
export class BlacklistModule {}
