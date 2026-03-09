import type { IHelpMessageProps } from '../messages/help.message';

export abstract class BotHelpConfigRepository {
	abstract getHelpContent(): Promise<IHelpMessageProps>;
}
