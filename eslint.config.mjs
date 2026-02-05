import nx from '@nx/eslint-plugin';
import unicorn from 'eslint-plugin-unicorn';
import checkFile from 'eslint-plugin-check-file';

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: ['**/dist', '**/out-tsc', '**/migrations'],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    plugins: {
      unicorn,
      'check-file': checkFile,
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
              onlyDependOnLibsWithTags: ['*'],
            },
          ],
        },
      ],
      // 1.1. Files and Folders: kebab-case
      'unicorn/filename-case': [
        'error',
        {
          case: 'kebabCase',
        },
      ],
      'check-file/folder-naming-convention': [
        'error',
        {
          '**/': 'KEBAB_CASE',
        },
      ],
      // 1.2, 1.3, 1.5. Naming Conventions
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'default',
          format: ['camelCase'],
          leadingUnderscore: 'allow',
          trailingUnderscore: 'allow',
        },
        {
          selector: 'variable',
          format: ['camelCase', 'UPPER_CASE'],
          leadingUnderscore: 'allow',
          trailingUnderscore: 'allow',
        },
        // 1.4. Boolean values (is/has/can)
        {
          selector: 'variable',
          types: ['boolean'],
          format: ['camelCase'],
          custom: {
            regex: '^(is|has|can|should|must)[A-Z]',
            match: true,
          },
        },
        {
          selector: 'typeLike',
          format: ['PascalCase'],
        },
        // 1.2. Interfaces with I prefix (as per doc: interface IAnimalRepository)
        {
          selector: 'interface',
          format: ['PascalCase'],
          custom: {
            regex: '^I[A-Z]',
            match: true,
          },
        },
        {
          selector: 'enum',
          format: ['PascalCase'],
        },
      ],
      // 2.1. Strict Typing
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        {
          allowExpressions: true,
          allowTypedFunctionExpressions: true,
          allowHigherOrderFunctions: true,
        },
      ],
    },
  },
  {
    files: ['**/*.spec.ts', '**/*.test.ts', '**/jest.config.ts', '**/webpack.config.js'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];
