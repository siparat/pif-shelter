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
import { campaigns } from './campaign.schema';
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
import { meetingRequestStatusEnum, meetingRequests } from './meeting-requests.schema';
import { postMedia, postMediaTypeEnum, postReactions, postVisibilityEnum, posts } from './posts.schema';
import { accounts, invitations, roleEnum, sessions, users, verifications } from './users.schema';
import { wishlistCategories, wishlistItemStatusEnum, wishlistItems } from './wishlist.schema';

export const relations = defineRelations(
	{
		animals,
		animalLabels,
		animalsToAnimalLabels,
		donationOneTimeIntents,
		donationSubscriptions,
		guardianships,
		meetingRequests,
		ledgerEntries,
		monthlyFinanceReports,
		postMedia,
		postReactions,
		posts,
		users,
		sessions,
		accounts,
		verifications,
		invitations,
		campaigns,
		wishlistCategories,
		wishlistItems
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
			}),
			campaigns: r.many.campaigns({
				from: r.animals.id,
				to: r.campaigns.animalId
			}),
			meetingRequests: r.many.meetingRequests({
				from: r.animals.id,
				to: r.meetingRequests.animalId
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
			}),
			campaign: r.one.campaigns({
				from: r.donationOneTimeIntents.campaignId,
				to: r.campaigns.id
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
		meetingRequests: {
			animal: r.one.animals({
				from: r.meetingRequests.animalId,
				to: r.animals.id
			}),
			curator: r.one.users({
				from: r.meetingRequests.curatorUserId,
				to: r.users.id
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
			}),
			campaign: r.one.campaigns({
				from: r.posts.campaignId,
				to: r.campaigns.id
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
			}),
			meetingRequests: r.many.meetingRequests({
				from: r.users.id,
				to: r.meetingRequests.curatorUserId
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
		},
		campaigns: {
			posts: r.many.posts({
				from: r.campaigns.id,
				to: r.posts.campaignId
			}),
			donationOneTimeIntents: r.many.donationOneTimeIntents({
				from: r.campaigns.id,
				to: r.donationOneTimeIntents.campaignId
			}),
			animal: r.one.animals({
				from: r.campaigns.animalId,
				to: r.animals.id
			})
		},
		wishlistCategories: {
			items: r.many.wishlistItems({
				from: r.wishlistCategories.id,
				to: r.wishlistItems.categoryId
			})
		},
		wishlistItems: {
			category: r.one.wishlistCategories({
				from: r.wishlistItems.categoryId,
				to: r.wishlistCategories.id
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
	meetingRequestStatusEnum,
	meetingRequests,
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
	invitations,
	campaigns,
	wishlistItemStatusEnum,
	wishlistCategories,
	wishlistItems
};

export * from './animals.schema';
export * from './bot-help-config.schema';
export * from './campaign.schema';
export * from './finance.schema';
export * from './guardianships.schema';
export * from './meeting-requests.schema';
export * from './posts.schema';
export * from './users.schema';
export * from './wishlist.schema';
