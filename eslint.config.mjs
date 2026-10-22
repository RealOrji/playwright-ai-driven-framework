import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginPlaywright from 'eslint-plugin-playwright';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default defineConfig(
  {
    ignores: [
      'node_modules/',
      'test-results/',
      'playwright-report/',
      'blob-report/',
      'playwright/.auth/',
    ],
  },
  js.configs.recommended,
  tseslint.configs.strict,
  { languageOptions: { globals: globals.node } },
  {
    files: ['tests/**/*.ts', 'src/**/*.ts'],
    extends: [pluginPlaywright.configs['flat/recommended']],
    rules: {
      'playwright/expect-expect': ['warn', { assertFunctionPatterns: ['^assert', '^expect'] }],
      'playwright/no-force-option': 'error',
      'playwright/no-page-pause': 'error',
      'playwright/no-wait-for-timeout': 'error',
    },
  },
  prettier,
);
