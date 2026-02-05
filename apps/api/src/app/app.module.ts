import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ConfigModule } from './core/config/config.module';

@Module({
	imports: [CqrsModule.forRoot(), ConfigModule]
})
export class AppModule {}
