import js from '@eslint/js';
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';

const config = [
  {
    ignores: ['.next/**', '**/dist/**', 'coverage/**', '**/*.jsx', '**/*.d.ts', 'src/data-contracts/**'],
  },
  js.configs.recommended,
  ...nextCoreWebVitals,
  ...nextTypescript,
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
      'react-hooks/set-state-in-effect': 'off',
    },
  },
];

export default config;
