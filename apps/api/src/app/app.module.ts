import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ConfigModule } from '@pif/config';
import { DatabaseModule } from '@pif/database';
import { getDatabaseConfig } from './configs/database.config';

@Module({
	imports: [CqrsModule.forRoot(), ConfigModule, DatabaseModule.forRootAsync(getDatabaseConfig())]
})
export class AppModule {}
