import { animals } from '@pif/database';
import { UpdateAnimalRequestDto } from '../../../core/dto';

export class AnimalUpdatedEvent {
	constructor(
		public readonly oldData: typeof animals.$inferSelect,
		public readonly dto: UpdateAnimalRequestDto
	) {}
}
