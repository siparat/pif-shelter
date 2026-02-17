import { Module } from '@nestjs/common';
import { AdminUsersController } from './users.controller';

@Module({
	controllers: [AdminUsersController]
})
export class AdminUsersModule {}
