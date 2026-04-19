import { Invitation } from '@pif/database';
import { UserRole } from '@pif/shared';
import { CreateInvitationRequestDto } from '../../../core/dto';

export interface VolunteerSummary {
	id: string;
	avatar: string | null;
	name: string;
	role: UserRole;
	position: string;
	telegram: string;
	telegramUnreachable: boolean;
}

export abstract class AdminUsersRepository {
	abstract markInvitationAsUsed(id: string, userId: string): Promise<Invitation>;
	abstract findInvitationByToken(token: string): Promise<Invitation | undefined>;
	abstract findActiveInvitation(email: string): Promise<Invitation | undefined>;
	abstract createInvitation(dto: CreateInvitationRequestDto, expiresAt: Date): Promise<Invitation>;
	abstract listVolunteers(): Promise<VolunteerSummary[]>;
}
