import { Command } from '@nestjs/cqrs';
import { UserRole } from '@pif/shared';

export class SetAnimalGalleryCommand extends Command<{
	animalId: string;
	galleryUrls: string[];
}> {
	constructor(
		public readonly animalId: string,
		public readonly galleryKeys: string[],
		public readonly userId: string,
		public readonly userRole: UserRole
	) {
		super();
	}
}
