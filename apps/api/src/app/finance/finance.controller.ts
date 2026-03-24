import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
	CreateManualExpenseRequestDto,
	CreateManualExpenseResponseDto,
	DeleteManualExpenseResponseDto,
	ListLedgerForMonthQueryDto,
	ListLedgerForMonthResponseDto,
	PublicLedgerReportQueryDto,
	PublicLedgerReportResponseDto,
	ReturnDto,
	UpdateManualExpenseRequestDto,
	UpdateManualExpenseResponseDto
} from '@pif/contracts';
import { UserRole } from '@pif/shared';
import { AuthGuard, Session } from '@thallesp/nestjs-better-auth';
import { ISession } from '../configs/auth.config';
import { Roles } from '../core/decorators/roles.decorator';
import { RoleGuard } from '../core/guards/role.guard';
import { CreateManualExpenseCommand } from './commands/create-manual-expense/create-manual-expense.command';
import { DeleteManualExpenseCommand } from './commands/delete-manual-expense/delete-manual-expense.command';
import { UpdateManualExpenseCommand } from './commands/update-manual-expense/update-manual-expense.command';
import { GetMonthlyLedgerQuery } from './queries/get-monthly-ledger/get-monthly-ledger.query';
import { GetPublicMonthlyLedgerQuery } from './queries/get-public-monthly-ledger/get-public-monthly-ledger.query';

@ApiTags('Finance | Книга и расходы')
@Controller('finance')
export class FinanceController {
	constructor(
		private readonly commandBus: CommandBus,
		private readonly queryBus: QueryBus
	) {}

	@ApiOperation({ summary: 'Создать ручной расход' })
	@ApiCreatedResponse({ type: CreateManualExpenseResponseDto })
	@UseGuards(AuthGuard, RoleGuard)
	@Roles([UserRole.ADMIN, UserRole.SENIOR_VOLUNTEER, UserRole.VOLUNTEER])
	@Post('manual-expenses')
	async createManualExpense(
		@Body() dto: CreateManualExpenseRequestDto,
		@Session() session: ISession
	): Promise<ReturnDto<typeof CreateManualExpenseResponseDto>> {
		return this.commandBus.execute(new CreateManualExpenseCommand(dto, session.user.id));
	}

	@ApiOperation({ summary: 'Обновить ручной расход' })
	@ApiOkResponse({ type: UpdateManualExpenseResponseDto })
	@UseGuards(AuthGuard, RoleGuard)
	@Roles([UserRole.ADMIN, UserRole.SENIOR_VOLUNTEER, UserRole.VOLUNTEER])
	@Patch('manual-expenses')
	async updateManualExpense(
		@Body() dto: UpdateManualExpenseRequestDto,
		@Session() session: ISession
	): Promise<ReturnDto<typeof UpdateManualExpenseResponseDto>> {
		return this.commandBus.execute(new UpdateManualExpenseCommand(dto, session.user.id, session.user.role));
	}

	@ApiOperation({ summary: 'Удалить ручной расход' })
	@ApiOkResponse({ type: DeleteManualExpenseResponseDto })
	@UseGuards(AuthGuard, RoleGuard)
	@Roles([UserRole.ADMIN, UserRole.SENIOR_VOLUNTEER, UserRole.VOLUNTEER])
	@Delete('manual-expenses/:id')
	async deleteManualExpense(
		@Param('id', ParseUUIDPipe) id: string,
		@Session() session: ISession
	): Promise<ReturnDto<typeof DeleteManualExpenseResponseDto>> {
		return this.commandBus.execute(new DeleteManualExpenseCommand(id, session.user.id, session.user.role));
	}

	@ApiOperation({ summary: 'Внутренний список проводок за месяц' })
	@ApiOkResponse({ type: ListLedgerForMonthResponseDto })
	@UseGuards(AuthGuard, RoleGuard)
	@Roles([UserRole.ADMIN, UserRole.SENIOR_VOLUNTEER, UserRole.VOLUNTEER])
	@Get('monthly-ledger')
	async getMonthlyLedger(
		@Query() dto: ListLedgerForMonthQueryDto
	): Promise<ReturnDto<typeof ListLedgerForMonthResponseDto>> {
		return this.queryBus.execute(new GetMonthlyLedgerQuery(dto));
	}

	@ApiOperation({ summary: 'Публичный отчет проводок за месяц' })
	@ApiOkResponse({ type: PublicLedgerReportResponseDto })
	@Get('public/monthly-ledger')
	async getPublicMonthlyLedger(
		@Query() dto: PublicLedgerReportQueryDto
	): Promise<ReturnDto<typeof PublicLedgerReportResponseDto>> {
		return this.queryBus.execute(new GetPublicMonthlyLedgerQuery(dto));
	}
}
