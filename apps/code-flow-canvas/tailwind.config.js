const { createGlobPatternsForDependencies } = require('@nrwl/react/tailwind');
const dependencies = [
  ...createGlobPatternsForDependencies(__dirname, '/**/!(*.stories|*.spec).{tsx,ts,jsx,js,html,json}'),
];

console.log('tailwind dependencies', dependencies);

module.exports = {
  content: [
    './views/**/*.ejs',
    './src/**/*.{tsx,ts,js,jsx,json}',
    './data/modules/*.json',
    '../../data/*.json',
    './data/*.json',
    ...dependencies,
  ],
  theme: {
    extend: {},
  },
  variants: {},
  plugins: [],
  prefix: 'tw-',
};
