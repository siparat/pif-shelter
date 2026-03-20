import { Context } from 'telegraf';

export interface IUnsubscribeSessionState {
	guardianships: Array<{ guardianshipId: string; animalName: string }>;
	selected?: { guardianshipId: string; animalName: string };
}

export interface IMyAnimalPostsSessionState {
	byAnimalId: Record<
		string,
		{
			textMessageId?: number;
			mediaMessageIds?: number[];
		}
	>;
}

export interface IBotSession {
	unsubscribe?: IUnsubscribeSessionState;
	myAnimalPosts?: IMyAnimalPostsSessionState;
}

export type BotContext = Context & { session: IBotSession };
