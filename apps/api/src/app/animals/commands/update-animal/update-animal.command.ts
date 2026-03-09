import { Command } from '@nestjs/cqrs';
import { UpdateAnimalRequestDto } from '@pif/contracts';
import { UserRole } from '@pif/shared';

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
