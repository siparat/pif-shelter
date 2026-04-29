import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListPublicTeamUsersResponseDto, ReturnData } from '../../../../core/dto';
import { AdminUsersRepository } from '../../repositories/admin-users.repository';
import { ListPublicTeamUsersQuery } from './list-public-team-users.query';

@QueryHandler(ListPublicTeamUsersQuery)
export class ListPublicTeamUsersHandler implements IQueryHandler<ListPublicTeamUsersQuery> {
	constructor(private readonly adminUsersRepository: AdminUsersRepository) {}

	async execute(): Promise<ReturnData<typeof ListPublicTeamUsersResponseDto>> {
		return this.adminUsersRepository.listPublicTeamUsers();
	}
}
