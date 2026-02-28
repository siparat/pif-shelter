import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AnimalsController } from './animals.controller';
import { ChangeAnimalStatusHandler } from './commands/change-status/change-status.handler';
import { CreateAnimalLabelHandler } from './commands/create-animal-label/create-animal-label.handler';
import { CreateAnimalHandler } from './commands/create-animal/create-animal.handler';
import { DeleteAnimalLabelHandler } from './commands/delete-animal-label/delete-animal-label.handler';
import { UpdateAnimalLabelHandler } from './commands/update-animal-label/update-animal-label.handler';
import { UpdateAnimalHandler } from './commands/update-animal/update-animal.handler';
import { GetAnimalByIdHandler } from './queries/get-animal-by-id/get-animal-by-id.handler';
import { ListAnimalLabelsHandler } from './queries/list-animal-labels/list-animal-labels.handler';
import { ListAnimalsHandler } from './queries/list-animals/list-animals.handler';
import { AnimalLabelsRepository } from './repositories/animal-labels.repository';
import { AnimalsRepository } from './repositories/animals.repository';
import { DrizzleAnimalLabelsRepository } from './repositories/drizzle-animal-labels.repository';
import { DrizzleAnimalsRepository } from './repositories/drizzle-animals.repository';
import { AnimalLabelsController } from './animal-labels.controller';

@Module({
	imports: [CqrsModule],
	controllers: [AnimalLabelsController, AnimalsController],
	providers: [
		CreateAnimalHandler,
		UpdateAnimalHandler,
		ChangeAnimalStatusHandler,
		CreateAnimalLabelHandler,
		UpdateAnimalLabelHandler,
		DeleteAnimalLabelHandler,

		GetAnimalByIdHandler,
		ListAnimalsHandler,
		ListAnimalLabelsHandler,

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
