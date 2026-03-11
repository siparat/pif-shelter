import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AnimalLabelsController } from './animal-labels.controller';
import { AnimalsController } from './animals.controller';
import { AnimalsService } from './animals.service';
import { AssignAnimalLabelHandler } from './commands/assign-animal-label/assign-animal-label.handler';
import { ChangeAnimalStatusHandler } from './commands/change-status/change-status.handler';
import { CreateAnimalLabelHandler } from './commands/create-animal-label/create-animal-label.handler';
import { CreateAnimalHandler } from './commands/create-animal/create-animal.handler';
import { DeleteAnimalLabelHandler } from './commands/delete-animal-label/delete-animal-label.handler';
import { UnassignAnimalLabelHandler } from './commands/unassign-animal-label/unassign-animal-label.handler';
import { UpdateAnimalLabelHandler } from './commands/update-animal-label/update-animal-label.handler';
import { UpdateAnimalHandler } from './commands/update-animal/update-animal.handler';
import { SendEmailAboutCostGuardianshipHandler } from './events/animal-cost-of-guardianship-set/send-email-about-cost-guardianship.handler';
import { AnimalLabelAssignedHandler } from './events/animal-label-assigned/animal-label-assigned.handler';
import { AnimalCuratorSetHandler } from './events/animal-curator-set/animal-curator-set.handler';
import { AnimalLabelUnassignedHandler } from './events/animal-label-unassigned/animal-label-unassigned.handler';
import { OnAnimalStatusAdoptedOrRainbowHandler } from './events/animal-status-changed/on-animal-status-adopted-or-rainbow.handler';
import { GetAnimalByIdHandler } from './queries/get-animal-by-id/get-animal-by-id.handler';
import { ListAnimalLabelsHandler } from './queries/list-animal-labels/list-animal-labels.handler';
import { ListAnimalsHandler } from './queries/list-animals/list-animals.handler';
import { CanEditAnimalPolicy } from './policies/can-edit-animal.policy';
import { AnimalLabelsRepository } from './repositories/animal-labels.repository';
import { AnimalsRepository } from './repositories/animals.repository';
import { DrizzleAnimalLabelsRepository } from './repositories/drizzle-animal-labels.repository';
import { DrizzleAnimalsRepository } from './repositories/drizzle-animals.repository';
import { SetCostOfGuardianshipHandler } from './commands/set-cost-of-guardianship/set-cost-of-guardianship.handler';
import { SetAnimalCuratorHandler } from './commands/set-animal-curator/set-animal-curator.handler';
import { PaymentModule } from '@pif/payment';

@Module({
	imports: [CqrsModule, PaymentModule],
	controllers: [AnimalLabelsController, AnimalsController],
	exports: [AnimalsService],
	providers: [
		AnimalsService,
		CanEditAnimalPolicy,

		CreateAnimalHandler,
		UpdateAnimalHandler,
		ChangeAnimalStatusHandler,
		CreateAnimalLabelHandler,
		UpdateAnimalLabelHandler,
		DeleteAnimalLabelHandler,
		AssignAnimalLabelHandler,
		UnassignAnimalLabelHandler,
		SendEmailAboutCostGuardianshipHandler,
		SetCostOfGuardianshipHandler,
		SetAnimalCuratorHandler,

		GetAnimalByIdHandler,
		ListAnimalsHandler,
		ListAnimalLabelsHandler,

		AnimalLabelAssignedHandler,
		AnimalCuratorSetHandler,
		AnimalLabelUnassignedHandler,
		OnAnimalStatusAdoptedOrRainbowHandler,

		{
			provide: AnimalsRepository,
			useClass: DrizzleAnimalsRepository
		},
		{
			provide: AnimalLabelsRepository,
			useClass: DrizzleAnimalLabelsRepository
		}
	]
})
export class AnimalsModule {}
