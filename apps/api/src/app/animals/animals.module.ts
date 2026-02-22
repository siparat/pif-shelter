import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AnimalsController } from './animals.controller';
import { ChangeAnimalStatusHandler } from './commands/change-status/change-status.handler';
import { CreateAnimalHandler } from './commands/create-animal/create-animal.handler';
import { UpdateAnimalHandler } from './commands/update-animal/update-animal.handler';
import { GetAnimalByIdHandler } from './queries/get-animal-by-id/get-animal-by-id.handler';
import { ListAnimalsHandler } from './queries/list-animals/list-animals.handler';
import { AnimalsRepository } from './repositories/animals.repository';
import { DrizzleAnimalsRepository } from './repositories/drizzle-animals.repository';

@Module({
	imports: [CqrsModule],
	controllers: [AnimalsController],
	providers: [
		CreateAnimalHandler,
		UpdateAnimalHandler,
		ChangeAnimalStatusHandler,

		GetAnimalByIdHandler,
		ListAnimalsHandler,

		{
			provide: AnimalsRepository,
			useClass: DrizzleAnimalsRepository
		}
	]
})
export class AnimalsModule {}
