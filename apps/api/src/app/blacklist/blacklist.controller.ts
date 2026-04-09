import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BanContactsRequestDto, BanContactsResponseDto, ReturnDto } from '@pif/contracts';
import { UserRole } from '@pif/shared';
import { AuthGuard, Session } from '@thallesp/nestjs-better-auth';
import { ISession } from '../configs/auth.config';
import { Roles } from '../core/decorators/roles.decorator';
import { BanContactsCommand } from './commands/ban-contacts/ban-contacts.command';

@ApiTags('Blacklist | Черный список')
@Controller('blacklist')
export class BlacklistController {
	constructor(private readonly commandBus: CommandBus) {}

	@ApiCreatedResponse({ type: BanContactsRequestDto })
	@ApiOperation({ summary: 'Блокировка одного или несколько контактов' })
	@Roles([UserRole.ADMIN, UserRole.SENIOR_VOLUNTEER])
	@UseGuards(AuthGuard)
	@Post('ban')
	async banContacts(
		@Body() dto: BanContactsRequestDto,
		@Session() { user }: ISession
	): Promise<ReturnDto<typeof BanContactsResponseDto>> {
		return this.commandBus.execute(new BanContactsCommand(dto, user.id));
	}
}
