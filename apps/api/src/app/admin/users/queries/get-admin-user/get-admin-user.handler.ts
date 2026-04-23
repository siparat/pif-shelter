import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAdminUserResult } from '@pif/contracts';
import { UsersService } from '../../../../users/users.service';
import { UserNotFoundException } from '../../exceptions/user-not-found.exception';
import { GetAdminUserQuery } from './get-admin-user.query';

@QueryHandler(GetAdminUserQuery)
export class GetAdminUserHandler implements IQueryHandler<GetAdminUserQuery, GetAdminUserResult['data']> {
	constructor(private readonly usersService: UsersService) {}

	async execute({ userId }: GetAdminUserQuery): Promise<GetAdminUserResult['data']> {
		const user = await this.usersService.findById(userId);
		if (!user) {
			throw new UserNotFoundException(userId);
		}
		return {
			id: user.id,
			name: user.name,
			email: user.email,
			image: user.image,
			role: user.role,
			position: user.position,
			banned: user.banned,
			telegram: user.telegram,
			telegramChatId: user.telegramChatId,
			telegramUnreachable: user.telegramUnreachable,
			createdAt: user.createdAt.toISOString(),
			updatedAt: user.updatedAt?.toISOString() ?? null
		};
	}
}
