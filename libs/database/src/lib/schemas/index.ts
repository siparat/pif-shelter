import { defineRelations } from 'drizzle-orm';
import {
	animalCoatEnum,
	animalGenderEnum,
	animalLabels,
	animalSizeEnum,
	animalSpeciesEnum,
	animalStatusEnum,
	animals,
	animalsToAnimalLabels
} from './animals.schema';
import { botHelpConfig } from './bot-help-config.schema';
import {
	donationOneTimeIntentStatusEnum,
	donationOneTimeIntents,
	donationSubscriptionStatusEnum,
	donationSubscriptions,
	ledgerEntries,
	ledgerEntryDirectionEnum,
	ledgerEntrySourceEnum,
	monthlyFinanceReportStatusEnum,
	monthlyFinanceReportTypeEnum,
	monthlyFinanceReports
} from './finance.schema';
import { guardianshipStatusEnum, guardianships } from './guardianships.schema';
import { postMedia, postMediaTypeEnum, postReactions, postVisibilityEnum, posts } from './posts.schema';
import { accounts, invitations, roleEnum, sessions, users, verifications } from './users.schema';

export const relations = defineRelations(
	{
		animals,
		animalLabels,
		animalsToAnimalLabels,
		donationOneTimeIntents,
		donationSubscriptions,
		guardianships,
		ledgerEntries,
		monthlyFinanceReports,
		postMedia,
		postReactions,
		posts,
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
			curator: r.one.users({
				from: r.animals.curatorId,
				to: r.users.id
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
		donationOneTimeIntents: {
			ledgerEntries: r.many.ledgerEntries({
				from: r.donationOneTimeIntents.id,
				to: r.ledgerEntries.donationOneTimeIntentId
			})
		},
		donationSubscriptions: {
			ledgerEntries: r.many.ledgerEntries({
				from: r.donationSubscriptions.id,
				to: r.ledgerEntries.donationSubscriptionId
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
			}),
			ledgerEntries: r.many.ledgerEntries({
				from: r.guardianships.id,
				to: r.ledgerEntries.guardianshipId
			})
		},
		ledgerEntries: {
			donationOneTimeIntent: r.one.donationOneTimeIntents({
				from: r.ledgerEntries.donationOneTimeIntentId,
				to: r.donationOneTimeIntents.id
			}),
			donationSubscription: r.one.donationSubscriptions({
				from: r.ledgerEntries.donationSubscriptionId,
				to: r.donationSubscriptions.id
			}),
			guardianship: r.one.guardianships({
				from: r.ledgerEntries.guardianshipId,
				to: r.guardianships.id
			}),
			createdByUser: r.one.users({
				from: r.ledgerEntries.createdByUserId,
				to: r.users.id
			})
		},
		postMedia: {
			post: r.one.posts({
				from: r.postMedia.postId,
				to: r.posts.id
			})
		},
		postReactions: {
			post: r.one.posts({
				from: r.postReactions.postId,
				to: r.posts.id
			})
		},
		posts: {
			animal: r.one.animals({
				from: r.posts.animalId,
				to: r.animals.id
			}),
			author: r.one.users({
				from: r.posts.authorId,
				to: r.users.id
			}),
			media: r.many.postMedia({
				from: r.posts.id,
				to: r.postMedia.postId
			}),
			reactions: r.many.postReactions({
				from: r.posts.id,
				to: r.postReactions.postId
			})
		},
		users: {
			sessions: r.many.sessions(),
			accounts: r.many.accounts(),
			guardianships: r.many.guardianships({
				from: r.users.id,
				to: r.guardianships.guardianUserId
			}),
			curatedAnimals: r.many.animals({
				from: r.users.id,
				to: r.animals.curatorId
			}),
			ledgerEntriesCreated: r.many.ledgerEntries({
				from: r.users.id,
				to: r.ledgerEntries.createdByUserId
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
	donationOneTimeIntentStatusEnum,
	donationOneTimeIntents,
	donationSubscriptionStatusEnum,
	donationSubscriptions,
	guardianshipStatusEnum,
	guardianships,
	ledgerEntries,
	ledgerEntryDirectionEnum,
	ledgerEntrySourceEnum,
	monthlyFinanceReports,
	monthlyFinanceReportStatusEnum,
	monthlyFinanceReportTypeEnum,
	postMedia,
	postMediaTypeEnum,
	postReactions,
	postVisibilityEnum,
	posts,
	roleEnum,
	users,
	sessions,
	accounts,
	verifications,
	invitations
};

export * from './animals.schema';
export * from './bot-help-config.schema';
export * from './finance.schema';
export * from './guardianships.schema';
export * from './posts.schema';
export * from './users.schema';
