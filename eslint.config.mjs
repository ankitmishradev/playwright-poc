import eslint from '@eslint/js';
import playwright from 'eslint-plugin-playwright';
import prettierPluginRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
    {
        ignores: [
            'build',
            'node_modules',
            'eslint.config.mjs',
            'playwright-report/',
            'test-results/',
            'storage-state/'
        ]
    },
    {
        languageOptions: {
            globals: globals.node,
            parserOptions: {
                tsconfigRootDir: process.cwd(),
                project: './tsconfig.json'
            }
        }
    },
    eslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,

    {
        files: ['src/**/*.{js,mjs,cjs,ts}'],
        rules: {
            '@typescript-eslint/no-unsafe-enum-comparison': 'off',
            '@typescript-eslint/no-unsafe-call': 'off',
            '@typescript-eslint/no-unsafe-member-access': 'off',
            '@typescript-eslint/no-unsafe-argument': 'off',
            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/no-unsafe-return': 'off',
            '@typescript-eslint/no-namespace': 'off',
            '@typescript-eslint/no-redundant-type-constituents': 'off'
        }
    },

    {
        files: ['tests/**/*.ts'],
        ...playwright.configs['flat/recommended'],
        rules: {
            ...playwright.configs['flat/recommended'].rules,
            'playwright/no-skipped-test': 'warn',
            'playwright/no-focused-test': 'error',
            'playwright/no-wait-for-timeout': 'error',
            'playwright/prefer-web-first-assertions': 'error',
            'playwright/expect-expect': 'error'
        }
    },
    prettierPluginRecommended
];
