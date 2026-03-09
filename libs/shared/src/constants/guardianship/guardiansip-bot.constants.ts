export const GUARDIANSHIP_BOT_LINK_PREFIX = 'link_';

export const GuardianshipBotImages = {
	WELCOME: 'https://s3.twcstorage.ru/pif/bot/welcome.jpg'
};

export const GuardianshipBotCallback = {
	UNSCRIBE: {
		CHOICE_PREFIX: 'unsub:',
		CONFIRM_PREFIX: 'unsub_confirm:',
		ABORT: 'unsub_abort'
	}
} as const;

export const GuardianshipBotCommands = {
	HELP: {
		command: 'help',
		description: 'Помощь'
	},
	MY_ANIMALS: {
		command: 'my_animals',
		description: 'Список моих подопечных'
	},
	REPORT: {
		command: 'report',
		description: 'Запросить статус'
	},
	UNSUBSCRIBE: {
		command: 'unsubscribe',
		description: 'Управление подпиской'
	}
} as const;
