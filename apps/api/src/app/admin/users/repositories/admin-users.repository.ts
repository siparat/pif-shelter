import { CreateInvitationRequestDto } from '@pif/contracts';
import { Invitation } from '@pif/database';

export abstract class AdminUsersRepository {
	abstract markInvitationAsUsed(id: string, userId: string): Promise<Invitation>;
	abstract findInvitationByToken(token: string): Promise<Invitation | undefined>;
	abstract findActiveInvitation(email: string): Promise<Invitation | undefined>;
	abstract createInvitation(dto: CreateInvitationRequestDto, expiresAt: Date): Promise<Invitation>;
}
