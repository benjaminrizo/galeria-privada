// Análisis estático, igual en todos los repositorios (Guideline 8e).
const tseslint = require('typescript-eslint');

module.exports = tseslint.config(
  { ignores: ['dist/**', 'coverage/**'] },
  ...tseslint.configs.recommended,
  { rules: { '@typescript-eslint/no-explicit-any': 'off' } },
);
