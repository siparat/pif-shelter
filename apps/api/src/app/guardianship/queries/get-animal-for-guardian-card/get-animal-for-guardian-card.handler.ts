import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { DatabaseService } from '@pif/database';
import { GuardianshipStatusEnum } from '@pif/shared';
import { GuardianshipNotFoundException } from '../../exceptions/guardianship-not-found.exception';
import { GetAnimalForGuardianCardQuery, IGetAnimalForGuardianCardResult } from './get-animal-for-guardian-card.query';

@QueryHandler(GetAnimalForGuardianCardQuery)
export class GetAnimalForGuardianCardHandler implements IQueryHandler<GetAnimalForGuardianCardQuery> {
	constructor(private readonly db: DatabaseService) {}

	async execute({
		animalId,
		guardianUserId
	}: GetAnimalForGuardianCardQuery): Promise<IGetAnimalForGuardianCardResult> {
		const guardianship = await this.db.client.query.guardianships.findFirst({
			where: {
				animalId,
				guardianUserId,
				status: GuardianshipStatusEnum.ACTIVE
			}
		});

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
