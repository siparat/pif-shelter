import { MailerModule } from '@nestjs-modules/mailer';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@pif/cache';
import { ConfigModule } from '@pif/config';
import { DatabaseModule } from '@pif/database';
import { StorageModule } from '@pif/storage';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { ClsModule } from 'nestjs-cls';
import { LoggerModule } from 'nestjs-pino';
import { AdminUsersModule } from './admin/users/users.module';
import { AnimalsModule } from './animals/animals.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { getAuthConfig } from './configs/auth.config';
import { getCacheConfig } from './configs/cache.config';
import { getClsConfig } from './configs/cls.config';
import { getDatabaseConfig } from './configs/database.config';
import { getLoggerConfig } from './configs/logger.config';
import { getMailerConfig } from './configs/mailer.config';
import { getQueueConfig } from './configs/queue.config';
import { getStorageConfig } from './configs/storage.config';
import { getTelegrafConfig } from './configs/telegraf.config';
import { getThrottlerConfig } from './configs/throttler.config';
import { CoreModule } from './core/core.module';
import { BetterAuthExceptionsFilter } from './core/filters/better-auth-exceptions.filter';
import { GlobalExceptionsFilter } from './core/filters/global-exceptions.filter';
import { ThrottlerExceptionFilter } from './core/filters/throttler-exception.filter';
import { ZodValidationExceptionFilter } from './core/filters/zod-exception.filter';
import { HttpOnlyThrottlerGuard } from './core/guards/http-only-throttler.guard';
import { HealthModule } from './core/health/health.module';
import { SeedModule } from './core/seed/seed.module';
import { DonationsModule } from './donations/donations.module';
import { FinanceModule } from './finance/finance.module';
import { GuardianshipModule } from './guardianship/guardianship.module';
import { MediaModule } from './media/media.module';
import { MeetingRequestsModule } from './meeting-requests/meeting-requests.module';
import { PaymentsModule } from './payments/payments.module';
import { PostsModule } from './posts/posts.module';
import { TelegramBotModule } from './telegram-bot/telegram-bot.module';
import { WishlistModule } from './wishlist/wishlist.module';

@Module({
	imports: [
		CqrsModule.forRoot(),
		ThrottlerModule.forRoot(getThrottlerConfig()),
		ClsModule.forRoot(getClsConfig()),
		LoggerModule.forRootAsync(getLoggerConfig()),
		CacheModule.forRootAsync(getCacheConfig()),
		DatabaseModule.forRootAsync(getDatabaseConfig()),
		AuthModule.forRootAsync(getAuthConfig()),
		MailerModule.forRootAsync(getMailerConfig()),
		StorageModule.forRootAsync(getStorageConfig()),
		BullModule.forRootAsync(getQueueConfig()),
		TelegramBotModule.forRootAsync(getTelegrafConfig()),
		ConfigModule,
		CoreModule,
		AnimalsModule,
		DonationsModule,
		FinanceModule,
		GuardianshipModule,
		AdminUsersModule,
		MediaModule,
		PaymentsModule,
		PostsModule,
		CampaignsModule,
		WishlistModule,
		MeetingRequestsModule,
		HealthModule,
		SeedModule
	],
	providers: [
		{
			provide: APP_GUARD,
			useClass: HttpOnlyThrottlerGuard
		},
		{
			provide: APP_FILTER,
			useClass: GlobalExceptionsFilter
		},
		{
			provide: APP_FILTER,
			useClass: ZodValidationExceptionFilter
		},
		{
			provide: APP_FILTER,
			useClass: ThrottlerExceptionFilter
		},
		{
			provide: APP_FILTER,
			useClass: BetterAuthExceptionsFilter
		}
	]
})
export class AppModule {}
