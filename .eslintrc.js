module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint/eslint-plugin',
    'unicorn',
    "i18next"
  ],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    "plugin:unicorn/recommended",
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'interface',
          format: ['PascalCase'],
          custom: {
            regex: '^I[A-Z]',
            match: true
          }
        }
      ],
    "unicorn/no-array-reduce": "off",
    "unicorn/no-array-for-each": "off",
    '@typescript-eslint/explicit-function-return-type': 2,
    '@typescript-eslint/explicit-module-boundary-types': 2,
    '@typescript-eslint/no-explicit-any': 2,
    'no-magic-numbers': ['error', { ignore: [0, 1] }],
    'i18next/no-literal-string': ['error', { mode: 'all' }],
  },
  overrides: [
    {
      files: ['**/constants.ts', '**/constants/**/*.ts', 'config/**/*.ts'],
      rules: {
        'no-magic-numbers': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        'unicorn/no-anonymous-default-export': 'off',
        'unicorn/no-anonymous-default-export': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
      }
    },
    { 
      files: ['**/*.spec.ts', '**/*-spec.ts', '**/app.end2End-spec'],
      rules: {
        'i18next/no-literal-string': 'off',
      }
    }
  ]
};
