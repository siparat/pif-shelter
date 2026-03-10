import { Query } from '@nestjs/cqrs';
import { animalLabels, animals, users } from '@pif/database';

export interface IGetAnimalForGuardianCardResult {
	animal: typeof animals.$inferSelect & { labels: (typeof animalLabels.$inferSelect)[] };
	curator: Pick<typeof users.$inferSelect, 'id' | 'telegram' | 'name'> | null;
}

export class GetAnimalForGuardianCardQuery extends Query<IGetAnimalForGuardianCardResult> {
	constructor(
		public readonly animalId: string,
		public readonly guardianUserId: string
	) {
		super();
	}
}
