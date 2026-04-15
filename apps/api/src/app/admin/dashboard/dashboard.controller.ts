import { Controller, Get, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@pif/shared';
import { AuthGuard, Session } from '@thallesp/nestjs-better-auth';
import { GetAdminDashboardSummaryResponseDto, ReturnData } from '../../core/dto';
import { ISession } from '../../configs/auth.config';
import { Roles } from '../../core/decorators/roles.decorator';
import { RoleGuard } from '../../core/guards/role.guard';
import { GetAdminDashboardSummaryQuery } from './queries/get-admin-dashboard-summary/get-admin-dashboard-summary.query';

@ApiTags('Admin Dashboard | Дашборд')
@UseGuards(AuthGuard, RoleGuard)
@Roles([UserRole.VOLUNTEER, UserRole.SENIOR_VOLUNTEER, UserRole.ADMIN])
@Controller('admin/dashboard')
export class AdminDashboardController {
	constructor(private readonly queryBus: QueryBus) {}

	@ApiOperation({ summary: 'Сводка дашборда админки' })
	@ApiOkResponse({ type: GetAdminDashboardSummaryResponseDto })
	@Get('summary')
	async getSummary(@Session() { user }: ISession): Promise<ReturnData<typeof GetAdminDashboardSummaryResponseDto>> {
		return this.queryBus.execute(new GetAdminDashboardSummaryQuery(user.id));
	}
}
