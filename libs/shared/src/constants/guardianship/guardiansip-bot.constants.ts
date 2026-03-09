export const GUARDIANSHIP_BOT_LINK_PREFIX = 'link_';

export const GuardianshipBotImages = {
	WELCOME: 'https://s3.twcstorage.ru/pif/bot/welcome.jpg'
};

export const GuardianshipBotCommands = {
	HELP: {
		command: 'help',
		description: 'Помощь'
	},
	MY_ANIMALS: {
		command: 'my_animals',
		description: 'Список моих подопечных'
	}
} as const;
