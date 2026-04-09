import { Body, Controller, Delete, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
	BanContactsRequestDto,
	BanContactsResponseDto,
	DeleteContactFromBlacklistResponseDto,
	ReturnDto
} from '@pif/contracts';
import { UserRole } from '@pif/shared';
import { AuthGuard, Session } from '@thallesp/nestjs-better-auth';
import { ISession } from '../configs/auth.config';
import { Roles } from '../core/decorators/roles.decorator';
import { BanContactsCommand } from './commands/ban-contacts/ban-contacts.command';
import { DeleteContactFromBlacklistCommand } from './commands/delete-contact-from-blacklist/delete-contact-from-blacklist.command';

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

	@ApiOkResponse({ type: DeleteContactFromBlacklistResponseDto })
	@ApiOperation({ summary: 'Удалить контакт из черного списка' })
	@Roles([UserRole.ADMIN, UserRole.SENIOR_VOLUNTEER])
	@UseGuards(AuthGuard)
	@Delete(':id')
	async delete(
		@Param('id', ParseUUIDPipe) id: string,
		@Session() { user }: ISession
	): Promise<ReturnDto<typeof DeleteContactFromBlacklistResponseDto>> {
		return this.commandBus.execute(new DeleteContactFromBlacklistCommand(id, user.id));
	}
}
