import { defineConfig } from 'czg';

export default defineConfig({
  extends: ['@commitlint/config-conventional'],
  prompt: {
    alias: {
      ci: 'ci: update workflows',
      db: 'chore(db): update schema',
      deps: 'chore(deps): bump dependencies',
      docs: 'docs: update docs',
    },
    allowCustomScopes: false,
    allowEmptyScopes: true,
    scopes: [
      'career',
      'player',
      'catalog',
      'season',
      'transfer',
      'finance',
      'db',
      'ui',
      'routes',
      'config',
      'deps',
      'tooling',
      'tests',
      'scripts',
      'ci',
      'docs',
    ],
    skipQuestions: ['breaking', 'footer', 'issues'],
  },
  rules: {
    'body-max-line-length': [0, 'always'],
    'footer-max-line-length': [0, 'always'],
    'header-max-length': [2, 'always', 200],
  },
});
