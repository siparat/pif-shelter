import { Command } from '@nestjs/cqrs';
import { SetCostOfGuardianshipRequestDto } from '../../../core/dto';

export class SetCostOfGuardianshipCommand extends Command<{ oldCost: number | null; newCost: number | null }> {
	constructor(
		public readonly animalId: string,
		public readonly dto: SetCostOfGuardianshipRequestDto
	) {
		super();
	}
}
