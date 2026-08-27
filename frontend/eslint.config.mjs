import { dirname } from 'path';
import { fileURLToPath } from 'url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';

const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
});

const config = [
  {
    ignores: ['.next/**', '**/dist/**', 'coverage/**', '**/*.jsx', '**/*.d.ts', 'src/data-contracts/**'],
  },
  js.configs.recommended,
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    plugins: {
      'react-refresh': reactRefresh,
    },
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
        ...globals.jest,
      },
    },
    rules: {
      'react-refresh/only-export-components': [
        'error',
        { allowExportNames: ['generateMetadata', 'generateStaticParams'] },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
];

export default config;
