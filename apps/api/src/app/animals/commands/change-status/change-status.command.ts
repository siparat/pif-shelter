import { Command } from '@nestjs/cqrs';
import { AnimalStatusEnum, UserRole } from '@pif/shared';

export class ChangeAnimalStatusCommand extends Command<{ id: string; status: AnimalStatusEnum }> {
	constructor(
		public readonly id: string,
		public readonly status: AnimalStatusEnum,
		public readonly userId: string,
		public readonly userRole: UserRole
	) {
		super();
	}
}
