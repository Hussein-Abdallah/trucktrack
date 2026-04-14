// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const reactNative = require('eslint-plugin-react-native');
const prettier = require('eslint-config-prettier');

module.exports = defineConfig([
  // ── Base: Expo config (includes TypeScript, React, React Hooks, import) ──
  ...expoConfig,

  // ── Ignores ──
  {
    ignores: ['dist/*', 'node_modules/*', '.expo/*', 'ios/*', 'android/*'],
  },

  // ── Global rules for all TS/TSX files ──
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'react-native': reactNative,
    },
    rules: {
      // TypeScript — enforce strict conventions from CLAUDE.md
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],

      // React Native
      'react-native/no-unused-styles': 'error',
      'react-native/no-inline-styles': 'error',
      'react-native/no-color-literals': 'error',
      'react-native/no-raw-text': 'off',

      // Code quality
      'no-console': 'warn',
      'no-nested-ternary': 'error',
      'object-shorthand': ['error', 'always'],
      eqeqeq: ['error', 'always'],

      // Import ordering
      'import/order': [
        'error',
        {
          groups: [['builtin', 'external'], 'internal', ['parent', 'sibling', 'index']],
          'newlines-between': 'always',
        },
      ],
    },
  },

  // ── App screens — stricter React rules ──
  {
    files: ['app/**/*.{ts,tsx}'],
    rules: {
      'react/jsx-key': 'error',
    },
  },

  // ── Supabase Edge Functions — Deno/server context ──
  {
    files: ['supabase/functions/**/*.ts'],
    rules: {
      'no-console': 'off',
    },
  },

  // ── Test files — relaxed rules ──
  {
    files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}', 'supabase/tests/**'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },

  // ── Prettier — must be last to disable conflicting formatting rules ──
  prettier,
]);
