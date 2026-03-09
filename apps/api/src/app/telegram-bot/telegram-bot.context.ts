import { Context } from 'telegraf';

export interface IUnsubscribeSessionState {
	guardianships: Array<{ guardianshipId: string; animalName: string }>;
	selected?: { guardianshipId: string; animalName: string };
}

export interface IBotSession {
	unsubscribe?: IUnsubscribeSessionState;
}

export type BotContext = Context & { session: IBotSession };
