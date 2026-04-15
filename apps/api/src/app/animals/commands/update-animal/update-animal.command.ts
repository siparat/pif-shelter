import { Command } from '@nestjs/cqrs';
import { UserRole } from '@pif/shared';
import { UpdateAnimalRequestDto } from '../../../core/dto';

export class UpdateAnimalCommand extends Command<string> {
	constructor(
		public readonly id: string,
		public readonly dto: UpdateAnimalRequestDto,
		public readonly userId: string,
		public readonly userRole: UserRole
	) {
		super();
	}
}
