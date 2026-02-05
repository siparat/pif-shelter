import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './core/config/config.module';

@Module({
	imports: [CqrsModule.forRoot(), ConfigModule],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
