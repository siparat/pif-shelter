import { Injectable } from '@nestjs/common';
import { AcceptInvitationRequestDto } from '@pif/contracts';
import { Invitation } from '@pif/database';
import dayjs from 'dayjs';
import { UsersService } from '../../../../users/users.service';
import { InvitationHasExpiredException } from '../../exceptions/invitation-has-expired.exception';
import { InvitationNotFoundException } from '../../exceptions/invitation-not-found.exception';
import { TelegramAlreadyUsedException } from '../../exceptions/telegram-already-used.exception';
import { UserAlreadyExistsException } from '../../exceptions/user-already-exists.exception';

@Injectable()
export class AcceptInvitationPolicy {
	constructor(private readonly usersService: UsersService) {}

	async assertAccept(invitation: Invitation | undefined, dto: AcceptInvitationRequestDto): Promise<Invitation> {
		if (!invitation) {
			throw new InvitationNotFoundException();
		}

		if (dayjs().isAfter(invitation.expiresAt)) {
			throw new InvitationHasExpiredException();
		}

		if (invitation.used) {
			throw new UserAlreadyExistsException();
		}

		const userByEmail = await this.usersService.findByEmail(invitation.email);
		if (userByEmail) {
			throw new UserAlreadyExistsException();
		}

		const userByTelegram = await this.usersService.findByTelegram(dto.telegram);
		if (userByTelegram) {
			throw new TelegramAlreadyUsedException(dto.telegram);
		}

		return invitation;
	}
}
