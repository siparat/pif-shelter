import { Body, Controller, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
	CancelGuardianshipRequestDto,
	CancelGuardianshipResponseDto,
	GetGuardianshipByAnimalResponseDto,
	ReturnDto,
	StartGuardianshipRequestDto,
	StartGuardianshipResponseDto
} from '@pif/contracts';
import { UserRole } from '@pif/shared';
import { AuthGuard, Session } from '@thallesp/nestjs-better-auth';
import { ISession } from '../configs/auth.config';
import { Roles } from '../core/decorators/roles.decorator';
import { RoleGuard } from '../core/guards/role.guard';
import { CancelGuardianshipCommand } from './commands/cancel-guardianship/cancel-guardianship.command';
import { StartGuardianshipCommand } from './commands/start-guardianship/start-guardianship.command';
import { GuardianshipNotFoundException } from './exceptions/guardianship-not-found.exception';
import { GetGuardianshipByAnimalQuery } from './queries/get-guardianship-by-animal/get-guardianship-by-animal.query';

@ApiTags('Guardianship | Опекунство')
@Controller('guardianships')
export class GuardianshipController {
	constructor(
		private readonly commandBus: CommandBus,
		private readonly queryBus: QueryBus
	) {}

	@ApiOperation({
		summary: 'Оформить опекунство',
		description: 'Создаёт pending-запись опекунства и возвращает ссылку на платёжную страницу.'
	})
	@ApiCreatedResponse({ description: 'Опекунство создано, требуется оплата', type: StartGuardianshipResponseDto })
	@UseGuards(AuthGuard)
	@Post()
	async start(
		@Session() session: ISession,
		@Body() dto: StartGuardianshipRequestDto
	): Promise<ReturnDto<typeof StartGuardianshipResponseDto>> {
		const userId = session.user.id;
		const { guardianshipId, paymentUrl } = await this.commandBus.execute(new StartGuardianshipCommand(userId, dto));

		return { guardianshipId, paymentUrl };
	}

	@ApiOperation({
		summary: 'Отменить опекунство',
		description: 'Отменяет существующее опекунство.'
	})
	@ApiOkResponse({ description: 'Опекунство отменено', type: CancelGuardianshipResponseDto })
	@UseGuards(AuthGuard, RoleGuard)
	@Roles([UserRole.ADMIN])
	@Post('cancel')
	async cancel(@Body() dto: CancelGuardianshipRequestDto): Promise<ReturnDto<typeof CancelGuardianshipResponseDto>> {
		const { guardianshipId } = await this.commandBus.execute(new CancelGuardianshipCommand(dto.guardianshipId));
		return { guardianshipId };
	}

	@ApiOperation({
		summary: 'Получить опекунство по животному',
		description: 'Возвращает текущую запись опекунства для указанного животного.'
	})
	@ApiOkResponse({ description: 'Опекунство', type: GetGuardianshipByAnimalResponseDto })
	@Get('by-animal/:animalId')
	async getByAnimal(
		@Param('animalId', ParseUUIDPipe) animalId: string
	): Promise<ReturnDto<typeof GetGuardianshipByAnimalResponseDto>> {
		const result = await this.queryBus.execute(new GetGuardianshipByAnimalQuery(animalId));
		const animal = result.animal;
		const guardian = result.guardian;
		if (animal == null || guardian == null) {
			throw new GuardianshipNotFoundException();
		}
		return {
			...result,
			animal,
			guardian: {
				...guardian,
				createdAt: guardian.createdAt.toISOString(),
				updatedAt: guardian.updatedAt?.toISOString() || null,
				deletedAt: guardian.deletedAt?.toISOString() || null
			}
		};
	}
}
