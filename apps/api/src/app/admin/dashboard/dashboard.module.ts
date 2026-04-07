import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AdminDashboardController } from './dashboard.controller';
import { GetAdminDashboardSummaryHandler } from './queries/get-admin-dashboard-summary/get-admin-dashboard-summary.handler';

@Module({
	imports: [CqrsModule],
	controllers: [AdminDashboardController],
	providers: [GetAdminDashboardSummaryHandler]
})
export class AdminDashboardModule {}
