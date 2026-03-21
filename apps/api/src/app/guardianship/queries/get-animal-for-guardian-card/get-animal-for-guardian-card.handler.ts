import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { DatabaseService, guardianshipPortalAccessWhere, guardianships } from '@pif/database';
import { GuardianshipNotFoundException } from '../../exceptions/guardianship-not-found.exception';
import { GetAnimalForGuardianCardQuery, IGetAnimalForGuardianCardResult } from './get-animal-for-guardian-card.query';

@QueryHandler(GetAnimalForGuardianCardQuery)
export class GetAnimalForGuardianCardHandler implements IQueryHandler<GetAnimalForGuardianCardQuery> {
	constructor(private readonly db: DatabaseService) {}

	async execute({
		animalId,
		guardianUserId
	}: GetAnimalForGuardianCardQuery): Promise<IGetAnimalForGuardianCardResult> {
		const [guardianship] = await this.db.client
			.select()
			.from(guardianships)
			.where(guardianshipPortalAccessWhere(new Date(), { animalId, guardianUserId }))
			.limit(1);

		if (!guardianship) {
			throw new GuardianshipNotFoundException();
		}

		const animal = await this.db.client.query.animals.findFirst({
			where: { id: animalId },
			with: { curator: { columns: { id: true, telegram: true, name: true } }, labels: true }
		});

		if (!animal) {
			throw new GuardianshipNotFoundException();
		}

		return {
			animal,
			curator: animal.curator ?? null
		};
	}
}
