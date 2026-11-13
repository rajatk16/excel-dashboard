/** @type {import('prettier').Config} */
const config = {
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  quoteProps: 'as-needed',
  jsxSingleQuote: false,
  trailingComma: 'all',
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'always',
  endOfLine: 'lf',
  proseWrap: 'preserve',
  embeddedLanguageFormatting: 'auto',

  plugins: ['prettier-plugin-tailwindcss'],

  tailwindStylesheet: './apps/web/src/styles/globals.css',

  tailwindFunctions: ['cn', 'cva', 'clsx', 'twMerge'],

  overrides: [
    {
      files: ['*.json', '*.jsonc'],
      options: {
        tabWidth: 2,
      },
    },
    {
      files: ['*.yaml', '*.yml'],
      options: {
        tabWidth: 2,
        singleQuote: true,
      },
    },
    {
      files: ['*.md', '*.mdx'],
      options: {
        proseWrap: 'preserve',
      },
    },
  ],
};

export default config;
