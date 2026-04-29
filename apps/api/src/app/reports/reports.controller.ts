import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AllowAnonymous, AuthGuard } from '@thallesp/nestjs-better-auth';
import { ListPublicReportsByYearQueryDto, ListPublicReportsByYearResponseDto, ReturnData } from '../core/dto';
import { RoleGuard } from '../core/guards/role.guard';
import { ListPublicReportsByYearQuery } from './queries/list-public-reports-by-year/list-public-reports-by-year.query';

@ApiTags('Reports | Публичные отчёты')
@UseGuards(AuthGuard, RoleGuard)
@Controller('reports')
export class ReportsController {
	constructor(private readonly queryBus: QueryBus) {}

	@ApiOperation({ summary: 'Список публичных отчётов за год' })
	@ApiOkResponse({ description: 'Список отчётов', type: ListPublicReportsByYearResponseDto })
	@AllowAnonymous()
	@Get('public')
	async listByYear(
		@Query() dto: ListPublicReportsByYearQueryDto
	): Promise<ReturnData<typeof ListPublicReportsByYearResponseDto>> {
		return this.queryBus.execute(new ListPublicReportsByYearQuery(dto));
	}
}
