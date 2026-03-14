export const GUARDIANSHIP_BOT_LINK_PREFIX = 'link_';

export const GuardianshipBotImages = {
	WELCOME: 'https://s3.twcstorage.ru/pif/bot/welcome.jpg'
};

export const GuardianshipBotCallback = {
	UNSCRIBE: {
		CHOICE_PREFIX: 'unsub:',
		CONFIRM_PREFIX: 'unsub_confirm:',
		ABORT: 'unsub_abort'
	},
	MY_ANIMALS: {
		LIST_PAGE_PREFIX: 'my_animals:page:',
		CARD_PREFIX: 'my_animals:card:'
	}
} as const;

export const MY_ANIMALS_BOT_PAGE_SIZE = 5;

export const GuardianshipBotCommands = {
	HELP: {
		command: 'help',
		description: 'Помощь'
	},
	MY_ANIMALS: {
		command: 'my_animals',
		description: 'Список моих подопечных'
	},
	UNSUBSCRIBE: {
		command: 'unsubscribe',
		description: 'Управление подпиской'
	}
} as const;

export const LIMIT_MESSAGE_LENGTH = 4096;
