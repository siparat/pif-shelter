import { Command } from '@nestjs/cqrs';
import { UserRole } from '@pif/shared';

export class AssignAnimalLabelCommand extends Command<void> {
	constructor(
		public readonly animalId: string,
		public readonly labelId: string,
		public readonly userId: string,
		public readonly userRole: UserRole
	) {
		super();
	}
}
