import { Injectable } from '@nestjs/common';
import { DatabaseService, Invitation, invitations, users } from '@pif/database';
import { UserRole } from '@pif/shared';
import { and, eq, gt, inArray, isNull, sql } from 'drizzle-orm';
import { CreateInvitationRequestDto } from '../../../core/dto';
import {
	AdminUsersRepository,
	PublicTeamUserSummary,
	TeamUserSummary,
	VolunteerSummary
} from './admin-users.repository';

@Injectable()
export class DrizzleAdminUsersRepository implements AdminUsersRepository {
	constructor(private db: DatabaseService) {}

	async markInvitationAsUsed(id: string, userId: string): Promise<Invitation> {
		const [invitation] = await this.db.client
			.update(invitations)
			.set({ used: true, userId })
			.where(eq(invitations.id, id))
			.returning();
		return invitation;
	}

	async findInvitationByToken(token: string): Promise<Invitation | undefined> {
		const [invitation] = await this.db.client
			.select()
			.from(invitations)
			.where(and(isNull(invitations.deletedAt), eq(invitations.token, token)));
		return invitation;
	}

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

	async listVolunteers(): Promise<VolunteerSummary[]> {
		const volunteers = await this.db.client
			.select({
				id: users.id,
				avatar: users.image,
				name: users.name,
				role: users.role,
				position: users.position,
				telegram: users.telegram,
				telegramUnreachable: users.telegramUnreachable
			})
			.from(users)
			.where(
				and(
					inArray(users.role, [UserRole.VOLUNTEER, UserRole.SENIOR_VOLUNTEER, UserRole.ADMIN]),
					eq(users.banned, false),
					isNull(users.deletedAt)
				)
			);

		return volunteers;
	}

	async listTeamUsers(includeGuardians: boolean): Promise<TeamUserSummary[]> {
		const allowedRoles = includeGuardians
			? [UserRole.VOLUNTEER, UserRole.SENIOR_VOLUNTEER, UserRole.ADMIN, UserRole.GUARDIAN]
			: [UserRole.VOLUNTEER, UserRole.SENIOR_VOLUNTEER, UserRole.ADMIN];

		const teamUsers = await this.db.client
			.select({
				id: users.id,
				avatar: users.image,
				name: users.name,
				email: users.email,
				role: users.role,
				position: users.position,
				telegram: users.telegram,
				telegramUnreachable: users.telegramUnreachable,
				banned: users.banned,
				createdAt: users.createdAt
			})
			.from(users)
			.where(and(inArray(users.role, allowedRoles), isNull(users.deletedAt)));

		return teamUsers.map((user) => ({
			...user,
			createdAt: user.createdAt.toISOString()
		}));
	}

	async listPublicTeamUsers(): Promise<PublicTeamUserSummary[]> {
		const allowedRoles = [UserRole.VOLUNTEER, UserRole.SENIOR_VOLUNTEER, UserRole.ADMIN];

		return this.db.client
			.select({
				id: users.id,
				name: users.name,
				role: users.role,
				position: users.position,
				telegram: users.telegram,
				avatar: users.image
			})
			.from(users)
			.where(and(inArray(users.role, allowedRoles), eq(users.banned, false), isNull(users.deletedAt)))
			.orderBy(
				sql`CASE ${users.role} WHEN ${UserRole.ADMIN} THEN 0 WHEN ${UserRole.SENIOR_VOLUNTEER} THEN 1 ELSE 2 END`
			);
	}
}
