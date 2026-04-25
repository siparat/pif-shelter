import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListTeamUsersResponseDto, ReturnData } from '../../../../core/dto';
import { AdminUsersRepository } from '../../repositories/admin-users.repository';
import { ListTeamUsersQuery } from './list-team-users.query';

@QueryHandler(ListTeamUsersQuery)
export class ListTeamUsersHandler implements IQueryHandler<ListTeamUsersQuery> {
	constructor(private readonly adminUsersRepository: AdminUsersRepository) {}

	async execute(query: ListTeamUsersQuery): Promise<ReturnData<typeof ListTeamUsersResponseDto>> {
		return this.adminUsersRepository.listTeamUsers(query.includeGuardians);
	}
}
