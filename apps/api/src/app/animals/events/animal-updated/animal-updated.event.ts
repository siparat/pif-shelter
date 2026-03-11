import { UpdateAnimalRequestDto } from '@pif/contracts';
import { animals } from '@pif/database';

export class AnimalUpdatedEvent {
	constructor(
		public readonly oldData: typeof animals.$inferSelect,
		public readonly dto: UpdateAnimalRequestDto
	) {}
}
