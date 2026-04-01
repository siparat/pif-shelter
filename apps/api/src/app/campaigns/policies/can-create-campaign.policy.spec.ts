import { faker } from '@faker-js/faker/locale/ru';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test } from '@nestjs/testing';
import { animals } from '@pif/database';
import { AnimalStatusEnum } from '@pif/shared';
import { randomUUID } from 'crypto';
import { AnimalsService } from '../../animals/animals.service';
import { AnimalIsNotWithUsException } from '../exceptions/animal-is-not-with-us.exception';
import { AnimalNotFoundException } from '../exceptions/animal-not-found.exception';
import { InvalidTimeIntervalException } from '../exceptions/invalid-time-interval.exception';
import { CanCreateCampaignPolicy } from './can-create-campaign.policy';

describe('CanCreateCampaignPolicy', () => {
	let policy: CanCreateCampaignPolicy;
	let animalsService: DeepMocked<AnimalsService>;

	const animal = {
		id: faker.string.uuid(),
		name: faker.animal.petName(),
		status: faker.helpers.enumValue(AnimalStatusEnum)
	} as typeof animals.$inferSelect;

	beforeEach(async () => {
		const module = await Test.createTestingModule({
			providers: [CanCreateCampaignPolicy, { provide: AnimalsService, useValue: createMock<AnimalsService>() }]
		}).compile();

		policy = module.get(CanCreateCampaignPolicy);
		animalsService = module.get(AnimalsService);
	});

	it('throws invalid time interval', async () => {
		const now = Date.now();
		await expect(policy.assertCanCreate({ endsAt: new Date(now - 1000).toISOString() } as never)).rejects.toThrow(
			InvalidTimeIntervalException
		);
		await expect(
			policy.assertCanCreate({
				startsAt: new Date(now + 100000).toISOString(),
				endsAt: new Date(now).toISOString()
			} as never)
		).rejects.toThrow(InvalidTimeIntervalException);
		await expect(
			policy.assertCanCreate({
				startsAt: new Date(now).toISOString(),
				endsAt: new Date(now).toISOString()
			} as never)
		).rejects.toThrow(InvalidTimeIntervalException);
	});

	it('success without animal', async () => {
		await expect(
			policy.assertCanCreate({ endsAt: new Date(Date.now() + 100000).toISOString() } as never)
		).resolves.toBeUndefined();
	});

	it('throws animal not found exception', async () => {
		animalsService.findById.mockResolvedValue(undefined);

		await expect(
			policy.assertCanCreate({
				animalId: randomUUID(),
				endsAt: new Date(Date.now() + 100000).toISOString()
			} as never)
		).rejects.toThrow(AnimalNotFoundException);
	});

	it('throws animal is not with us exception', async () => {
		animalsService.findById.mockResolvedValue({ ...animal, status: AnimalStatusEnum.ADOPTED });

		expect(
			policy.assertCanCreate({
				animalId: animal.id,
				endsAt: new Date(Date.now() + 100000).toISOString()
			} as never)
		).rejects.toThrow(AnimalIsNotWithUsException);
	});
});
