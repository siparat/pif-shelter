module.exports = {
	displayName: 'api',
	preset: '../../jest.preset.js',
	testEnvironment: 'node',
	transform: {
		'^.+\\.[tj]sx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }]
	},
	transformIgnorePatterns: ['node_modules/(?!(@faker-js/faker|.*@faker-js))'],
	moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'html'],
	coverageDirectory: '../../coverage/apps/api'
};
