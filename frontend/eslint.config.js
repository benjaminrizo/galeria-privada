// Análisis estático del frontend (Guideline 8e).
// El plugin de React hace falta para que entienda el JSX; sin él cree que
// todos los componentes importados están sin usar.
import react from 'eslint-plugin-react';

export default [
  { ignores: ['dist/**', 'coverage/**'] },
  {
    files: ['src/**/*.{js,jsx}'],
    plugins: { react },
    languageOptions: { ecmaVersion: 2022, sourceType: 'module', parserOptions: { ecmaFeatures: { jsx: true } } },
    settings: { react: { version: 'detect' } },
    rules: { 'react/jsx-uses-vars': 'error', 'no-unused-vars': 'error' },
  },
];
