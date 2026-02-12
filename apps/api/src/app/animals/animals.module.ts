import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AnimalsController } from './animals.controller';
import { CreateAnimalHandler } from './commands/create-animal/create-animal.handler';
import { AnimalsRepository } from './repositories/animals.repository';
import { IAnimalsRepository } from './repositories/animals.repository.interface';

@Module({
	imports: [CqrsModule],
	controllers: [AnimalsController],
	providers: [
		CreateAnimalHandler,
		{
			provide: IAnimalsRepository,
			useClass: AnimalsRepository
		}
	]
})
export class AnimalsModule {}
