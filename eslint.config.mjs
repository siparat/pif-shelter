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
					case: 'kebabCase'
				}
			],
			'check-file/folder-naming-convention': [
				'error',
				{
					'**/': 'KEBAB_CASE'
				}
			],
			'@typescript-eslint/no-explicit-any': 'error',
			'@typescript-eslint/explicit-function-return-type': [
				'error',
				{
					// for extracting dynamic auth object type
					allowedNames: ['createAuth'],
					allowExpressions: true,
					allowTypedFunctionExpressions: true,
					allowHigherOrderFunctions: true
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
			'@typescript-eslint/naming-convention': [
				'error',
				{
					selector: 'default',
					format: ['camelCase'],
					leadingUnderscore: 'allow',
					trailingUnderscore: 'allow'
				},
				{
					selector: 'variable',
					format: ['camelCase', 'UPPER_CASE'],
					leadingUnderscore: 'allow',
					trailingUnderscore: 'allow'
				},
				{
					selector: 'variable',
					modifiers: ['const', 'global'],
					format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
					leadingUnderscore: 'forbid'
				},
				{
					selector: 'objectLiteralProperty',
					format: ['camelCase', 'UPPER_CASE', 'snake_case']
				},
				{
					selector: 'variable',
					types: ['boolean'],
					format: ['camelCase'],
					custom: {
						regex: '^(is|has|can|should|must)[A-Z]',
						match: true
					}
				},
				{
					selector: 'typeLike',
					format: ['PascalCase']
				},
				{
					selector: 'interface',
					format: ['PascalCase'],
					custom: {
						regex: '^I[A-Z]',
						match: true
					}
				},
				{
					selector: 'enumMember',
					format: ['UPPER_CASE']
				},
				{
					selector: 'enum',
					format: ['PascalCase']
				}
			]
		}
	},
	{
		files: ['**/*.tsx', '**/*.jsx'],
		rules: {
			'@typescript-eslint/naming-convention': [
				'error',
				{
					selector: 'interface',
					format: ['PascalCase']
				}
			]
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
			'eslint.config.mjs'
		],
		rules: {
			'@typescript-eslint/explicit-function-return-type': 'off',
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/naming-convention': 'off'
		}
	}
];
