// Análisis estático del frontend (capítulo 8, Guideline 8e).
//
// El plugin de React es necesario: sin él, la regla no-unused-vars no ve que
// un componente importado se usa dentro de JSX y marca todo como no usado.
import react from 'eslint-plugin-react';

export default [
  { ignores: ['dist/**', 'node_modules/**', 'coverage/**'] },
  {
    files: ['src/**/*.{js,jsx}'],
    plugins: { react },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { window: 'readonly', document: 'readonly', localStorage: 'readonly', fetch: 'readonly', console: 'readonly' },
    },
    settings: { react: { version: 'detect' } },
    rules: {
      ...react.configs.flat.recommended.rules,
      'react/react-in-jsx-scope': 'off', // no hace falta con el JSX moderno
      'react/prop-types': 'off',         // el proyecto no usa PropTypes
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
];
