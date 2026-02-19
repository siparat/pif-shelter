import { CreateInvitationRequestDto } from '@pif/contracts';
import { Invitation } from '@pif/database';

export abstract class AdminUsersRepository {
	abstract findActiveInvitation(email: string): Promise<Invitation | undefined>;
	abstract createInvitation(dto: CreateInvitationRequestDto, expiresAt: Date): Promise<Invitation>;
}
