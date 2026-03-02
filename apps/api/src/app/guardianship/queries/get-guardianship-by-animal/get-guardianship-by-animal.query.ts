import { Query } from '@nestjs/cqrs';
import { animals, guardianships, users } from '@pif/database';

export class GetGuardianshipByAnimalQuery extends Query<
	typeof guardianships.$inferSelect & {
		guardian: typeof users.$inferSelect | null;
		animal: typeof animals.$inferSelect | null;
	}
> {
	constructor(public readonly animalId: string) {
		super();
	}
}
