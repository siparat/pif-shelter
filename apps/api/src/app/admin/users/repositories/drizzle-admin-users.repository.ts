import { Injectable } from '@nestjs/common';
import { CreateInvitationRequestDto } from '@pif/contracts';
import { DatabaseService, Invitation, invitations } from '@pif/database';
import { and, eq, gt, isNull } from 'drizzle-orm';
import { AdminUsersRepository } from './admin-users.repository';

@Injectable()
export class DrizzleAdminUsersRepository implements AdminUsersRepository {
	constructor(private db: DatabaseService) {}

	async findActiveInvitation(email: string): Promise<Invitation | undefined> {
		const [invitation] = await this.db.client
			.select()
			.from(invitations)
			.where(
				and(
					eq(invitations.email, email),
					eq(invitations.used, false),
					gt(invitations.expiresAt, new Date()),
					isNull(invitations.deletedAt)
				)
			)
			.limit(1);
		return invitation;
	}

	async createInvitation(dto: CreateInvitationRequestDto, expiresAt: Date): Promise<Invitation> {
		return await this.db.client.transaction(async (tx) => {
			const now = new Date();

			await tx
				.update(invitations)
				.set({ deletedAt: now, expiresAt: now })
				.where(
					and(eq(invitations.email, dto.email), eq(invitations.used, false), isNull(invitations.deletedAt))
				);

			const [newInvitation] = await tx
				.insert(invitations)
				.values({
					email: dto.email,
					personName: dto.name,
					roleName: dto.roleName,
					expiresAt
				})
				.returning();

			return newInvitation;
		});
	}
}
