import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AnimalsController } from './animals.controller';
import { CreateAnimalHandler } from './commands/create-animal/create-animal.handler';
import { AnimalsRepository } from './repositories/animals.repository';
import { DrizzleAnimalsRepository } from './repositories/drizzle-animals.repository';

@Module({
	imports: [CqrsModule],
	controllers: [AnimalsController],
	providers: [
		CreateAnimalHandler,
		{
			provide: AnimalsRepository,
			useClass: DrizzleAnimalsRepository
		}
	]
})
export class AnimalsModule {}
