module.exports = {
	displayName: 'api',
	preset: '../../jest.preset.js',
	testEnvironment: 'node',
	transform: {
		'^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }]
	},
	transformIgnorePatterns: ['node_modules/(?!(@faker-js/faker|.*@faker-js))'],
	moduleFileExtensions: ['ts', 'js', 'html'],
	coverageDirectory: '../../coverage/apps/api'
};
