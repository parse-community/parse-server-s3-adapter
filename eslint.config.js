const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  {
    ignores: ['coverage/*'],
  },
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        ...globals.node,
        Parse: 'readonly',
      },
    },
    rules: {
      indent: ['error', 2, { SwitchCase: 1 }],
      'linebreak-style': ['error', 'unix'],
      'no-trailing-spaces': 2,
      'eol-last': 2,
      'space-in-parens': ['error', 'never'],
      'no-multiple-empty-lines': 1,
      'prefer-const': 'error',
      'space-infix-ops': 'error',
      'no-useless-escape': 'off',
      'require-atomic-updates': 'off',
      'object-curly-spacing': ['error', 'always'],
      curly: ['error', 'all'],
      'block-spacing': ['error', 'always'],
    },
  },
  {
    files: ['spec/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jasmine,
        Parse: 'readonly',
        reconfigureServer: 'readonly',
        it_only_parse_server_version: 'readonly',
        fit_only_parse_server_version: 'readonly',
        describe_only_parse_server_version: 'readonly',
        fdescribe_only_parse_server_version: 'readonly',
      },
    },
    rules: {
      'no-console': 0,
      'no-var': 'error',
    },
  },
];
