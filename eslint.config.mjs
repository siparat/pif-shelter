import nx from '@nx/eslint-plugin';
import prettierConfig from 'eslint-config-prettier';
import checkFile from 'eslint-plugin-check-file';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import unicorn from 'eslint-plugin-unicorn';

export default [
	...nx.configs['flat/base'],
	...nx.configs['flat/typescript'],
	...nx.configs['flat/javascript'],
	prettierRecommended,
	{
		ignores: ['**/dist', '**/out-tsc', '**/migrations', '**/vite.config.*.timestamp*']
	},
	{
		files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
		plugins: {
			unicorn,
			'check-file': checkFile
		},
		rules: {
			'@nx/enforce-module-boundaries': [
				'error',
				{
					enforceBuildableLibDependency: true,
					allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
					depConstraints: [
						{
							sourceTag: '*',
							onlyDependOnLibsWithTags: ['*']
						}
					]
				}
			],
			'unicorn/filename-case': [
				'error',
				{
					cases: {
						kebabCase: true,
						pascalCase: true
					}
				}
			],
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/explicit-function-return-type': [
				'error',
				{
					// for extracting dynamic object type
					allowedNames: ['createAuth', 'createApiSuccessResponseSchema', 'createApiPaginatedResponseSchema'],
					allowExpressions: true,
					allowTypedFunctionExpressions: true,
					allowHigherOrderFunctions: true
				}
			],
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					argsIgnorePattern: '^_'
				}
			],
			...prettierConfig.rules
		}
	},
	{
		files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
		ignores: [
			'**/webpack.config.js',
			'**/jest.preset.js',
			'**/eslint.config.mjs',
			'**/drizzle.config.ts',
			'**/jest.config.ts',
			'**/jest.config.cts'
		],
		languageOptions: {
			parserOptions: {
				project: ['./tsconfig.base.json', './apps/*/tsconfig.json'],
				tsconfigRootDir: import.meta.dirname
			}
		},
		rules: {
			'@typescript-eslint/no-unused-vars': 'warn'
		}
	},
	{
		files: [
			'**/*.spec.ts',
			'**/*.test.ts',
			'**/jest.config.ts',
			'**/jest.config.cts',
			'**/jest.preset.js',
			'**/webpack.config.js',
			'**/drizzle.config.ts',
			'eslint.config.mjs',
			'apps/admin/**/hooks.ts'
		],
		rules: {
			'@typescript-eslint/explicit-function-return-type': 'off',
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/naming-convention': 'off'
		}
	}
];
