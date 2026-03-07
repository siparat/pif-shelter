import { defineRelations } from 'drizzle-orm';
import { accounts, invitations, roleEnum, sessions, users, verifications } from './users.schema';
import { botHelpConfig } from './bot-help-config.schema';
import {
	animalCoatEnum,
	animalGenderEnum,
	animalLabels,
	animals,
	animalsToAnimalLabels,
	animalSizeEnum,
	animalSpeciesEnum,
	animalStatusEnum
} from './animals.schema';
import { guardianshipStatusEnum, guardianships } from './guardianships.schema';

export const relations = defineRelations(
	{
		animals,
		animalLabels,
		animalsToAnimalLabels,
		guardianships,
		users,
		sessions,
		accounts,
		verifications,
		invitations
	},
	(r) => ({
		animals: {
			labels: r.many.animalLabels({
				from: r.animals.id.through(r.animalsToAnimalLabels.animalId),
				to: r.animalLabels.id.through(r.animalsToAnimalLabels.labelId)
			}),
			guardianship: r.one.guardianships({
				from: r.animals.id,
				to: r.guardianships.animalId
			})
		},
		animalLabels: {
			animals: r.many.animals({
				from: r.animalLabels.id.through(r.animalsToAnimalLabels.labelId),
				to: r.animals.id.through(r.animalsToAnimalLabels.animalId)
			})
		},
		guardianships: {
			animal: r.one.animals({
				from: r.guardianships.animalId,
				to: r.animals.id
			}),
			guardian: r.one.users({
				from: r.guardianships.guardianUserId,
				to: r.users.id
			})
		},
		users: {
			sessions: r.many.sessions(),
			accounts: r.many.accounts(),
			guardianships: r.many.guardianships({
				from: r.users.id,
				to: r.guardianships.guardianUserId
			})
		},
		sessions: {
			user: r.one.users({
				from: r.sessions.userId,
				to: r.users.id
			})
		},
		accounts: {
			user: r.one.users({
				from: r.accounts.userId,
				to: r.users.id
			})
		},
		invitations: {
			user: r.one.users({
				from: r.invitations.userId,
				to: r.users.id
			})
		}
	})
);

export const schema = {
	animalCoatEnum,
	animalGenderEnum,
	animalSizeEnum,
	animalSpeciesEnum,
	animalStatusEnum,
	animals,
	animalLabels,
	animalsToAnimalLabels,
	botHelpConfig,
	guardianshipStatusEnum,
	guardianships,
	roleEnum,
	users,
	sessions,
	accounts,
	verifications,
	invitations
};

export * from './animals.schema';
export * from './bot-help-config.schema';
export * from './guardianships.schema';
export * from './users.schema';
