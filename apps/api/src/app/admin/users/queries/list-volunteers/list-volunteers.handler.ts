import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListVolunteersResponseDto, ReturnData } from '../../../../core/dto';
import { AdminUsersRepository } from '../../repositories/admin-users.repository';
import { ListVolunteersQuery } from './list-volunteers.query';

@QueryHandler(ListVolunteersQuery)
export class ListVolunteersHandler implements IQueryHandler<ListVolunteersQuery> {
	constructor(private readonly adminUsersRepository: AdminUsersRepository) {}

	async execute(): Promise<ReturnData<typeof ListVolunteersResponseDto>> {
		return this.adminUsersRepository.listVolunteers();
	}
}
